<template>
	<view class="news-w" @click="handleClickHb">
		<slot name="header" :postTime="postTime" :status="status"></slot>
		<view class="author-w" v-if="userInfo._id">
			<wlch-author-card
				:name="userInfo.nickname"
				:avatar="userInfo.avatar_file?userInfo.avatar_file.url: ''"
				:postTime="postTime"
			></wlch-author-card>
		</view>
		<view class="news-main">
			<view class="news-title">{{title}}</view>
			<view class="news-content u-flex">
				<view class="item-left">
					<view class="news-detail u-line-3">
						{{content}}
					</view>
				</view>
				<view class="item-right"  v-if="avatar">
					<u--image
						:src="avatar" 
						width="80px" 
						radius="6"
						height="60px"
					></u--image>
				</view>
			</view>
		</view>
		<view class="news-footer u-flex u-flex-between u-flex-items-center">
			<view class="item-left u-flex u-flex-items-center">
				<view class="item-like-btn u-flex u-flex-items-center">
					<u-icon name="thumb-up" size="20"></u-icon>
					<text class="btn-text">{{likeNum}}</text>
				</view>
				<view class="item-comments-btn u-flex u-flex-items-center">
					<u-icon name="chat" size="20"></u-icon>
					<text class="btn-text">{{commentsNum}}</text>
				</view>
			</view>
			<view class="item-right u-flex u-flex-items-center">
				<view class="item-more-tools" @click.stop="handleToolsClick">
					<u-icon name="more-dot-fill"></u-icon>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name:"wlch-news-card",
		props: {
			cid: {
				type: String | Number,
				default: ''
			},
			status: {
				type: String | Number,
				default: 1
			},
			indexArr: {
				type: Array,
				default: () => []
			},
			likeNum: {
				type: String | Number,
				default: 0
			},
			browseNum: {
				type: String | Number,
				default: 0
			},
			comments: {
				type: Array,
				default: () => []
			},
			commentsNum: {
				type: String | Number,
				default: 0
			},
			userInfo: {
				type: Object,
				default: () => {
					return {}
				}
			},
			postTime: {
				type: String | Number,
				default: ''
			},
			avatar: {
				type: String,
				default: ''
			},
			title: {
				type: String,
				default: ''
			},
			content: {
				type: String,
				default: ''
			},
			timestamp: {
				type: String | Number,
				default: ''
			}
		},
		watch: {
			timestamp(n) {
				// console.log(n)
				this.init()
			}
		},
		data() {
			return {
				
			};
		},
		async mounted() {
			this.init()
			
			
		},
		methods: {
			async init() {
				await this.$u.getRect('.author-w', false)
				let result = await this.$u.getRect('.news-w', false)
				this.$emit('cardHeight', {
					indexArr: this.indexArr,
					h: result.height
				})
			},
			handleToolsClick() {
				this.$emit('handleToolsBtn')
			},
			handleClickHb() {
				this.$emit('detail', {
					cid: this.cid
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.news-w {
		background-color: #fff;
		min-height: 100px;
		padding: 10rpx;
		.news-main {
			padding: 4rpx 16rpx;
			.news-title {
				color: #000;
				font-weight: bold;
				padding: 10rpx 0;
			}
			.news-content {
				.item-left {
					width: calc(100% - 80px);
					flex: 0 0 calc(100% - 80px);
				}
				.item-right {
					width: 80px;
					flex: 0 0 80px;
					padding-left: 10rpx;
				}
				.news-detail {
					font-size: 28rpx;
					color: #333;
					line-height: 20px;
				}
			}
		}
		.news-footer {
			padding: 0 20rpx;
			height: 40px;
			.item-left {
				.btn-text {
					padding: 0 6rpx;
					color: #999;
					font-size: 28rpx;
				}
				.item-like-btn {
					margin-right: 30rpx;
				}
				.item-comments-btn {
					
				}
			}
			.item-right {
				.item-more-tools {
					
				}
			}
		}
	}
</style>
