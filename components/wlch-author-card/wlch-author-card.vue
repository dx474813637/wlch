<template>
	<view class="author-card-w u-flex u-flex-between u-flex-items-center">
		<view class="item-left u-flex u-flex-items-center">
			<view class="item-avatar">
				<u--image 
					:src="avatar" 
					mode="scaleToFill"
					width="35"
					height="35"
					shape="circle"
				></u--image>
			</view>
			<view class="item-content">
				<view class="item-content-top">
					<view class="content-name">{{name}}</view>
				</view>
				<view class="item-content-bottom u-flex">
					<view class="content-p-time">{{$u.timeFrom(postTime)}}</view>
					<view class="content-sub">{{sub}}</view>
				</view>
			</view>
		</view>
		<view class="item-right">
			<!-- <view class="item-more-tools">
				<u-icon name="more-dot-fill"></u-icon>
			</view> -->
		</view>
	</view>
</template>

<script>
	export default {
		name:"wlch-author-card",
		props: {
			uid: {
				type: String,
				default: ''
			},
			id: {
				type: String,
				default: ''
			},
			name: {
				type: String,
				default: ''
			},
			avatar: {
				type: String,
				default: ''
			},
			postTime: {
				type: String | Number,
				default: ''
			},
			sub: {
				type: String,
				default: ''
			}
			
		},
		data() {
			return {
				
			};
		}
	}
</script>

<style scoped lang="scss">
	.author-card-w {
		padding: 12rpx 20rpx;
		.item-left {
			.item-avatar {
				
			}
			.item-content {
				padding-left: 16rpx;
				.item-content-top {
					.content-name {
						font-size: 28rpx;
					}
				}
				.item-content-bottom {
					.content-p-time {
						font-size: 24rpx;
						color: #999;
					}
					.content-sub {
						font-size: 24rpx;
						color: #999;
						padding-left: 20rpx;
					}
				}
			}
		}
		.item-right {
			
		}
	}
</style>
