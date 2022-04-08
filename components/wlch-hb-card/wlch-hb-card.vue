<template>
	<view class="hb-w">
		<slot name="header" :postTime="postTime" :status="status"></slot>
		<view class="author-w" v-if="userInfo._id" @click="handleClickAuth">
			<wlch-author-card
				:name="userInfo.nickname"
				:avatar="userInfo.avatar_file?userInfo.avatar_file.url: ''"
				:postTime="postTime"
			></wlch-author-card>
		</view>
		<view class="hb-main">
			<view class="hb-imgs" v-if="imgs && imgs.length > 0">
				<u-album 
					ref="album"
					keyName="url"
					:urls="imgs"
					maxCount="3"
					:multipleSize="multipleSize"
					:singleSize="singleSize"
					@albumWidth="handleAlbumWidth"
				></u-album>	
			</view>
			<view class="hb-desc u-line-2" @click="handleClickHb">
						<rich-text :nodes="desc"></rich-text>
						<!-- {{desc}} -->
						</view>
			
			
		</view>
		<view class="hb-footer u-flex u-flex-between u-flex-items-center" @click="handleClickHb">
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
		name:"wlch-hb-card",
		props: {
			noAuthHome: {
				type: Boolean,
				default: false
			},
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
			imgs: {
				type: Array,
				default: () => []
			},
			desc: {
				type: String,
				default: ''
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
			postTime: {
				type: String | Number,
				default: ''
			},
			timestamp: {
				type: String | Number,
				default: ''
			},
			userInfo: {
				type: Object,
				default: () => {
					return {}
				}
			}
		},
		data() {
			return {
				albumWidth: 300,
				hbW: '',
			};
		},
		computed: {
			multipleSize() {
				return (this.albumWidth - 12)/3
			},
			singleSize() {
				return 300
			},
		},
		watch: {
			async timestamp(n) {
				// console.log('m1', n)
				// let result = await this.$u.getRect('.hb-w', false)
				// // console.log(this.indexArr, result.height)
				// this.$emit('cardHeight', {
				// 	indexArr: this.indexArr,
				// 	h: result.height
				// })
			}
		},
		mounted() {
			this.initW()
		},
		methods: {
			async initW() {
				let result = await this.$u.getRect('.hb-imgs', false)
				this.albumWidth = result.width
				// console.log(result.width)
			},
			async handleAlbumWidth(e) {
				if(e != 0) {
					await this.$u.getRect('.author-w', false)
					let result = await this.$u.getRect('.hb-w', false)
					// console.log(this.indexArr, result.height)
					// console.log('m1')
					this.$emit('cardHeight', {
						indexArr: this.indexArr,
						h: result.height
					})
				}
				
			},
			handleToolsClick() {
				this.$emit('handleToolsBtn')
			},
			handleClickHb() {
				this.$emit('detail', {
					cid: this.cid
				})
			},
			handleClickAuth() {
				if(this.noAuthHome) {
					this.handleClickHb()
				}else {
					uni.navigateTo({
						url: '/pages/ucenter/homePage/homePage?uid='+this.userInfo._id
					})
				}
				
			}
		}
	}
</script>
<style lang="scss" scoped>
	.hb-w {
		background-color: #fff;
		min-height: 100px;
		padding: 10rpx;
		.hb-main {
			padding: 4rpx 16rpx;
			.hb-desc {
				font-size: 28rpx;
			}
			.hb-imgs {
				// border-radius: 16rpx;
				// overflow: hidden;
				margin-bottom: 16rpx;
				/deep/ image {
					border-radius: 8rpx!important;
				}
			}
		}
		.hb-footer {
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
