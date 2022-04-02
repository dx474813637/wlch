<template>
	<view class="dt-card">
		<view class="msg">
			<text class="ta">Ta</text>
			<text>点赞了</text>
			<text v-if="cz_type != -1">{{cz_type | czType}}</text>
			<text class="cz-title">《{{cz_title}}》</text>
			<template v-if="cz_comment">
				<text>中的评论：</text>
				<text class="cz-comment">{{cz_comment}}</text>
			</template>
			
		</view>
		<view class="time">{{$u.timeFrom(time)}}</view>
	</view>
</template>

<script>
	export default {
		name:"wlch-dt-card",
		props: {
			indexArr: {
				type: Array,
				default: () => []
			},
			cz_type: {
				type: String | Number,
				default: -1
			},
			cz_title: {
				type: String,
				default: ''
			},
			cz_comment: {
				type: String,
				default: ''
			},
			time: {
				type: String | Number,
				default: ""
			}
		},
		filters: {
			czType(v) {
				if(v == 1) return '画板'
				if(v == 2) return '文章'
			}
		},
		async mounted() {
			this.init()
		},
		data() {
			return {
				
			};
		},
		methods: {
			async init() {
				// await this.$u.getRect('.author-w', false)
				let result = await this.$u.getRect('.dt-card', false)
				this.$emit('cardHeight', {
					indexArr: this.indexArr,
					h: result.height
				})
			},
		}
	}
</script>

<style lang="scss" scoped>
	.dt-card {
		background-color: #fff;
		border-radius: 12px;
		font-size: 14px;
	}
	.msg {
		color: #999;
		line-height: 25px;
		padding: 8px 14px;
		word-break: break-all;
		.ta {
			color: #666;
			padding-right: 3px;
		}
		.cz-title {
			color: $theme-color;
			padding: 0 3px;
		}
		.cz-comment {
			color: #666;
			padding: 0 3px;
		}
	}
	.time {
		border-top: 1rpx solid #f8f8f8;
		padding: 8px 14px;
		color: #999;
		font-size: 13px;
		text-align: right;
	}
</style>
