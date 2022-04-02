<template>
	<view class="page-w">
		<u-navbar
			:bgColor="navBarBgColor"
			color="#000"
			:statusBar="true"
			:leftIcon="navBarLeftIcon"
			autoBack 
			:height="navBarH"
			:title="navBartitle"
		></u-navbar>
		<view class="home-header">
			<u-status-bar></u-status-bar>
			<view class="home-card">
				<view class="home-card-header u-flex u-flex-between u-flex-items-center">
					<view class="item-left">
						<view class="left-img">
							<cloud-image mode="scaleToFill" radius="50%" width="130rpx" height="130rpx" v-if="user.avatar_file&&user.avatar_file.url" :src="user.avatar_file.url"></cloud-image>
							<image v-else class="logo-img" src="@/static/uni-center/defaultAvatarUrl.png"></image>
						</view>
					</view>
					<view class="item-right u-flex">
						<view class="right-box">
							<view class="box-label">获赞</view>
							<view class="box-content">{{user.blike_num || 0}}</view>
						</view>
						<view class="right-box">
							<view class="box-label">点赞</view>
							<view class="box-content">{{user.like_num || 0}}</view>
						</view>
						<view class="right-box">
							<view class="box-label">关注</view>
							<view class="box-content">{{user.follow_num || 0}}</view>
						</view>
						<view class="right-box">
							<view class="box-label">粉丝</view>
							<view class="box-content">{{user.bfollow_num || 0}}</view>
						</view>
					</view>
				</view>
				<view class="home-card-info u-flex u-flex-items-center u-flex-between">
					<view class="item-left u-flex u-flex-items-center">
						<view class="info-name">{{user.nickname}}</view>
					</view>
					<view class="item-right u-flex u-flex-items-center">
						<template v-if="uid != userInfo._id">
							<u-button 
								@click="handleFollow" 
								:plain="(userInfo.follow_user || []).includes(uid)"
								:text="(userInfo.follow_user || []).includes(uid)? '已关注' :'关注'" 
								size="small" 
								shape="circle" 
								type="primary" 
								:custom-style="{height: '26px', minWidth: '70px'}"
							></u-button>
						</template>
						
					</view>
				</view>
			</view>
		</view>
		<view class="home-content">
			
			<u-sticky
				:offsetTop="offsetTop"
			>	
				<view class="tabs-w">
					<view class="tabs1-w" :class="{
						'active': stickyActive
					}">
						<u-tabs
							ref="tabs1"
							:list="tabsList"
							@click="tabsClick" 
							:scrollable="false"
							lineColor="#2567fb"
							lineWidth="30"
							lineHeight="2"
							:activeStyle="{color: '#333'}"
							:inactiveStyle="{color:'#999'}"
							keyName="title"
							:current="current1"
						></u-tabs>
						
					</view>
					<view class="tabs2-w" :class="{
						hide: !fixedShow
					}" v-if="tabsList[current1].name == 'cz'">
						<u-tabs 
							:list="tabsList2"
							@click="tabs2Click"
							:activeStyle="activeStyle"
							:inactiveStyle="inactiveStyle"
							:itemStyle="itemStyle"
							keyName="title"
							lineHeight="0"
							:current="current1_index"
						></u-tabs>
					</view>
				</view>
				
			</u-sticky>
				
			<view class="swiper-w" :style="{
				height: tabsList[current1].swiperH
			}">
				<swiper
					class="swiper"
					:current="current1"
					@change="handleSwiperChange"
				>
					<swiper-item class="swiper-item">
						<unicloud-db
							ref="udb_cz"
							v-slot:default="{data, pagination, loading, hasMore, error, options}"
							collection="creation"
							loadtime="manual"
							@load="handleCzLoad"
							:where="czWhere"
							orderby="publish_date desc"
							:page-size="10"
							getcount
						>
							
							<view v-if="error">
								<u-empty
									marginTop="40"
									icon="../../../../static/empty.png"
									text="系统出错了"
								>
								</u-empty>
							</view>
							
							<view v-else>
								
								<view class="c-item" v-for="(item, index) in data" :key="item._id">
									<template v-if="item.type == 1">
										<wlch-hb-card
											:cid="item._id"
											:imgs="item.huaban_imgs.map(ele => ele.url)"
											:indexArr="[0, index]"
											:desc="item.content"
											:likeNum="item.like_count"
											:commentsNum="item.comment_count"
											:postTime="item.publish_date"
											:userInfo="user"
											@cardHeight="handleCardHeight"
											@detail="handGoDetail"
											noAuthHome
										></wlch-hb-card>
									</template>
									<template v-if="item.type == 2">
										<wlch-news-card
											:cid="item._id"
											:indexArr="[0, index]"
											:avatar="item.avatar"
											:content="item.content"
											:title="item.title"
											:likeNum="item.like_count"
											:commentsNum="item.comment_count"
											:postTime="item.publish_date"
											:userInfo="user"
											@cardHeight="handleCardHeight"
											@detail="handGoDetail"
											noAuthHome
										></wlch-news-card>
									</template>
									
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
							</view>
						</unicloud-db>
					</swiper-item>
					<swiper-item class="swiper-item">
							
						<unicloud-db
							ref="udb_dt"
							v-slot:default="{data, pagination, loading, hasMore, error, options}"
							collection="creation-favorite, creation, creation-comments"
							field="cz_id{type, title}, comment_id{comment_content}, create_date"
							loadtime="manual"
							@load="handleDtLoad"
							:where="dtWhere"
							orderby="publish_date desc"
							:page-size="10"
							getcount
						>
							<view v-if="error">
								<u-empty
									marginTop="40"
									icon="../../../../static/empty.png"
									text="系统出错了"
								>
								</u-empty>
							</view>
							
							<view v-else>
								<view class="d-item" v-for="(item, index) in data" :key="item._id">
									<wlch-dt-card
										:indexArr="[1, index]"
										:time="item.create_date"
										:cz_title="item.cz_id[0].title"
										:cz_type="item.cz_id[0].type"
										:cz_comment="item.comment_id[0].comment_content"
										@cardHeight="handleCardHeight"
									></wlch-dt-card>
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
							</view>
						</unicloud-db>
					</swiper-item>
				</swiper>
			</view>
			
			
		</view>
		
		
	</view>
</template>

<script>
	const db = uniCloud.database();
	
	import {
		mapMutations,
		mapGetters
	} from 'vuex';
	export default {
		data() {
			return {
				uid: '',
				user: {},
				navBartitle: '',
				navBarBgColor: 'transparent',
				navBarLeftIcon: 'arrow-left',
				stickyActive: false,
				fixedShow: true,
				psize: 10,
				tabsList: [
					{
						name: 'cz',
						title: '创作',
						list: [],
						swiperH: '100vh',
						loadStatus: 'loadmore',
						p: 1,
						loading: false,
					},
					{
						name: 'dt',
						title: '动态',
						list: [],
						swiperH: '100vh',
						loadStatus: 'loadmore',
						p: 1,
						loading: false,
					},
					// {
					// 	name: 'zt',
					// 	title: '赞同',
					// 	list: [],
					// 	swiperH: '100vh',
					// 	loadStatus: 'loadmore',
					// 	p: 1,
					// 	loading: false,
					// },
				],
				itemStyle: {
					height: '40px',
					padding: '0 10px'
				},
				activeStyle: {
					color: '#333',
					backgroundColor: '#f2f2f2',
					borderRadius: '20rpx',
					lineHeight: '46rpx',
					padding: '0 16rpx',
					fontWeight: '700'
				},
				inactiveStyle: {
					color: '#999',
					padding: '0 16rpx',
				},
				current1: 0,
				current1_index: 0,
				tabsList2: [
					{
						name: 'all',
						title: '全部',
					},
					{
						name: 'hb',
						title: '画板',
						type: 1,
					},
					{
						name: 'wz',
						title: '文章',
						type: 2,
					}
				],
				offsetTop: 0,
				navBarH: 44,
				lastScrollTop: 0,
				sys: uni.getSystemInfoSync(),
				loadingText: '努力加载中',
				loadmoreText: '上拉或点击加载更多',
				nomoreText: '实在没有了',
			};
		},
		watch: {
			current1: {
				handler: function(newV) {
					// this.getData()
					if(newV == 1) {
						this.$nextTick(() => {
							if(this.$refs.udb_dt.dataList.length == 0 && !this.$refs.udb_dt.loading) {
								this.$refs.udb_dt.loadData()
							}
							
						})
					}
				},
			},
			current1_index: {
				handler: function(newV) {
					// this.getData()
					this.$nextTick(() => {
						
						this.$refs.udb_cz.reset()
						this.$refs.udb_cz.clear()
						// console.log(this.$refs.udb_cz)
						this.$refs.udb_cz.loadData()
					})
				},
			},
		},
		onPageScroll(e) {
			let h = this.$refs.tabs1.tabsRect.top
			
			if(e.scrollTop >= (h - this.offsetTop)) {
				this.navBarBgColor = '#ffffff'
				this.navBartitle = this.user.nickname
				this.stickyActive = true
				if(this.lastScrollTop < e.scrollTop && this.fixedShow) {
					uni.$u.throttle(() => {
						this.fixedShow = false
					}, 1000)
				}else if(this.lastScrollTop > e.scrollTop && !this.fixedShow) {
					uni.$u.throttle(() => {
						this.fixedShow = true
					}, 1000)
				}
			}else {
				this.navBarBgColor = 'transparent'
				this.navBartitle = ''
				this.stickyActive = false
				this.fixedShow = true
			}
			this.lastScrollTop = e.scrollTop
			
		},
		onReachBottom() {
			this.$refs.udb_cz.loadMore()
		},
		onReady() {
			
			this.$refs.udb_cz.loadData({clear: true})
		},
		onLoad(opt) {
			if(opt.hasOwnProperty('uid')) {
				this.uid = opt.uid
			}else {
				this.uid = this.userInfo._id
			}
			
			this.init()
		},
		computed: {
			...mapGetters({
				userInfo: 'user/info',
				login: 'user/hasLogin'
			}),
			czWhere() {
				let normal = {
					user_id: this.uid,
					status: 1,
				}
				let filter = {}
				if(this.current1_index != 0) {
					filter.type = this.tabsList2[this.current1_index].type
				}
				console.log(filter)
				return {
					...normal,
					...filter
				}
			},
			dtWhere() {
				return {
					user_id: this.uid
				}
			}
		},
		methods: {
			...mapMutations({
				setInfo: 'user/login'
			}),
			async init() {
				this.initStickyTop()
				this.getUserData()
			},
			async getUserData() {
				const {result} = await db.collection('uni-id-users').doc(this.uid)
				.field('avatar_file, nickname, like_num, blike_num, bfollow_num, follow_num')
				.get({getOne: true})
				this.user = result.data
				console.log(result)
			},
			handleSetLoadStatus(hasMore, loading) {
				if(loading) return 'loading'
				
				if(hasMore) return 'loadmore'
				
				return 'nomore'
			},
			handleCzLoad(data, ended, pagination) {
				// console.log(data, ended, pagination);
				// console.log(this.$refs.udb_cz.dataList);
				this.tabsList[0].list = [...this.tabsList[0].list, ...data]
				// console.log(this.tabsList[this.current1].list)
			},
			handleDtLoad(data, ended, pagination) {
				console.log(data)
				this.tabsList[1].list = [...this.tabsList[1].list, ...data]
			},
			async handleFollow() {
				const followCol = db.action('followCountUpdate').collection('follow')
				let follow_user = uni.$u.deepClone(this.userInfo.follow_user) || []
				let i = (this.userInfo.follow_user || []).indexOf(this.uid)
				if(i != -1) {
					const {result} = await followCol.where({
						user_id: this.userInfo._id,
						auth_id: this.uid
					}).remove()
					follow_user.splice(i, 1)
				}else {
					const {result} = await followCol.add({
						user_id: this.userInfo._id,
						auth_id: this.uid
					})
					follow_user.unshift(this.uid)
				}
				i == -1? this.user.bfollow_num ++ : this.user.bfollow_num--
				this.setInfo({follow_user})
				uni.showToast({
					title: i != -1 ? '取消关注': '关注成功',
					icon: 'none'
				})
				
			},
			initStickyTop() {
				const {safeArea} = uni.getSystemInfoSync()
				this.offsetTop = this.navBarH + safeArea.top
			},
			handleClickLeft() {
				console.log('handleClickLeft')
			},
			tabs2Click(e) {
				console.log(e)
				this.current1_index = e.index
			},
			tabsClick(e) {
				console.log(e)
				this.current1 = e.index
			},
			handleSwiperChange(e) {
				if(this.current1 == e.detail.current) return
				console.log(e)
				this.current1 = e.detail.current
			},
			handGoDetail({cid}) {
				// console.log(hid)
				uni.navigateTo({
					url: `/pages/czList/czDetail?id=${cid}`
				})
			},
			handleCardHeight(obj) {
				console.log(obj)
				if(!this.tabsList[obj.indexArr[0]].list[obj.indexArr[1]]) return
				this.$set(this.tabsList[obj.indexArr[0]].list[obj.indexArr[1]], 'h', obj.h)
				this.changeSwiperItemH(obj.indexArr[0])
			},
			changeSwiperItemH(index) {
				let h = this.tabsList[index].list.reduce((sum, item) => {
					return sum + (item.h ? item.h : 0) + 12
				}, 0) + 60
				// console.log(h , this.sys.screenHeight)
				this.tabsList[index].swiperH = (h < this.sys.screenHeight? this.sys.screenHeight - this.offsetTop - this.navBarH : h) + 'px'
			},
			handleGetData() {
				console.log('get')
			}
		}
	}
</script>

<style lang="scss">
	page {
		background-color: #f8f8f8;
	}
</style>
<style lang="scss" scoped>
	.page-w {
		 /deep/ .u-navbar {
			.u-navbar__content {
				transition: all .3s;
			}
		}
		.home-header {
			padding-top: 80px;
			background-image: url('../../../static/uni-center/headers.png');
			.home-card {
				background-color: #fff;
				border-radius: 15px 15px 0 0;
				min-height: 120px;
				padding-bottom: 15px;
				.home-card-header {
					padding: 5px 15px 0;
					height: 60px;
					.item-left {
						.left-img {
							position: relative;
							top: -10px;
							border: 2px solid #fff;
							border-radius: 50%;
							.logo-img {
								width: 130rpx;
								height: 130rpx;
								border-radius: 50%;
							}
						}
					}
					.item-right {
						.right-box {
							text-align: center;
							padding: 0 8px;
							.box-label {
								font-size: 22rpx;
								color: #999;
							}
							.box-content {
								font-size: 28rpx;
								font-weight: bold;
							}
						}
					}
				}
				.home-card-info {
					height: 40px;
					padding: 0 15px;
					.item-left {
						.info-name {
							font-weight: bold;
							font-size: 17px;
						}
					}
					.item-right {
						
					}
				}
			}
		}
		.home-content {
			background-color: #fff;
			.tabs-w {
				// background-color: #fff;
			}
			.tabs1-w {
				position: relative;
				z-index: 20;
				border-radius: 10px 10px 0 0;
				border-top: 0;
				box-shadow: 0 -5px 5px rgba(0,0,0,.1);
				background-color: #fff;
				&.active {
					box-shadow: none;
					border-top: 1rpx solid #e7e7e7;
					border-radius: 0;
				}
				/deep/ .u-tabs {
					border-bottom: 1rpx solid #e7e7e7;
					.u-tabs__wrapper__nav__item {
						flex: 1
					}
					.u-tabs__wrapper__nav__line {
						bottom: 0;
					}
				}
			}
			.tabs2-w {
				position: relative;
				z-index: 10;
				margin-top: 0;
				transition: all .3s;
				opacity: 1;
				// transform: translateY(0);
				&.hide {
					margin-top: -42px;
					opacity: .7;
					// transform: translateY(-100%);
					// animation: st .4s;
				}
				/deep/ .u-tabs {
					background-color: #fff;
					border-bottom: 1rpx solid #e7e7e7;
					.u-tabs__wrapper__nav__item__text {
						font-size: 24rpx;
						transition: all .3s;
					}
				}
			}
			.swiper-w {
				background-color: #f8f8f8;
				.swiper {
					height: 100%;
					.swiper-item {
						height: 100%;
						// display: flex;
						// flex-direction: column;
						.c-item {
							margin-bottom: 12px;
						}
						.d-item {
							margin-bottom: 0;
							padding: 5px;
						}
						.swiper-item-content {
							// flex: 1;
							// background-color: #eee;
						}
						
					}
				}
			}
		}
	}
	@keyframes st {
		0% {
			transform: translateY(0);
		}
		100% {
			transform: translateY(-100%);
		}
	}
</style>
