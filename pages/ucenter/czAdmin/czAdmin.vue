<template>
	<view>
		<u-sticky>
			<view class="tabs-w">
				<u-tabs :list="tabs" lineHeight="2" :current="current" @click="handleTabsClick" >
				</u-tabs>
			</view>
		</u-sticky>
		<view class="tabs2">
			<view class="init-btn u-flex u-flex-items-center u-flex-center" @click="initDataBtn">
				<i class="icon-wlch-refresh iconfont-wlch"></i>
			</view>
			<view class="item item-scroll u-flex u-flex-items-center">
				<view class="item-btn btn-orderby u-flex u-flex-items-center"
					@click="handleOrderbyClick"
				>
					<i class="iconfont-wlch" :class="{
						'icon-wlch-shengxu': orderbyList[orderbyActive].type == 'asc',
						'icon-wlch-jiangxu': orderbyList[orderbyActive].type == 'desc',
					}"></i>
					<text class="t">{{orderbyList[orderbyActive].name}}</text>
				</view>
				<view class="item-btn btn-where u-flex u-flex-items-center"
					v-for="(item, index) in whereList"
					:class="{
						active: item.value !== -1
					}"
					:key="item.name"
					@click="handleWhereNavClick(item)"
				>
					<i :class="['iconfont-wlch', `icon-wlch-${item.icon}`]"></i>
					<text class="t">{{item.title}}</text>
				</view>
			</view>
		</view>
		<unicloud-db 
			v-for="(ele, index) in tabs" 
			:key="index" 
			:ref="ele.ref"
			v-slot:default="{data, pagination, loading, hasMore, error, options}" 
			:collection="ele.db" 
			loadtime="manual"
			@load="handleCzLoad" 
			:where="where" 
			:getone="false" 
			:action="action" 
			:orderby="orderby"
			:page-current="ele.p_current" 
			:page-size="ele.p_size" 
			:options="options" 
			getcount
		>
			<view class="content-w" v-if="current == index">
				<view v-if="error">
					<u-empty marginTop="40" mode="list" :text="error.code"
						icon="http://cdn.uviewui.com/uview/empty/list.png">
					</u-empty>
				</view>

				<view v-else>
					<view class="list-w">
						<view class="list-item" v-for="(item) in data" :key="item._id">
							<template v-if="current === 0">
								<wlch-hb-card 
									:imgs="item.huaban_imgs" 
									:desc="item.content"
									:likeNum="item.like_count" 
									:commentsNum="item.comment_count" 
									:postTime="item.publish_date"
									:status="item.status" 
									@handleToolsBtn="handleToolsBtn(item)
								">
									<template v-slot:header="{postTime, status}">
										<view class="hb-header-w u-flex u-flex-items-center u-flex-between">
											<view class="header-item time">
												创建于{{$u.timeFormat(postTime, 'yyyy年mm月dd日 hh:MM:ss')}}
											</view>
											<view class="header-item status">
												{{status | czStatus}}
											</view>
										</view>
									</template>
								</wlch-hb-card>
							</template>
							<template v-else-if="current === 1">
								<wlch-news-card
									:avatar="item.avatar"
									:title="item.title"
									:content="item.content"
									:likeNum="item.like_count" 
									:commentsNum="item.comment_count" 
									:postTime="item.publish_date"
									:status="item.status" 
									@handleToolsBtn="handleToolsBtn(item)"
								>
									<template v-slot:header="{postTime, status}">
										<view class="hb-header-w u-flex u-flex-items-center u-flex-between">
											<view class="header-item time">
												创建于{{$u.timeFormat(postTime, 'yyyy年mm月dd日 hh:MM:ss')}}
											</view>
											<view class="header-item status">
												{{status | czStatus}}
											</view>
										</view>
									</template>
								</wlch-news-card> 
							</template>

						</view>
					</view>
					<u-loadmore line :status="handleSetLoadStatus(hasMore, loading)" :loading-text="loadingText"
						:loadmore-text="loadmoreText" :nomore-text="nomoreText" @loadmore="handleGetData" height="60px"
						color="#999" />
				</view>
			</view>

		</unicloud-db>

		
		<u-action-sheet safeAreaInsetBottom :actions="actionList" round="10" @select="actionSelectClick"
			:show="actionSheetShow" closeOnClickOverlay closeOnClickAction cancelText="取消" @close="actionCancel">
		</u-action-sheet>
		
		<u-action-sheet 
			safeAreaInsetBottom 
			:actions="whereList[2].list" 
			round="10" 
			@select="statusActionSelectClick"
			:show="statusActionsShow" 
			closeOnClickOverlay 
			closeOnClickAction 
			cancelText="取消" 
			@close="statusActionCancel"
			title="状态选择"
		>
		</u-action-sheet>
		<u-action-sheet 
			safeAreaInsetBottom 
			:actions="orderbyList" 
			round="10" 
			@select="orderbyActionSelectClick"
			:show="orderbyActionsShow" 
			closeOnClickOverlay 
			closeOnClickAction 
			cancelText="取消" 
			@close="orderbyActionCancel"
			title="排序选择"
		>
		</u-action-sheet>
		<u-picker 
			:show="showCate" 
			ref="uPicker_cate" 
			closeOnClickOverlay
			:loading="cate_loading"
			:columns="cate_columns" 
			@close="catehandlerClose"
			@cancel="catehandlerClose"
			@confirm="cateConfirm"
			@change="cateChangeHandler"
			:defaultIndex="cate_arr"
		>
		</u-picker>
		
		<u-picker 
			:show="showIndustry" 
			ref="uPicker_industry" 
			closeOnClickOverlay
			:loading="industry_loading"
			:columns="industry_columns" 
			@close="industryhandlerClose"
			@cancel="industryhandlerClose"
			@confirm="industryConfirm"
			:defaultIndex="industry_arr"
		>
		</u-picker>
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
				update: 0,
				// filterFlag: false,
				current: 0,
				tabs: [{
						name: '画板',
						db: 'creation',
						type: 1,
						ref: 'udb_hb',
						p_current: 1,
						p_size: 10
					},
					{
						name: '文章',
						db: 'creation',
						type: 2,
						ref: 'udb_wz',
						p_current: 1,
						p_size: 10
					}
				],
				loadingText: '努力加载中',
				loadmoreText: '上拉或点击加载更多',
				nomoreText: '实在没有了',
				p_current: 1,
				p_size: 2,
				action: '',
				options: {},
				actionSheetShow: false,
				actionList: [{
						name: '查看详情',
						type: 'detail'
					},
					{
						name: '编辑内容',
						type: 'update'
					},
					{
						name: '删除创作',
						type: 'delete'
					}
				],
				toolsData: {},
				whereList: [
					{
						name: 'category',
						keyname: 'category_id',
						value: -1,
						title: '类型',
						icon: 'cascades'
					},
					{
						name: 'industry',
						keyname: 'industry_id',
						value: -1,
						title: '行业',
						icon: 'tag'
					},
					{
						name: 'status',
						keyname: 'status',
						value: -1,
						title: '全部状态',
						icon: 'searchlist',
						list: [
							{
								name: '全部状态',
								value: -1,
							},
							{
								name: '已发布',
								value: 1,
							},
							{
								name: '草稿箱',
								value: 0,
							}
						]
					}
				],
				orderbyActionsShow: false,
				orderbyActive: 0,
				orderbyList: [
					{
						name_key: 'publish_date',
						name: '发布时间',
						index: 0,
						type: 'desc'
					},
					{
						name_key: 'last_modify_date',
						name: '回复时间',
						index: 1,
						type: 'desc'
					},
				],
				statusActionsShow:false,
				showCate: false,
				cate_init_data: [],
				cate_arr: [0, 0],
				cate_loading: false,
				cate_columns: [],
				cate_columnData: [],
				showIndustry: false,
				industry_init_data: [],
				industry_arr: [0],
				industry_loading: false,
				industry_columns: [],
			}
		},
		computed: {
			...mapGetters({
				userInfo: 'user/info',
				login: 'user/hasLogin'
			}),
			where() {
				let where = {
					user_id: '$cloudEnv_uid',
					type: this.tabs[this.current].type
				}
				let whereArr = []
				this.whereList.filter(ele => ele.value !== -1).forEach(ele => {
					where[ele.keyname] = ele.value
				})
				Object.keys(where).forEach((ele, index) => {
					if(ele == 'user_id' ) {
						whereArr.push(`${ele}==${where[ele]}`)
					}
					else if(ele == 'status' || ele == 'type') {
						whereArr.push(`${ele}==${where[ele]}`)
					}
					else {
						whereArr.push(`${ele}=='${where[ele]}'`)
					}
					
				})
				console.log(whereArr)
				return whereArr.join('&&')
			},
			orderby() {
				let arr = [
					this.orderbyList[this.orderbyActive].name_key,
					this.orderbyList[this.orderbyActive].type
				]
				return arr.join(' ')
			}
		},
		watch: {
			current: {
				handler(n) {
					this.$nextTick(() => {
						let ref = this.$refs[this.tabs[this.current].ref][0]
						console.log(ref)
						ref.loadData({
							clear: true
						})
						
					})
				},
				immediate: true,
			}
		},
		onPullDownRefresh() { //下拉刷新
			this.$nextTick(() => {
				this.$refs[this.tabs[this.current].ref][0].loadData({
					clear: true //可选参数，是否清空数据
				}, () => {
					uni.stopPullDownRefresh()
				})
			})
		},
		onLoad(opt) {
			if (opt.hasOwnProperty('update')) {
				this.update = opt.update
			}
		},
		onReachBottom() { //滚动到底翻页
		
			this.$refs[this.tabs[this.current].ref][0].loadMore()
			// console.log(this.$refs[this.tabs[this.current].ref][0])
		},
		methods: {
			initDataBtn() {
				uni.redirectTo({
					url: '/pages/ucenter/czAdmin/czAdmin'
				})
			},
			getInitData() {
				console.log(this.orderby)
				this.$refs[this.tabs[this.current].ref][0].loadData({
					clear: true
				})
			},
			handleCzLoad(data, ended, pagination) {
				// console.log(data, ended, pagination)
				this.tabs[this.current].p_current = pagination.current
			},
			handleTabsClick(item) {
				this.current = item.index
			},
			handleSetLoadStatus(hasMore, loading) {
				if (loading) return 'loading'

				if (hasMore) return 'loadmore'

				return 'nomore'
			},
			handleGetData() {
				console.log('get')
				this.$refs[this.tabs[this.current].ref][0].loadMore()
			},
			
			handleToolsBtn(obj) {
				// console.log(obj)
				this.toolsData = obj
				this.actionSheetShow = true;
			},
			actionSelectClick(obj) {
				// console.log(obj)
				let cz = this.current == 0 ? 'huaban' : 'article';
				if (obj.type == 'update') {
					uni.redirectTo({
						url: `/pages/ucenter/send/send?id=${this.toolsData._id}&cz=${cz}`,
					})
				}
				else if(obj.type == 'detail') {
					uni.navigateTo({
						url: `/pages/czList/czDetail?id=${this.toolsData._id}` 
					})
				}
				else if(obj.type == 'delete') {
					this.$refs[this.tabs[this.current].ref][0].remove(this.toolsData._id, {
						confirmTitle: '提示', // 确认框标题
						confirmContent: '是否删除该创作',  // 确认框内容
						success: (res) => { // 删除成功后的回调
						    console.log(res)
						},
						fail: (err) => { // 删除失败后的回调
							console.log(err)
						},
						complete: () => { // 完成后的回调
						}
					})
				}

				this.actionCancel()
			},
			actionCancel() {
				this.actionSheetShow = false
			},
			orderbyActionSelectClick(obj) {
				// console.log(obj)
				if(obj.index === this.orderbyActive) {
					let curType = obj.type
					if(curType == 'desc') {
						this.orderbyList[this.orderbyActive].type = 'asc'
					}else if(curType == 'asc'){
						this.orderbyList[this.orderbyActive].type = 'desc'
					}
				}else {
					this.orderbyList[this.orderbyActive].type = 'desc'
					this.orderbyActive = obj.index
				}
				this.$nextTick(() => {
					this.getInitData()
				})
				
				// console.log(this.orderbyList, this.orderbyActive)
			},
			orderbyActionCancel() {
				this.orderbyActionsShow = false
			},
			statusActionSelectClick(obj) {
				console.log(obj)
				if(obj.value == this.whereList[2].value) return
				this.setWhereData({
					name: 'status',
					value: obj.value,
					title: obj.name,
				})
				
				// console.log(this.orderbyList, this.orderbyActive)
			},
			statusActionCancel() {
				this.statusActionsShow = false
			},
			handleOrderbyClick() {
				this.orderbyActionsShow = true
			},
			handleWhereNavClick(event) {
				console.log(event)
				if(event.name == 'category') {
					this.showCate = true;
					this.cate_columnData.length == 0 && this.initCateData()
				}
				if(event.name == 'industry') {
					this.showIndustry = true;
					this.industry_columns.length == 0 && this.initIndustryData()
				}
				if(event.name == 'status') {
					this.statusActionsShow = true
				}
			},
			
			async initCateData() {
				this.cate_loading = true;
				const {
					result
				} = await db.collection('creation-categories').get()
				
				this.cate_loading = false;
				let arr_new = [{
					name: '全部',
					menu_id: 'all1',
					parent_id: '',
				},{
					name: '全部',
					menu_id: 'all2',
					parent_id: 'all1',
				}]
				let arr = [].concat(arr_new, ...result.data)
				const {
					init_data,
					columns,
					columnData
				} = this.exchangeData(arr)
				if(this.handle == 'update') {
					init_data.some((ele, index) => {
						return ele.children.some((item, i) => {
							if(item.menu_id == this.czModel.cate_id) {
								this.czModel.cate_name = ele.name+'-'+item.name;
								this.cate_arr = [index, i]
								return true;
							}
							return false
						})
					})
					
				}
				this.cate_init_data = init_data
				this.cate_columns = columns
				this.cate_columnData = columnData
				this.cate_columns[1] = this.cate_columnData[this.cate_arr[0]]
				if(this.handle == 'update') {
					this.setPickerIndexs('uPicker_cate', this.cate_arr)
				}
				
			},
			cateChangeHandler(e) {
				const {
						columnIndex,
						value,
						values, // values为当前变化列的数组内容
						index,
						// 微信小程序无法将picker实例传出来，只能通过ref操作
						picker = this.$refs.uPicker_cate
					} = e
					
				// 当第一列值发生变化时，变化第二列(后一列)对应的选项
				if (columnIndex === 0) {
					// picker为选择器this实例，变化第二列对应的选项
					picker.setColumnValues(1, this.cate_columnData[index])
				}
			},
			// 回调参数为包含columnIndex、value、values
			cateConfirm(e) {
				console.log(e)
				this.showCate = false;
				if(this.cate_arr[0] == e.indexs[0] && this.cate_arr[1] == e.indexs[1] ) return
				this.cate_arr = e.indexs;
				let menu_id = this.cate_init_data[this.cate_arr[0]].children[this.cate_arr[1]].menu_id
				
				this.setWhereData({
					name: 'category',
					value: this.cate_arr[0] == 0 ? -1 : menu_id,
					title: this.cate_arr[0] == 0 ? '类型' : `${e.value[0]}-${e.value[1]}`
				})
				// this.czModel.cate_id = this.cate_init_data[this.cate_arr[0]].children[this.cate_arr[1]].menu_id;
				// this.czModel.cate_name = `${e.value[0]}-${e.value[1]}`
				
				// this.$refs.form1.validateField('cate_id')
				this.setPickerIndexs('uPicker_cate', this.cate_arr)
			},
			catehandlerClose() {
				this.showCate = false;
				// this.$refs.form1.validateField('cate_id')
				this.setPickerIndexs('uPicker_cate', this.cate_arr)
			},
			setPickerIndexs(comp, arr = [0]) {
				this.$refs[comp].setIndexs(arr, true)
			},
			exchangeData(arr) {
				
				let init_data = [];
				let columns = [[]];
				let columnData = [];
				arr.filter(ele => !ele.parent_id).forEach((ele, index) => {
					ele.children = []
					init_data.push(ele)
					columnData.push([])
					columns[0].push(ele.name)
				})
				if(arr.length == columns[0].length) {
					columnData = []
				}else {
					columns[1] = []
					arr.filter(ele => ele.parent_id).forEach((ele, index) => {
						init_data.forEach((item, i) => {
							if(ele.parent_id == item.menu_id) {
								item.children.push(ele);
								columnData[i].push(ele.name);
							}
						})
						
					})
				}
				
				
				return {
					init_data,
					columns,
					columnData
				}
				
			},
			setWhereData(e) {
				this.whereList.forEach(ele => {
					if(ele.name == e.name) {
						ele.value = e.value;
						ele.title = e.title
					}
				})
				this.$nextTick(() => {
					this.getInitData()
				})
			},
			async initIndustryData() {
				this.industry_loading = true;
				const {
					result
				} = await db.collection('creation-industry').get()
				
				this.industry_loading = false;
				
				const {
					init_data,
					columns
				} = this.exchangeData([].concat({
						name: '全部',
						menu_id: 'all',
					}, ...result.data))
				if(this.handle == 'update') {
					init_data.some((item, i) => {
						if(item.menu_id == this.czModel.industry_id) {
							this.czModel.industry_name = item.name;
							this.industry_arr = [i]
							return true;
						}
						return false
					})
					
				}
				
				this.industry_init_data = init_data
				this.industry_columns = columns
				if(this.handle == 'update') {
					this.setPickerIndexs('uPicker_industry', this.industry_arr)
				}
				
			},
			
			// 回调参数为包含columnIndex、value、values
			industryConfirm(e) {
				console.log(e)
				this.showIndustry = false;
				if(this.industry_arr[0] == e.indexs[0]) return
				this.industry_arr = e.indexs
				let menu_id = this.industry_init_data[this.industry_arr[0]].menu_id
				this.setWhereData({
					name: 'industry',
					value: this.industry_arr[0] == 0 ? -1 : menu_id,
					title: this.industry_arr[0] == 0 ? '行业' : e.value[0]
				})
				// this.czModel.industry_id = this.industry_init_data[this.industry_arr[0]].menu_id;
				// this.czModel.industry_name = e.value[0]
				
				// this.$refs.form1.validateField('industry_id')
				this.setPickerIndexs('uPicker_industry', this.industry_arr)
			},
			industryhandlerClose() {
				this.showIndustry = false;
				// this.$refs.form1.validateField('industry_id')
				this.setPickerIndexs('uPicker_industry', this.industry_arr)
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
	.tabs2 {
		background-color: #fff;
		height: 30px;
		padding: 0 8px;
		padding-right: 30px;
		position: relative;
		.item-scroll {
			height: 100%;
			overflow-x: auto;
			white-space: nowrap;
		}
		.init-btn {
			position: absolute;
			right: 0;
			top: 0;
			height: 100%;
			background-color: #fff;
			padding: 0 8px;
			font-size: 16px;
		}
		.item-btn {
			font-size: 12px;
			padding: 3px 5px;
			color: #777;
			border-radius: 20px;
			margin-right: 5px;
			&:last-child {
				margin-right: 0;
			}
			&.active {
				color: #f90;
			}
			&.btn-orderby {
				color: #f90;
			}
			&.btn-where {
				
			}
			.t {
				padding-left: 2px;
			}
			.iconfont-wlch {
				font-size: 14px;
			}
		}
	}
	.hb-header-w {
		height: 35px;
		padding: 0 8px;
		border-bottom: 1rpx solid #e7e7e7;
		margin-bottom: 10px;

		.header-item {
			font-size: 14px;

			&.time {
				color: #999;
			}

			&.status {
				padding: 2px 6px;
				border-radius: 3px;
				background-color: #f8f8f8;
				font-size: 12px;
			}
		}
	}

	.tabs-w {
		background-color: #fff;
		/deep/ .u-tabs {
			.u-tabs__wrapper__nav__item {
				flex: 1
			}
		}
	}
	.right-btn {
		padding: 0 5px;
	}

	.filter-box {
		background-color: #fff;
		border-radius: 40rpx;
		overflow: hidden;

		.box-content {
			height: 600rpx;
			background-color: #f8f8f8;
			padding: 20rpx 30rpx 0;

		}

		.box-bottom {
			height: 120rpx;
			background-color: #fff;
			border-top: 1rpx solid #e7e7e7;

			.item {
				width: 40%;
			}
		}
	}

	.list-w {
		min-height: calc(100vh - 200px);
		padding: 10px;

		.list-item {
			margin-bottom: 20rpx;

			/deep/ {
				.hb-w {
					border-radius: 10px;
				}
				.news-w {
					border-radius: 10px;
				}
			}

		}
	}
</style>
