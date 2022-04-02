'use strict';
exports.main = async (event, context) => {
	//event为客户端上传的参数
	console.log('event : ', event)
	const {action, fileList} = event
	switch (action) {
		case 'deleteFile':
			return await uniCloud.deleteFile({
			    fileList
			});
			// console.log(result)
			// if(result[0].success) {
			// 	return {
			// 		code: 0,
			// 		msg: '删除成功'
			// 	}
			// }else {
			// 	return {
			// 		code: 1,
			// 		msg: '删除失败'
			// 	}
			// }
			
			break;
		default:
			return {
				code: 403,
				msg: '非法访问'
			}
			break;
	}
};
