import Vue from 'vue'
import Vuex from 'vuex'
import user from './module/user.js'
import common from './module/common.js'


Vue.use(Vuex)

export default new Vuex.Store({
  state: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    user,
    common
  }
})
