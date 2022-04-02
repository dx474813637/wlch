// 开发文档：https://uniapp.dcloud.io/uniCloud/clientdb?id=action
const db = uniCloud.database();
const dbCmd = db.command
const user = db.collection('uni-id-users')
module.exports = {
	before: async (state, event) => {
	},
	after: async (state, event, error, result) => {
		if (error) {
			throw error
		}
		if(state.type == 'create') {
			user.doc(state.newData.user_id).update({ 'follow_user': dbCmd.unshift(state.newData.auth_id), 'follow_num': dbCmd.inc(1) })
			user.doc(state.newData.auth_id).update({ 'bfollow_num': dbCmd.inc(1) })
			
		}else if(state.type == 'delete') {
			let params = state.command.getParam({name:'where',index: 0})[0]
			
			user.doc(params.user_id).update({ 'follow_user': dbCmd.pull(params.auth_id), 'follow_num': dbCmd.inc(-1) })
			user.doc(params.auth_id).update({ 'bfollow_num': dbCmd.inc(-1) })
			
		}
		
		return result
	}
}
