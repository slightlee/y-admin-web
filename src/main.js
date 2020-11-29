import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import http from '@/http/httpRequest.js'
// 引入 element-ui
import ElementUI from 'element-ui'
// 引入 element-ui 的 css 文件
import 'element-ui/lib/theme-chalk/index.css';
// 声明使用 element-ui
Vue.use(ElementUI);

Vue.config.productionTip = false

// 全局挂载 http（axios）,使用的时候直接使用 this.$http 即可。
Vue.prototype.$http=http

// 非生产环境, 适配mockjs模拟数据
if (process.env.NODE_ENV !== 'production') {
  require('@/mock')
}

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
