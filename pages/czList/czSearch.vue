<template>
	<view>
		<u-sticky>
			<view class="search-w">
				<u-search 
					placeholder="输入关键字进行搜索" 
					v-model="keyword"
					shape="round"
					:showAction="false"
					@search="handleSearch"
				></u-search>
			</view>
		</u-sticky>
		<view class="res-content" v-if="keyword">
			<unicloud-db
				v-slot:default="{data, pagination, loading, hasMore, error, options}" 
				collection="creation, uni-id-users"
				field="type,huaban_imgs,content,title,like_count,comment_count,publish_date,avatar,category_id,industry_id,user_id{nickname,avatar_file}"
				ref="udb_search"
				:where="searchwhere"
				@load="handleCzLoad"
				getcount
				loadtime="manual"
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
				<view v-else-if="list.length == 0 && loading" >
					<u-loading-page :loading="loading" loading-text="loading..."></u-loading-page>
				</view>	
				<view v-else class="list-w">
					<view
						v-for="(item, index) in data" 
						:key="item._id"
						class="item"
					>	
						<template v-if="item.type == 1">
							<wlch-hb-card
								:cid="item._id"
								:imgs="item.huaban_imgs.map(imgs => imgs.url)"
								:desc="item.content"
								:likeNum="item.like_count"
								:commentsNum="item.comment_count"
								:postTime="item.publish_date"
								:userInfo="item.user_id[0]"
								@detail="handGoDetail"
							></wlch-hb-card>
						</template>
						<template v-else-if="item.type == 2">
							<wlch-news-card
								:cid="item._id"
								:avatar="item.avatar"
								:content="item.content"
								:title="item.title"
								:likeNum="item.like_count"
								:commentsNum="item.comment_count"
								:postTime="item.publish_date"
								:userInfo="item.user_id[0]"
								@detail="handGoDetail"
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
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				keyword: '',
				loadingText: '努力加载中',
				loadmoreText: '上拉或点击加载更多',
				nomoreText: '实在没有了',
				list: []
			};
		},
		onReachBottom() {
			if(!this.keyword) return
			this.$refs.udb_search.loadMore()
		},
		computed: {
			searchwhere() {
				return `${new RegExp(this.keyword, 'i')}.test(title)||${new RegExp(this.keyword, 'i')}.test(content)`
			}
		},
		methods: {
			handleSearch() {
				if(!this.keyword) return
				this.$refs.udb_search.loadData({clear: true})
			},
			handleCzLoad(data, ended, pagination) {
				console.log(data)
				this.list = [...this.list, ...data]
			},
			handleSetLoadStatus(hasMore, loading) {
				// console.log(hasMore, loading)
				if(loading) return 'loading'
				
				if(hasMore) return 'loadmore'
				
				return 'nomore'
			},
			handGoDetail({cid}) {
				// console.log(hid)
				uni.navigateTo({
					url: `/pages/czList/czDetail?id=${cid}`
				})
			},
		}
	}
</script>
<style>
	page {
		background-color: #f8f8f8;
	}
</style>
<style lang="scss" scoped>
	.search-w {
		padding: 5px 8px;
		background-color: #fff;
		border-bottom: 1rpx solid #eee;
	}
	.res-content{
		padding: 5px 8px;
		.item {
			border-radius: 8px;
			overflow: hidden;
			margin-bottom: 6px;
		}
	}
</style>
