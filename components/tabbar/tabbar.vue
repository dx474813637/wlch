<template>
	<view class="tabbar-w">
		<view class="tabbar u-flex u-flex-around ">
			<view  
				class="tabbar-item u-flex u-flex-middle"
				:class="{
					'active': item.name == activeIndex
				}"
				v-for="(item,index) in menuList"
				:key="item.name"
				@click="handleTabbarClick(item)"
			>
				<view class="item-header" :class="{
					'plus': item.name == 'plus'
				}">
					<template v-if="item.type == 'icon'">
						<i :class="['iconfont-wlch', item.icon]"></i> 
					</template>
				</view>
				<view class="item-bottom">
					<view class="item-title" v-if="item.title">
						{{item.title}}
					</view>
				</view>
			</view>
		</view>
		<u-popup 
			:show="sendShow" 
			@close="handlePopupShow" 
			@open="handleOpenShow"
			mode="bottom"
			bgColor="transparent"
		>
			<view class="send-w">
				<view class="content">
					<view class="type-list u-flex u-flex-items-center u-flex-around">
						<view 
							class="item"
							v-for="(item,index) in sendList"
							:key="index"
							@click="handleSendClick(item)"
						>
							<view class="item-label u-flex u-flex-items-center u-flex-center"
								:style="{
									background: item.bg,
								}"
							>
								<i :class="['iconfont-wlch', item.icon]"
									:style="{
										color: item.color,
									}"
								></i>
							</view>
							<view class="item-title">{{item.title}}</view>
						</view>
					</view>
				</view>
				<view class="type-close u-flex u-flex-items-center u-flex-center">
					<i class="icon-wlch-round_close_fill_light iconfont-wlch" @click="handlePopupShow" ></i>
				</view>
			</view>
		</u-popup>
	</view>

</template>

<script>
	const db = uniCloud.database();
	import {mapState, mapGetters} from 'vuex'
	export default {
		name:"tabbar",
		props: {
			activeIndex: {
				type: String,
				default: ''
			}
		},
		data() {
			return {
				sendShow: false,
				popupStyle: {
					'padding': '20px'
				},
				sendList: [
					{
						name: 'huaban',
						icon: 'icon-wlch-skinfill',
						title: '画板',
						bg: 'linear-gradient(135deg, #c000ff, #3300ff)',
						color: '#fdf0ff',
						path: '/pages/ucenter/send/send?cz=1',
					},
					{
						name: 'article',
						icon: 'icon-wlch-newshotfill',
						title: '文章',
						bg: 'linear-gradient(135deg, #00dcff, #3300ff)',
						color: '#ffffff',
						path: '/pages/ucenter/send/send?cz=2',
					},
				]
			};
		},
		computed: {
			...mapState('tabbar', {
				menuList: state => state.menuList
			}),
			...mapGetters({
				userInfo: 'user/info',
			})
		},
		methods: {
			async handleTabbarClick(item) {
				if(item.path) {
					if(item.name == 'list') {
						uni.reLaunch({
							url: item.path
						})
					}else {
						uni.navigateTo({
							url: item.path
						})
					}
					
				}else if(item.name == 'plus'){
					this.sendShow = true
				}
				
			},
			handlePopupShow() {
				this.sendShow = false
			},
			handleOpenShow() {
				
			},
			handleSendClick(item) {
				uni.navigateTo({
					url: item.path
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	
	.send-w {
		padding: 12px;
		// padding-bottom: 20px;
		.content {
			background-color: #fff;
			padding: 12px;
			border-radius: 24px;
			.type-list {
				height: 100%;
				height: 25vh;
				.item {
					display: flex;
					flex-direction: column;
					align-items: center;
					.item-label {
						width: 50px;
						height: 50px;
						border-radius: 8px;
						background-color: #007aff;
						margin-bottom: 10px;
						.iconfont-wlch {
							font-size: 24px;
							color: #fff;
						}
					}
					.item-title {
						color: #999;
						line-height: 30px;
					}
				}
			}
		}
		.type-close {
			height: 35px;
			margin-top: 10px;
			.iconfont-wlch {
				font-size: 40px;
				color: #ccc;
			}
		}
	}
	.tabbar-w {
		position: fixed;
		left: 0;
		bottom: 0;
		width: 100%;
		background-color: #fff;
		border-top: 1rpx solid #f2f2f2;
		z-index: 98;
		padding-bottom: 0;  
		padding-bottom: constant(safe-area-inset-bottom);  
		padding-bottom: env(safe-area-inset-bottom); 
		.tabbar {
			width: 100%;
			height: 110rpx;
			.tabbar-item {
				height: 100%;
				flex-direction: column;
				&.active {
					color: #007aff;
				}
				.item-header {
					.iconfont-wlch {
						font-size: 38rpx;
						color: #999;
					}
					&.plus .iconfont-wlch {
						font-size: 70rpx;
					}
				}
				.item-bottom {
					.item-title {
						font-size: 26rpx;
						padding-top: 8rpx;
					}
				}
			}
		}
	}
</style>
