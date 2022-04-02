import user from '@/store/modules/user.js'
import tabbar from '@/store/modules/tabbar.js'
import menuList from '@/store/modules/menuList.js'

// #ifndef VUE3
import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)
const store = new Vuex.Store({
	modules: {
		user,
		tabbar,
		menuList
	},
	strict: true
})
// #endif

// #ifdef VUE3
import {createStore} from 'vuex'
const store = createStore({
	modules: {
		user
	}
})
// #endif

export default store