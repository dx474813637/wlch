<template>
	<view class="w" :style="{
		paddingTop: offsetTop+'px'
	}">
		<u-navbar 
			:bgColor="bgColor" 
			@leftClick="handleNavLeftClick"
		>
			<template v-slot:center >
				<u-tabs
					:list="tabs" 
					:current="current" 
					@click="handleTabsClick" 
					lineHeight="0"
					:scrollable="false"
					:activeStyle="activeStyle"
					:inactiveStyle="inactiveStyle"
				></u-tabs>
			</template>
		</u-navbar>
		<view class="cz-main">
			<unicloud-db
				v-slot:default="{data, loading, hasMore, error, options}"
				collection="creation, uni-id-users"
				:where="where"
				ref="udb"
				getone
				field="type,title,avatar,content,huaban_imgs,comment_count,huaban_status,view_count,like_count,publish_date,category_id,industry_id,user_id{avatar, nickname, avatar_file}"
				loadtime="manual"
				action="czViewCountAdd"
				:options="options"
				@load="handleCzLoad"
			>	
				<view v-if="error">
					<u-empty
						marginTop="40"
						mode="list"
						text="请求出错了"
						icon="../../../../static/empty.png"
					>
					</u-empty>
				</view>
				<view v-else-if="loading" >
					<u-loading-page :loading="loading" loading-text="loading..."></u-loading-page>
				</view>
				<view v-else >
					
					<view class="cz-avatar" v-if="data && data.avatar">
						<img class="img-w" mode="widthFix" :src="data.avatar"  />
					</view>
					<view class="cz-title" ref="title">{{data.title}}</view>
					<view class="cz-author" v-if="data">
						<wlch-author-card
							:uid="data.user_id[0]._id"
							:name="data.user_id[0].nickname"
							:avatar="data.user_id[0].avatar_file.url"
							:postTime="data.publish_date"
						></wlch-author-card>
					</view>
					<view class="cz-imgs" v-if="cz.huaban_imgs && cz.huaban_imgs.length > 0">
						<u-album 
							:urls="cz.huaban_imgs" 
							multipleMode="widthFix"
							keyName="url" 
							rowCount="1"
							space="0"
							:multipleSize="multipleSize"
							:singleSize="multipleSize"
						></u-album>
					</view>
					<view class="cz-content">
						<u-parse :content="data.content"></u-parse>
						<!-- {{data.content}} -->
					</view>
				</view>
				
			</unicloud-db>
			<unicloud-db
				v-slot:default="{data, loading, hasMore, error, options}"
				collection="creation-comments, uni-id-users"
				:where="`cz_id=='${id}'&&comment_type==0`"
				ref="udb_comments"
				getcount
				field="comment_content,comment_date,comment_type,like_count,reply_comment_id,reply_user_id{avatar, nickname, avatar_file},user_id{avatar, nickname, avatar_file}"
				loadtime="manual"
				:page-size="10"
				orderby="comment_date desc"
				@load="handleCommentsLoad"
			>
				<template v-if="commentShow">
					<view v-if="error">
						<u-empty
							marginTop="40"
							mode="list"
							text="出错了"
							icon="../../../../static/empty.png"
						>
						</u-empty>
					</view>
					<view v-else class="cz-comment" :style="{paddingTop: offsetTop+'px'}" >
						<view class="box-title u-flex u-flex-items-center">
							<view>评论区
							<template v-if="commentsData.count">
								（{{commentsData.count}}）
							</template>
							</view>
							<u-loading-icon :show="loading" size="20" mode="circle"></u-loading-icon>
						</view>
						<view class="box-content">
							<template v-if="!loading && data.length == 0">
								<u-empty
									marginTop="40"
									mode="list"
									text="暂无评论"
									icon="http://cdn.uviewui.com/uview/empty/list.png"
								>
								</u-empty>
							</template>
							<template v-else >
								<view class="comments-list">
									<view class="item" 
										v-for="(item, index) in data"
										:key="item._id"
									>	 
										
										<comments-card
											:postTime="item.comment_date"
											:cid="item._id"
											:czid="id"
											:uid="item.user_id[0]._id"
											:user_info="item.user_id[0]"
											:content="item.comment_content"
											:like_count="item.like_count"
											:isLike="item.isLike"
											@likeClick="handleLikeClick"
										></comments-card>
									</view>
								</view>
								<u-loadmore
									line
									:status="handleSetLoadStatus(hasMore, loading)" 
									:loading-text="loadingText" 
									:loadmore-text="loadmoreText" 
									:nomore-text="nomoreText" 
									@loadmore="handleGetData"
									height="60px"
									color="#999"
								/>
							</template>
						</view>
						
						
					</view>
				</template>
				
			</unicloud-db>
			<u-safe-bottom></u-safe-bottom>
			
		</view>
		<view class="tabbar">
			<div class="tabbar-w u-flex u-flex-items-center">
				<view class="like-btn u-flex u-flex-items-center u-flex-center" @click="handleCzLikeBtn">
					<u-badge 
						numberType="limit" 
						type="error" 
						max="99" 
						:value="cz.like_count"
						absolute
						:offset="[-5, -5]"
					></u-badge>
					<i class="iconfont-wlch" :class="{
						'icon-wlch-appreciate_light': !cz.isLike,
						'icon-wlch-appreciate_fill_light': cz.isLike,
						'liked': cz.isLike
					}"></i>
				</view>
				<view class="input-w" @click="handleClickCommentsW">评论一下吧...</view>
			</div>
			
			<u-safe-bottom></u-safe-bottom>
		</view>
		<u-popup 
			:show="commentsShow" 
			mode="bottom"  
			@close="commentsClose"
			overlayOpacity="0.3"
		>
		    <view class="comments-w">
				<comments
					:prompt="prompt"
					:replyObj="replyObj"
					:timestamp="timestamp"
					@submit="handleSubmitComments"
					@close="commentsShow = false"
				></comments>
			</view>
		</u-popup>
	</view>

</template>

<script>
	const db = uniCloud.database();
	import {
		mapMutations,
		mapActions,
		mapGetters,
		mapState
	} from 'vuex';
	export default {
		data() {
			return {
				id: '',
				current: 0,
				commentShow: false,
				timestamp: new Date().getTime(),
				tabs: [
					{
						name: '内容',
					},
					{
						name: '评论',
					}
				],
				inactiveStyle: {},
				activeStyle: {
					color: '#000',
					fontWeight: 'bold',
				},
				offsetTop: uni.getSystemInfoSync().safeArea.top + 44,
				options: {},
				cz: {},
				bgColor: 'rgba(255,255,255,1)',
				multipleSize: uni.getSystemInfoSync().windowWidth - 10,
				loadingText: '努力加载中',
				loadmoreText: '上拉或点击加载更多',
				nomoreText: '实在没有了',
				commentsShow: false,
				prompt: '',
				replyObj: {},
				commentsData: {},
				userLikeList: [],
			};
		},
		onLoad(opt) {
			if(opt.hasOwnProperty('id')) {
				this.id = opt.id
			}else {
				uni.showToast({
					title: '参数有误',
					success() {
						setTimeout(() => {
							uni.navigateBack()
						}, 1500)
					}
				})
				return
			}
			console.log(this.userInfo)
			
		},
		onReachBottom() {
			this.$refs.udb_comments.loadMore()
		},
		async onReady() {
			
			if (this.id) {
				this.$refs.udb.loadData()
				// await this.getCzLike()
				this.$refs.udb_comments.loadData();
			}
			console.log(this.$refs)
		},
		watch: {
			// userInfo: {
			// 	handler(n) {
			// 		this.checkeLikeStatus('cz_like')
			// 	},
			// 	deep: true,
			// 	immediate: true,
			// }
		},
		computed: {
			...mapGetters({
				indexMenus: 'menuList/indexMenus',
				userInfo: 'user/info',
			}),
			where() {
				return {
					_id: this.id
				}
			}
		},
		methods: {
			...mapMutations({
				setInfo: 'user/login'
			}),
			checkeLikeStatus(key) {
				let arr = this.userInfo[key] || []
				let czLike = arr.some(ele => ele == this.id)
				console.log(czLike)
				if(key == 'cz_like') {
					this.$set(this.cz, 'isLike', czLike)
				}else {
					
				}
			},
			async getElInfo(dom) {
				return await this.$u.getRect(dom)
			},
			async getCzLike() {
				const {result} = await db.collection('creation-favorite')
									.where(`user_id==$cloudEnv_uid&&cz_id=="${this.id}"`)
									.get()
				if(result.code == 0) {
					console.log(result)
					this.userLikeList = result.data;
					result.data.some(ele => ele.comment_id == "-1") && this.$set(this.cz, 'isLike', true)
				}
			},
			handleGetData() {
				console.log('get')
			},
			handleNavLeftClick() {
				if(getCurrentPages().length > 1) {
					uni.navigateBack()
				}else {
					uni.redirectTo({
						url: '/pages/czList/czList'
					})
				}
			},
			handleSetLoadStatus(hasMore, loading) {
				if(loading) return 'loading'
				
				if(hasMore) return 'loadmore'
				
				return 'nomore'
			},
			async handleCzLikeBtn() {
				let userCzLike = uni.$u.deepClone(this.userInfo.cz_like) || []
				if(!this.cz.isLike) {
					if(userCzLike.includes(this.id)) return
					const {result} = await db.action('likeCountUpdate')
					.collection('creation-favorite')
					.add({
						cz_id: this.id,
						auth_id: this.cz.user_id[0]._id,
						comment_id: "-1"
					})
					// console.log(result)
					if(result.code == 0) {
						uni.showToast({
							title: '成功点赞',
							icon: 'none'
						})
						userCzLike.push(this.id)
						this.cz.isLike = true
						this.cz.like_count ++
					}
				}else {
					if(!userCzLike.includes(this.id)) return
					const {result} = await db.action('likeCountUpdate')
					.collection('creation-favorite')
					.where({
						cz_id: this.id,
						comment_id: "-1",
						auth_id: this.cz.user_id[0]._id,
						user_id: db.getCloudEnv('$cloudEnv_uid')
					}).remove()
					if(result.code == 0) {
						uni.showToast({
							title: '取消点赞',
							icon: 'none'
						})
						let i = userCzLike.indexOf(this.id)
						if(i != -1) {
							userCzLike.splice(i, 1)
						}
						this.cz.isLike = false
						this.cz.like_count --
					}
				}
				this.setInfo({cz_like: userCzLike})
			},
			async handleLikeClick(obj) {
				let commentsLike = uni.$u.deepClone(this.userInfo.comments_like) || []
				if(obj.like) {
					if(commentsLike.includes(obj.id)) return
					const {result} = await db.action('likeCountUpdate')
					.collection('creation-favorite')
					.add({
						cz_id: this.id,
						auth_id: obj.uid,
						comment_id: obj.id
					})
					console.log(result)
					if(result.code == 0) {
						uni.showToast({
							title: '成功点赞',
							icon: 'none'
						})
						commentsLike.unshift(obj.id)
						// this.userLikeList.push({
						// 	cz_id: this.id,
						// 	comment_id: obj.id
						// })
					}
					
				}else {
					if(!commentsLike.includes(obj.id)) return
					const {result} = await db.action('likeCountUpdate')
					.collection('creation-favorite')
					.where({
						cz_id: this.id,
						auth_id: obj.uid,
						comment_id: obj.id,
						user_id: db.getCloudEnv('$cloudEnv_uid')
					}).remove()
					if(result.code == 0) {
						uni.showToast({
							title: '取消点赞',
							icon: 'none'
						})
						let i = commentsLike.indexOf(obj.id)
						if(i != -1) {
							commentsLike.splice(i, 1)
						}
						// let i
						// this.userLikeList.some((ele, index) => {
						// 	if(ele.comment_id == obj.id) {
						// 		i = index
						// 		return true
						// 	}
						// 	return false
						// })
						// this.userLikeList.splice(i, 1)
					}
					
				}
				this.setInfo({comments_like: commentsLike})
				
				this.$refs.udb_comments.dataList.forEach(ele => {
					if(ele._id == obj.id) {
						ele.isLike = !ele.isLike
						ele.isLike ? ele.like_count ++ : ele.like_count --
					}
				})
				// this.$nextTick(() => {
				// 	this.$refs.udb_comments.loadData({
				// 		clear: true
				// 	})
				// })
				
			},
			async handleTabsClick(e) {
				this.current = e.index
				let el
				if(e.index == 0) {
					el = '.cz-title'
				}else if(e.index == 1) {
					el = '.cz-comment'
				}
				
				uni.pageScrollTo({
					selector: el,
					duration: 300
				});
			},
			handleCzLoad(data) {
				this.cz = {...data, ...this.cz};
				this.checkeLikeStatus('cz_like')
				this.commentShow = true;
			},
			handleCommentsLoad(data, ended, pagination) {
				console.log(data, ended, pagination)
				let arr = this.userInfo.comments_like || []
				data.forEach(ele => {
					ele.isLike = arr.includes(ele._id)
				})
				this.commentsData = pagination
				// let arr = data.filter(ele => {
				// 	if(ele.comment_type == 0) {
				// 		ele.reply_list = []
				// 		return true
				// 	}
				// 	return false
				// })
				// data.filter(ele => ele.comment_type != 0).forEach(ele => {
				// 	let i = -1
				// 	arr.some((item, index) => {
				// 		if(item._id == ele.reply_comment_id) {
				// 			i = index
				// 			return true
				// 		}
				// 		return false
				// 	})
				// 	i != -1 && arr[i].reply_list.push(ele)
				// })
				// data = arr
				// console.log(arr)
			},
			handleClickCommentsW() {
				this.replyObj = {comment_type:0}
				this.commentsShow = true;
			},
			commentsClose() {
				this.commentsShow = false
			},
			handleReply(obj) {
				this.replyObj = obj
				this.commentsShow = true
			},
			async handleSubmitComments({comments, replyObj}) {
				// console.log(comments)
				uni.showLoading()
				const {result} = await db.action('czCommentsCountAdd').collection('creation-comments').add({
					cz_id: this.id,
					comment_content: comments,
					comment_type: replyObj.comment_type,
					like_count: 0,
					reply_comment_id: replyObj.reply_comment_id?replyObj.reply_comment_id: '',
					reply_user_id: replyObj.reply_user_id?replyObj.reply_user_id: '',
					
				})
				uni.hideLoading()
				// console.log(result)
				if(result.code == 0 && result.id) {
					this.commentsClose()
					this.$nextTick(() => {
						this.$refs.udb_comments.loadData({
							clear: true
						})
					})
					this.timestamp = new Date().getTime()
					uni.showToast({
						title: '评论成功',
						icon: 'none'
					})
					uni.pageScrollTo({
						selector: '.cz-comment',
						duration: 300
					})
				}else {
					uni.showToast({
						title: result.message,
						icon: 'none'
					})
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.comments-w {
		padding: 10px;
	}
	.comments-list {
		.item {
			padding-bottom: 15px;
			margin-bottom: 10px;
			border-bottom: 1rpx solid #f8f8f8;
		}
	}
	.cz-main {
		padding-bottom: 60px;
		/deep/ {
			.u-loading-page {
				z-index: 10;
			}
		}
		.cz-avatar {
			width: 100%;
			max-height: 50vh;
			overflow: auto;
			.img-w {
				width: 100%;
			}
			
		}
		.cz-title {
			line-height: 25px;
			font-size: 20px;
			font-weight: bold;
			padding: 10px 15px;
			color: #333;
		}
		.cz-author {
			padding: 5px 10px;
		}
		.cz-imgs {
			padding: 10px 5px;
			margin: 15px 0;
		}
		.cz-content {
			padding: 10px 15px;
			line-height: 25px;
			margin-bottom: 40px;
		}
		.cz-comment {
			padding: 0 5px;
			.box-title {
				line-height: 40px;
				font-weight: bold;
				padding-left: 10px;
				margin-bottom: 20px;
				
			}
			.box-content {
				min-height: 50vh;
			}
		}
	}
	.tabbar {
		position: fixed;
		left: 0;
		bottom: 0;
		padding: 10px 15px ;
		background-color: #fff;
		border-top: 1rpx solid #e7e7e7;
		width: 100%;
		box-sizing: border-box;
		.tabbar-w {
			width: 100%;
			height: 100%;
		}
		.like-btn {
			flex: 0 0 30px;
			width: 30px;
			height: 100%;
			margin-right: 10px;
			position: relative;
			.iconfont-wlch {
				font-size: 22px;
				color: #666;
				&.liked {
					color: $theme-color;
				}
			}
		}
		.input-w {
			height: 30px;
			flex: 1;
			border-radius: 20px;
			background-color: #f8f8f8;
			border: 1rpx solid #e7e7e7;
			line-height: 35px;
			padding: 0 18px;
			color: #999;
			font-size: 12px;
		}
	}
</style>
