<template>
	<view>
		<u-navbar>
			<template v-slot:left>
				<view class="header-w u-flex u-flex-items-center">
					<navigator url="/pages/czList/czSearch" class="item item-search">
						<i class="icon-wlch-search iconfont-wlch"></i>
					</navigator>
					<view class="item item-tabs" :style="{
						width: tabsWidth
					}">
						<u-tabs 
							:list="menus" 
							:current="current" 
							@click="handleTabsClick" 
							:inactiveStyle="inactiveStyle"
							:activeStyle="activeStyle"
							:itemStyle="itemStyle"
							:lineWidth="lineWidth"
							lineHeight="5"
						></u-tabs>
					</view>
				</view>
			</template>	
		</u-navbar>
		<view class="content-w" >
			
			<swiper 
				v-if="menus[current]"
				class="c-swiper" :style="{
					height:  menus[current].swiperH  ,
					paddingTop: offsetTop+'px'
				}"
				:current="current"
				@change="handleChangeSwiper"
			>
				<swiper-item
					class="swiper-item"
					v-for="(ele, i) in menus"
					:key="ele.menu_id"
				>
					<scroll-view 
						scroll-y
						class="swiper-scroll"
						refresher-enabled	
						:refresher-triggered="ele.loading"
						@refresherrefresh="handleRefresh(i)"
						@scrolltolower="handleLoad(i)"
					>
					
						<unicloud-db 
							v-slot:default="{data, pagination, loading, hasMore, error, options}" 
							collection="creation, uni-id-users, creation-categories"
							field="type,huaban_imgs,content,status,title,like_count,comment_count,publish_date,avatar,category_id,industry_id,user_id{nickname,avatar_file}"
							:ref="`udb_${ele.menu_id}`"
							:where="ele.where"
							@load="handleCzLoad($event, i)"
							getcount
							loadtime="onready"
							orderby="publish_date desc"
							:page-size="10"
						>
							<view v-if="error">
								<u-empty
									marginTop="40"
									mode="list"
									text="出错了"
									icon="../../../../static/empty.png"
								>
								</u-empty>
							</view>
							<view v-else-if="menus[i].list.length == 0 && loading" >
								<u-loading-page :loading="loading" loading-text="loading..."></u-loading-page>
							</view>	
							<view v-else class="list-w">
								<view
									v-for="(item, index) in menus[i].list" 
									:key="item._id"
								>	
									<template v-if="item.type == 1">
										<wlch-hb-card
											:cid="item._id"
											:imgs="item.huaban_imgs"
											:indexArr="[i, index]"
											:desc="item.content"
											:likeNum="item.like_count"
											:commentsNum="item.comment_count"
											:postTime="item.publish_date"
											:userInfo="item.user_id[0]"
											@detail="handGoDetail"
											:timestamp="item.timestamp"
										></wlch-hb-card>
									</template>
									<template v-else-if="item.type == 2">
										<wlch-news-card
											:cid="item._id"
											:indexArr="[i, index]"
											:avatar="item.avatar"
											:content="item.content"
											:title="item.title"
											:likeNum="item.like_count"
											:commentsNum="item.comment_count"
											:postTime="item.publish_date"
											:userInfo="item.user_id[0]"
											@detail="handGoDetail"
											:timestamp="item.timestamp"
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
							
							<u-safe-bottom></u-safe-bottom>
						</unicloud-db>
					</scroll-view>
				</swiper-item>
			</swiper>
		</view>
		
		<tabbar :activeIndex="'mine'"></tabbar>
	</view>
</template>

<script>
	
	import {
		mapMutations,
		mapActions,
		mapGetters,
		mapState
	} from 'vuex';
	export default {
		data() {
			return {
				loadingText: '努力加载中',
				loadmoreText: '上拉或点击加载更多',
				nomoreText: '实在没有了',
				tabsWidth: '100%',
				current: 0,
				itemStyle: {},
				inactiveStyle: {
					
				},
				activeStyle: {
					color: '#000',
					fontWeight: 'bold',
				},
				menus: [],
				offsetTop: uni.getSystemInfoSync().safeArea.top + 44,
				sys: uni.getSystemInfoSync(),
			};
		},
		watch: {
			indexMenus: {
				handler(n, o){
					if(!n || n.length == 0) return
					this.menus = n.map((ele, index) => {
						// let arr = ele.children.map(m => m.menu_id)
						let where = {
							category_id: {
								parent_id: ele.menu_id
							},
							status: 1
						} 
						// `category_id.parent_id=='${ele.menu_id}&&status==1'`
						return {
							name: ele.name,
							menu_id: ele.menu_id,
							loading: false,
							list: [],
							swiperH: `calc(100vh - 55px - ${this.offsetTop}px)`,
							where
						}
					})
					
				},
				immediate: true,
			},
			menus: {
				handler(n){
					if(n.length > 0) {
						console.log('menus')
						this.$nextTick(() => {
							this.menus[this.current].loading = true
							this.$refs[`udb_${this.menus[this.current].menu_id}`][0].loadData({
								clear: true
							})
						})
						
					}
				},
				
			},
			current(n) {
				
				let ref = this.$refs[`udb_${this.menus[this.current].menu_id}`][0]
				console.log(ref)
				
				this.$nextTick(() => {
					if(ref.dataList.length == 0 && !ref.loading) {
						this.menus[n].loading = true
						ref.loadData({
							clear: true
						})
					}
					
				})
			}
		},
		onReady() {
			if(this.menus.length > 0) {
				this.menus[this.current].loading = true
				this.$refs[`udb_${this.menus[this.current].menu_id}`][0].loadData({
					clear: true
				})
			}
			
			console.log(this.$refs)
		},
		computed: {
			...mapGetters({
				indexMenus: 'menuList/indexMenus',
				userInfo: 'user/info',
			}),
			lineWidth() {
				let w = 0
				if(this.menus.length == 0 ) return 0
				let navText = this.menus[this.current].name;
				navText.split('').forEach(ele => {
					w += this.isChina(ele)? 1: 0.5;
				})
				
				return w * 16 + 5
			}
		},
		async onLoad() {
			 // #ifdef MP-WEIXIN
			 let menuButtonInfo = uni.getMenuButtonBoundingClientRect();
			 this.tabsWidth = (menuButtonInfo.left - 40) + 'px';
			 // #endif
			 
			 if(!this.indexMenus || this.indexMenus.length == 0) {
				 console.log('load')
				 await this.getCateData()
			 }
		},
		methods: {
			...mapActions({
				getCateData: 'menuList/getCateData',
			}),
			handGoDetail({cid}) {
				// console.log(hid)
				uni.navigateTo({
					url: `/pages/czList/czDetail?id=${cid}`
				})
			},
			handleChangeSwiper(e) {
				this.current = e.detail.current
			},
			handleLoad(i) {
				if(this.menus[i].loading) return 
				this.$refs[`udb_${this.menus[i].menu_id}`][0].loadMore()
			},
			handleRefresh(i) {
				if(this.menus[i].loading) return 
				this.menus[i].loading = true
				this.$nextTick(() =>{
					this.menus[i].list = []
					// this.menus[i].swiperH= `calc(100vh - 55px - ${this.offsetTop}px)`,
					this.$refs[`udb_${this.menus[i].menu_id}`][0].loadData({
						clear: true
					})
				})
				
			},
			handleCzLoad(data, i) {
				data.forEach(ele => {
					ele.timestamp = new Date().getTime();
					ele.h = 200
				})
				this.menus[i].list = [...this.menus[i].list, ...data]
				this.menus[i].loading = false
				// console.log(this.menus[i].list)
			},
			handleCardHeight(obj) {
				// if(this.menus[obj.indexArr[0]].list.length == 0) return
				// console.log(obj.indexArr[1], obj.h )
				// // let ref = this.$refs[`udb_${this.menus[obj.indexArr[0]].menu_id}`][0]
				// this.$set(this.menus[obj.indexArr[0]].list[obj.indexArr[1]], 'h', obj.h)
				// this.changeSwiperItemH(obj.indexArr[0])
			},
			changeSwiperItemH(index) {
				let h = this.menus[index].list.reduce((sum, item) => {
					return sum + (item.h ? item.h : 0)
				}, 0) + 60
				let H = this.sys.screenHeight - this.offsetTop - 55
				this.menus[index].swiperH = (h < H? H : h) + 'px'
				// console.log(this.menus[index].swiperH)
			},
			handleSetLoadStatus(hasMore, loading) {
				// console.log(hasMore, loading)
				if(loading) return 'loading'
				
				if(hasMore) return 'loadmore'
				
				return 'nomore'
			},
			handleTabsClick(e) {
				this.current = e.index
			},
			handleGetData() {
				console.log('get')
			},
			isChina(str) {
				var pattern = new RegExp("[\u4E00-\u9FA5]+");
				if(pattern.test(str)){
				    return true
				}
				return false
			}
		}
	}
</script>

<style lang="scss" scoepd>
.header-w {
	.item-search {
		font-weight: bold;
		padding-right: 8px;
	}
	.item-tabs {
		position: relative;
		
		// box-shadow:  0 0 10rpx 10rpx rgba(255,255,255,.4) inset;
	}
	/deep/ {
		.u-tabs {
			.u-tabs__wrapper__nav__item {
				position: relative;
				z-index: 1;
				.u-tabs__wrapper__nav__item__text {
					font-size: 16px;
				}
				
			}
			.u-tabs__wrapper__nav__line {
				transition: all .3s!important;
				opacity: .7;
			}
		}
	}
}
.content-w {
	height: 100vh;
	
	.c-swiper {
		padding-bottom: 55px;
		.swiper-item {
			height: 100%;
			.swiper-scroll {
				height: 100%;
			}
			.list-w {
				height: 100%;
			}
		}
	}
}
</style>
