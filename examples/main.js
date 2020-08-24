import Vue from 'vue'
import App from './App.vue'

//import Cc from '../public/cc/cc_mobile.umd.min.js'
//import '../public/cc/cc_mobile.css'
import ccmonitor from '../index.js'


Vue.config.productionTip = false
window.ccm_config={
	appCd:'c_h5'
}
ccmonitor.install()

new Vue({
	render: h => h(App),
}).$mount('#app')
var d='d'
console.log(d.d.length)
//console.error(222)
