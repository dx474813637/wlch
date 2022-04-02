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
		// console.log(state, event, error, result)
		let res
		let coll
		let key
		if(state.type == 'create') {
			
			if(state.newData.comment_id == "-1") {
				coll = db.collection('creation').doc(state.newData.cz_id)
				user.doc(state.newData.user_id).update({ 'cz_like': dbCmd.unshift(state.newData.cz_id), 'like_num': dbCmd.inc(1) })
				user.doc(state.newData.auth_id).update({ 'blike_num': dbCmd.inc(1) })
			}else {
				coll = db.collection('creation-comments').doc(state.newData.comment_id)
				user.doc(state.newData.user_id).update({ 'comments_like': dbCmd.unshift(state.newData.comment_id), 'like_num': dbCmd.inc(1) })
				user.doc(state.newData.auth_id).update({ 'blike_num': dbCmd.inc(1) })
			
			}
			res = await coll.update({
				'like_count': dbCmd.inc(1)
			})
		}else if(state.type == 'delete') {
			let params = state.command.getParam({name:'where',index: 0})[0]
			
			if(params.comment_id == "-1") {
				coll = db.collection('creation').doc(params.cz_id)
				user.doc(params.user_id).update({ 'cz_like': dbCmd.pull(params.cz_id), 'like_num': dbCmd.inc(-1) })
				user.doc(params.auth_id).update({ 'blike_num': dbCmd.inc(-1) })
			}else {
				coll = db.collection('creation-comments').doc(params.comment_id)
				user.doc(params.user_id).update({ 'comments_like': dbCmd.pull(params.comment_id), 'like_num': dbCmd.inc(-1) })
				user.doc(params.auth_id).update({ 'blike_num': dbCmd.inc(-1) })
			}
			res = await coll.update({
				'like_count': dbCmd.inc(-1)
			})
		}
		
		console.log(res)
		return result
	}
}
