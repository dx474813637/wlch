// 开发文档：https://uniapp.dcloud.io/uniCloud/clientdb?id=action
const db = uniCloud.database();
const dbCmd = db.command
const cz = db.collection('creation');
module.exports = {
	before: async (state, event) => {
		// console.log(state)
	},
	after: async (state, event, error, result) => {
		if (error) {
			throw error
		}
		
		const res = await cz.doc(state.newData.cz_id).update({comment_count: dbCmd.inc(1)})
		
		return result
	}
}
