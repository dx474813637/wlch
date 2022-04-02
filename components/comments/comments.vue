<template>
	<view class="c-w">
		<u--textarea 
			ref="comment"
			v-model="comments" 
			:placeholder="replyObj.reply_user_name? '回复' + replyObj.reply_user_name  : '输入评论...'"
			count
			height="100"
			confirmType="提交"
			focus
			fixed
			border="surround"
			maxlength="500"
			@confirm="handleSubmit"
		></u--textarea>
		<view class="footer u-flex u-flex-items-center u-flex-end">
			<view class="item">
				<u-button type="info" size="small" shape="circle" @click="handleClose">关闭</u-button>
			</view>
			<view class="item">
				<u-button type="primary" size="small" shape="circle" @click="handleSubmit">提交评论</u-button>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name:"comments",
		props: {
			prompt: {
				type: String,
				default: '输入评论...'
			},
			replyObj: {
				type: Object,
				default: () => {
					return {
						comment_type: 0
					}
				}
			},
			timestamp: {
				type: String | Number,
				default: ''
			}
		},
		watch: {
			timestamp() {
				this.comments = ''
			}
		},
		data() {
			return {
				comments: ''
			};
		},
		methods: {
			handleSubmit(e) {
				let obj = {comments: this.comments, replyObj: this.replyObj}
				this.$emit('submit', obj)
			},
			handleClose() {
				this.$emit('close')
			}
		}
	}
</script>

<style lang="scss" scoped>
	.c-w {
		
	}
	.footer {
		padding: 8px 0 5px;
		.item {
			margin-left: 8px;
		}
	}
</style>
