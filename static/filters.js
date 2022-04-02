

export function czStatus (v) {
	if(v === 1) return '已发布'
	else if(v === 0) return '草稿箱'
	return '未知'
}
