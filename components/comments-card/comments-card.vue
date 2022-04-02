<template>
	<view class="w">
		<view class="author-w u-flex u-flex-between u-flex-items-end">
			<wlch-author-card
				:uid="uid"
				:name="user_info.nickname"
				:avatar="user_info.avatar_file?user_info.avatar_file.url: ''"
				:postTime="postTime"
				sub="发表评论"
			></wlch-author-card>
			<view class="like-btn u-flex u-flex-items-center" :class="{
				liked: isLike
			}" @click="handleLikeClick">
				<i class="icon-wlch-appreciate_fill_light iconfont-wlch"></i>
				<text>{{like_count}}</text>
			</view>
		</view>
		<view class="content-w">
			{{content}}
		</view>
		<!-- <unicloud-db
			v-slot:default="{data, loading, hasMore, error, options}"
			collection="creation-comments, uni-id-users"
			:where="`reply_comment_id=='${cid}'&&reply_user_id=='${uid}'&&comment_type==1`"
			:ref="`udb_comments_reply_${cid}`"
			getcount
			field="comment_content,comment_date,comment_type,like_count,user_id{avatar, nickname, avatar_file}"
			loadtime="auto"
			orderby="comment_date desc"
			@load="handleCommentsReplyLoad"
		>
			<view v-if="error">error</view>
			<view v-else>
				
				<view class="reply-w" v-if="data.length > 0">
					<view class="reply-box" @click="replyListShow">
						<view class="reply-row u-line-2">
							<text class="re_name">{{data[0].user_id[0].nickname}}：</text>
							<text class="re_content">
								{{data[0].comment_content}}
							</text>
						</view>
						<div class="reply-more-btn">
							查看共{{data.length}}条回复
						</div>
					</view>
				</view>
			</view>
			
		</unicloud-db> -->
		
		<!-- <view class="footer-w u-flex u-flex-items-center u-flex-between">
			<view class="footer-item u-flex u-flex-items-center">
				<view class="item u-flex u-flex-items-center" @click="handleLikeBtn">
					<i class="icon-wlch-appreciate iconfont-wlch"></i>
					<text class="num">123</text>
				</view>
				<view class="item u-flex u-flex-items-center" @click="handleReplyBtn">
					<i class="icon-wlch-mark iconfont-wlch"></i>
					<text class="num">123</text>
				</view>
			</view>
			<view class="footer-item"></view>
		</view> -->
		<!-- <u-popup
			:show="commentsShow" 
			mode="bottom"  
			@close="commentsClose"
			overlayOpacity="0.3"
		>
		    <view class="comments-w">
				<comments
					:prompt="prompt"
					:replyObj="replyObj"
					@submit="handleSubmitComments"
					@close="commentsShow = false"
				></comments>
			</view>
		</u-popup> -->
	</view>
</template>

<script>
	const db = uniCloud.database();
	export default {
		name:"comments-card",
		props: {
			postTime: {
				type: String | Number,
				default: ''
			},
			cid: {
				type: String | Number,
				default: ''
			},
			// czid: {
			// 	type: String | Number,
			// 	default: ''
			// },
			user_info: {
				type: Object,
				default: () => {
					return {}
				}
			},
			uid: {
				type: String | Number,
				default: '',
			},
			content: {
				type: String,
				default: ''
			},
			like_count: {
				type: String | Number,
				default: 0
			},
			isLike: {
				type: Boolean,
				default: false
			}
		},
		watch: {
			cid: {
				handler(n) {
					if(n) {
						// this.getReplyData()
					}
				},
				immediate: true
			}
		},
		data() {
			return {
				reply_list: [],
				// replyObj: {
				// 	comment_type: 1,
				// 	reply_comment_id: this.cid,
				// 	reply_user_id: this.user_info._id,
				// 	reply_user_name: this.user_info.nickname,
				// },
				commentsShow: false,
				// prompt: '',
			};
		},
		methods: {
			handleCommentsReplyLoad(data, ended, pagination) {
				console.log(data, ended, pagination)
			},
			handleLikeClick() {
				this.$emit('likeClick', {
					id: this.cid,
					uid: this.uid,
					like: !this.isLike
				})
			},
			async getReplyData() {
				const {result} = await db.collection('creation-comments').where({
					reply_comment_id: this.cid
				}).get();
				console.log(result.data)
			},
			commentsClose() {
				this.commentsShow = false
			},
			replyListShow() {
				
			},
			handleLikeBtn() {
				
			},
			handleReplyBtn() {
				// this.commentsShow = true
				this.$emit('reply', {
					comment_type: 1,
					reply_comment_id: this.cid,
					reply_user_id: this.user_info._id,
					reply_user_name: this.user_info.nickname,
				})
			},
			
		}
	}
</script>

<style lang="scss" scoped>
	.comments-w {
		padding: 10px;
	}
	.like-btn {
		
		padding-right: 15px;
		padding-bottom: 5px;
		&.liked {
			.iconfont-wlch,
			text { 
				color: $theme-color;
			}
			
		}
		.iconfont-wlch {
			font-size: 14px;
			color: #999;
		}
		text {
			font-size: 12px;
			color: #999;
			padding-left: 4px;
		}
	}
	.content-w {
		padding: 5px 10px 10px;
		line-height: 22px;
		font-size: 14px;
		word-break: break-all;
	}
	.footer-w {
		padding: 10px 5px;
		.item {
			padding: 0 5px;
		}
		.iconfont-wlch {
			color: #999;
		}
		.num {
			padding-left: 5px;
			font-size: 12px;
			color: #999;
		}
	}
	.reply-w {
		padding: 0 10px;
		.reply-box {
			padding: 10px;
			background-color: #eee;
			color: #999;
			font-size: 12px;
			border-radius: 8px;
			.reply-more-btn {
				text-align: left;
				line-height: 24px;
				font-size: 12px;
				color: #007aff;
			}
		}
		.reply-row {
			font-size: 13px;
			.re_name {
				color: #666;
			}
			.re_content {
				
			}
		}
	}
</style>
