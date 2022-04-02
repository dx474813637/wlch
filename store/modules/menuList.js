
const db = uniCloud.database();
let state = {
		cateData: uni.getStorageSync('cateData') || []
	},
	getters = {
		indexMenus(state) {
			return state.cateData
		}
	},
	mutations = {
		setCateData(state, data) {
			// console.log(data)
			state.cateData = data
		}
	},
	actions = {
		async getCateData(context) {
			const { result }  = await db.collection('creation-categories').get({
				getTree: true
			})
			// console.log(result)
			uni.setStorageSync('cateData', result.data)
			context.commit('setCateData', result.data)
		}
	}
	
export default {
	namespaced: true,
	state,
	getters,
	mutations,
	actions
}