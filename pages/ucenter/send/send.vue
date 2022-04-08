<template>
	<view class="w">
		<view class="form-w">
			<u--form labelPosition="top" :model="czModel" :rules="rules" ref="form1" labelWidth="auto" :labelStyle="{color: '#999', fontWeight: 'bold'}">
				<u-form-item label="作品" prop="list" ref="item3" v-if="czModel.type == 1">
					<u-upload :fileList="czModel.list" @afterRead="afterRead" @delete="deletePic" name="upload" multiple
						:maxCount="9" previewFullImage ></u-upload>
				</u-form-item>
				<u-form-item label="创作标题" prop="title" borderBottom ref="item1">
					<u--input v-model="czModel.title" border="none" clearable placeholder="请输入创作标题"></u--input>
				</u-form-item>
				<u-form-item label="创作内容/描述" prop="content" borderBottom ref="item2">
					<template v-if="czModel.type == 1">
						<u--textarea v-model="czModel.content" border="none" placeholder="请输入内容" autoHeight
							:maxlength="maxlength" count ></u--textarea>
					</template>
					<template v-else-if="czModel.type == 2">
						<u--textarea v-model="czModel.content" border="none" placeholder="请输入内容" height="200"></u--textarea>
					</template>
					
				</u-form-item>
				<u-form-item label="作品类型" prop="cate_name" borderBottom @click="showCate = true" ref="item4">
					<u--input v-model="czModel.cate_name" disabled disabledColor="#ffffff" placeholder="请选择作品类型"
						border="none"></u--input>
					<u-icon slot="right" name="arrow-right"></u-icon>
				</u-form-item>
				<u-form-item label="作品行业" prop="industry_name" borderBottom @click="showIndustry = true" ref="item5">
					<u--input v-model="czModel.industry_name" disabled disabledColor="#ffffff" placeholder="请选择作品行业"
						border="none"></u--input>
					<u-icon slot="right" name="arrow-right"></u-icon>
				</u-form-item>
				<u-form-item label="封面图" prop="avatar" ref="item6" v-if="czModel.type == 2">
					<u-upload :fileList="czModel.avatar" @afterRead="afterRead" @delete="deletePic" name="upload_avatar" multiple
						:maxCount="1" previewFullImage ></u-upload>
				</u-form-item>
			</u--form>
			<view class="btn-w u-flex u-flex-between">
				<view class="item">
					<u-button type="warning" @click="nextSubmit(0)">转存草稿</u-button>
				</view>
				<view class="item">
					<u-button type="primary" @click="nextSubmit(1)">立即发布</u-button>
				</view>
				
			</view>

		</view>
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
				id: '',
				cz: 'huaban', //huaban 画板  article 文章
				handle: 'add', // add 新增  update 编辑
				// cz_status: 'new',
				maxlength: 400,
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
				// industry_columnData: [],
				czModel: {
					title: '',
					content: '',
					cate_id: '',
					cate_name: '',
					industry_id: '',
					industry_name: '',
					type: 1,
					list: [],
					avatar: []
				},
			};
		},
		onReady() {
			this.$refs.form1.setRules(this.rules)
		},
		async onLoad(opt) {
			if(opt.hasOwnProperty('id')) {
				this.handle = 'update'
				this.id = opt.id
			}
			if(opt.hasOwnProperty('cz')) {
				this.czModel.type = Number(opt.cz)
			}
			// const db = uniCloud.database();
			// const {result} = await db.collection('creation-categories').get()
			// console.log(result)
			this.initData()
		},
		computed: {
			...mapGetters({
				userInfo: 'user/info',
				login: 'user/hasLogin'
			}),
			
			rules() {
				let obj = {
					cate_id: {
						required: true,
						message: '类型不能为空',
						trigger: ['blur']
					},
					industry_id: {
						required: true,
						message: '行业不能为空',
						trigger: ['blur']
					},
					title: [{
						required: true,
						message: '请填写创作标题',
						trigger: ['blur', 'change']
					}, {
						max: 30,
						min: 3,
						message: '标题长度在3-30之间',
						trigger: ['blur', 'change']
					}],
					content: [{
						required: true,
						message: '请填写内容',
						trigger: ['blur', 'change']
					}, {
						max: 400,
						message: '内容不得超出400字符',
						trigger: ['blur', 'change']
					}],
				}
				if(this.czModel.type == 1) {
					return {
						...obj,
						list: {
							type: 'array',
							required: true,
							min: 1,
							max: 9,
							message: '请上传1-9张作品图片',
							trigger: ['blur', 'change']
						},
						
					}
				}
				if(this.czModel.type == 2) {
					return {
						...obj,
						
					}
				}
			}
		},
		methods: {
			async initData() {
				if(this.handle == 'update') {
					await this.getUpdateData()
				}
				this.initCateData()
				this.initIndustryData()
			},
			async getUpdateData() {
				uni.showLoading({
					url: '获取数据'
				})
				const {result} = await db.collection(`creation`).doc(this.id).get()
				uni.hideLoading()
				if(result.code == 0) {
					let data = result.data[0]
					this.czModel.list = data.huaban_imgs;
					this.czModel.title = data.title;
					this.czModel.content = data.content;
					this.czModel.cate_id = data.category_id;
					this.czModel.type = data.type;
					this.czModel.industry_id = data.industry_id;
					this.czModel.avatar = [{url: data.avatar}]
					
				}
			},
			async initCateData() {
				this.cate_loading = true;
				const {
					result
				} = await db.collection('creation-categories').get()
				
				this.cate_loading = false;
				
				const {
					init_data,
					columns,
					columnData
				} = this.exchangeData(result.data)
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
				// console.log(e)
				this.showCate = false;
				this.cate_arr = e.indexs
				this.czModel.cate_id = this.cate_init_data[this.cate_arr[0]].children[this.cate_arr[1]].menu_id;
				this.czModel.cate_name = `${e.value[0]}-${e.value[1]}`
				
				this.$refs.form1.validateField('cate_id')
				this.setPickerIndexs('uPicker_cate', this.cate_arr)
			},
			catehandlerClose() {
				this.showCate = false;
				this.$refs.form1.validateField('cate_id')
				this.setPickerIndexs('uPicker_cate', this.cate_arr)
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
				} = this.exchangeData(result.data)
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
				this.industry_arr = e.indexs
				this.czModel.industry_id = this.industry_init_data[this.industry_arr[0]].menu_id;
				this.czModel.industry_name = e.value[0]
				
				this.$refs.form1.validateField('industry_id')
				this.setPickerIndexs('uPicker_industry', this.industry_arr)
			},
			industryhandlerClose() {
				this.showIndustry = false;
				this.$refs.form1.validateField('industry_id')
				this.setPickerIndexs('uPicker_industry', this.industry_arr)
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
			async submitFunc(status) {
				if(this.czModel.type == 1) {
					if(this.handle == 'add') {
						return await db.collection('creation').add({
							title: this.czModel.title,
							content: this.czModel.content,
							category_id: this.czModel.cate_id,
							industry_id: this.czModel.industry_id,
							status: status,
							type: 1,
							huaban_imgs: this.czModel.list.map(ele => ({url: ele.url}) )
						})
					}else if(this.handle == 'update') {
						return await db.collection('creation').where({
							_id: this.id
						}).update({
							title: this.czModel.title,
							content: this.czModel.content,
							category_id: this.czModel.cate_id,
							industry_id: this.czModel.industry_id,
							status: status,
							last_modify_date: db.getCloudEnv('$cloudEnv_now'),
							last_modify_ip: db.getCloudEnv('$cloudEnv_clientIP'),
							huaban_imgs: this.czModel.list.map(ele => ({url: ele.url}) ),
							avatar: this.czModel.avatar[0].url,
						})
					}
					
				}
				else if(this.czModel.type == 2) {
					let params = {
						title: this.czModel.title,
						content: this.czModel.content,
						category_id: this.czModel.cate_id,
						industry_id: this.czModel.industry_id,
						status: status,
					}
					if(this.czModel.avatar[0]) params.avatar = this.czModel.avatar[0].url
					if(this.handle == 'add') {
						return await db.collection('creation').add({
							...params,
							type: 2,
						})
					}else if(this.handle == 'update') {
						return await db.collection('creation').where({
							_id: this.id
						}).update({
							...params,
							last_modify_date: db.getCloudEnv('$cloudEnv_now'),
							last_modify_ip: db.getCloudEnv('$cloudEnv_clientIP'),
						})
					}
				}
			},
			async nextSubmit(status = 0) {
				
				this.$refs.form1.validate().then(async () => {
					
						
					uni.showLoading()
					const res = await this.submitFunc(status)
					uni.hideLoading()
					console.log(res)
					if(res.result.code === 0) {
						uni.$u.toast('成功发布！')
						uni.redirectTo({
							url: '/pages/ucenter/czAdmin/czAdmin?update=1'
						})
					}
					
					
				}).catch(errors => {
					// uni.$u.toast('校验失败')
				})
			},
			async deletePic(event) {
				console.log(event)
				let key
				if(event.name.includes('avatar')) {
					key = 'avatar';
				}else {
					key = 'list';
				}
				let file = this.czModel[key][event.index].url;
				
				const result = await uniCloud.callFunction({
					name: 'uni-fileFunc',
					data: {
						action: 'deleteFile',
						fileList: [file]
					}
				})
				console.log('send', result)
				if (result.success || result.result.length > 0) {
					this.czModel[key].splice(event.index, 1)
					
				} else {
					uni.showToast({
						title: '操作失败',
						icon: 'none'
					})
				}

			},
			async afterRead(event) {
				console.log(event)
				let key
				if(event.name.includes('avatar')) {
					key = 'avatar';
				}else {
					key = 'list';
				}
				// 当设置 mutiple 为 true 时, file 为数组格式，否则为对象格式
				let lists = [].concat(event.file)
				let fileListLen = this.czModel[key].length
				lists.map((item) => {
					this.czModel[key].push({
						...item,
						status: 'uploading',
						message: '上传中'
					})
				})
				let cloudPath = this.userInfo._id + '/' + Date.now()
				for (let i = 0; i < lists.length; i++) {
					const result = await this.uploadFilePromise(
						lists[i].url,
						`${cloudPath}/cz/${i}.${lists[i].url.split('.')[1]}`
					)
					console.log(result)
					if (result.success) {
						let item = this.czModel[key][fileListLen]
						this.czModel[key].splice(fileListLen, 1, Object.assign(item, {
							status: 'success',
							message: '',
							url: result.fileID
						}))
					}else {
						this.czModel[key].splice(fileListLen, 1)
					}

					fileListLen++
				}
				this.$refs.form1.validateField('list')
			},
			uploadFilePromise(filePath, cloudPath) {
				return new Promise((resolve, reject) => {
					uniCloud.uploadFile({
						filePath,
						cloudPath,
						onUploadProgress: function(progressEvent) {
							// console.log(progressEvent);
							var percentCompleted = Math.round(
								(progressEvent.loaded * 100) / progressEvent.total
							);
						},
						success(res) {
							resolve(res)
						},
						fail(err) {
							reject(err)
						},
						complete() {}
					});

				})
			},
		}
	}
</script>

<style lang="scss" scoped>
	.form-w {
		padding: 20px;
		background-color: #fff;
		/deep/ {
			.u-textarea {
				padding-left: 0;
			}
		}
	}

	.btn-w {
		margin-top: 60rpx;
		.item {
			width: 49%;
			flex: 0 0 49%;
		}
	}
</style>
