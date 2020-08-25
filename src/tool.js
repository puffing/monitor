/**
* 格式化数据
* @param {Obj}  data 需要格式化的数据
* @param {Boolean} isCache 是否加入随机参数
* @return {String}   返回的字符串
*/
 /* eslint-disable */
const formateParams = function(data, isCache) {
	var arr = [];
	for (var name in data) {
		arr.push(encodeURIComponent(name) + '=' + encodeURIComponent(data[name]));
	}
	if (isCache) {
		arr.push('v=' + (new Date()).getTime());
	}
	return arr.join('&');
}
export default {
	isArray:function(arr){
		return Object.prototype.toString.call(arr) === '[object Array]'
	},
	guid:function () {
		function S4() {
			return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
	    }
	    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
	},
	setStorage:function(k,data){
		var _data;
		try{
			_data=JSON.stringify(data)
		}catch(e){
			_data = data
		}
		localStorage.setItem(k, _data)
	},
	getStorage:function(k){
		var data=localStorage.getItem(k)				
		try{
			return JSON.parse(data)
		}catch(e){
			
			return data
			
		}	
	},
	ajax:function(params,qs,async){
		var _async=async===void(0)?true:async
	 	params.type = (params.type || 'GET').toUpperCase();
 		params.data = params.data || {};
 		var formatedParams;
 		if(qs){
 			formatedParams = formateParams(params.data, params.cache);
 		}else{
 			formatedParams = params.data
 		}
 		var xhr;
 		var res;
 		//创建XMLHttpRequest对象
 		if (window.XMLHttpRequest) {
  		//非IE6
  			xhr = new XMLHttpRequest();
 		} else {
  			xhr = new ActiveXObject('Microsoft.XMLHTTP');
 		}
 		//异步状态发生改变，接收响应数据
 		xhr.onreadystatechange = function() {
	  		if (xhr.readyState == 4 && xhr.status == 200) {
	   			if (!!params.success) {
	    			if (typeof xhr.responseText == 'string') {
	     				params.success(JSON.parse(xhr.responseText));
	    			} else {
	    				 params.success(xhr.responseText);
	    			}
	   			}
	  		} else {
	   			params.error && params.error(status);
	  		}
 		}
	 	if (params.type == 'GET') {
		  	//连接服务器
		  	xhr.open('GET', (!!formatedParams ? params.url + '?' + formatedParams : params.url), _async);
		  	//发送请求
		  	res=xhr.send();
	 	} else {
		  	//连接服务器
	  		xhr.open('POST', params.url, _async);
		  	xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
		  	
		  	//发送请求
		  	res=xhr.send(formatedParams);
	 	}
	 	return res
	},
	getCoordinate:function(cb){
		if (navigator.geolocation){	
	    	navigator.geolocation.getCurrentPosition((res)=>{
	    		const latitude=res.coords.latitude
	    		const longitude=res.coords.longitude
	    		const resStr=longitude+';'+latitude
	    		if(cb){
	    			cb(resStr)
	    		}
	    	},(e)=>{
	    		if(cb){
	    			cb()
	    		}
	    		console.warn(e)
	    	},{
	    		enableHighaccuracy:false,
	    		timeout:3000,
	    		maximumAge:0
	    	});
	    	
	    }else{
	    	if(cb){
    			cb()
    		}
	    	console.warn('该浏览器不支持geolocation')
	    }
	},
	getDevice:()=>{
	    let agent = navigator.userAgent.toLowerCase();
	    let result = {
	      device: function () {
	        if (/windows/.test(agent)) {
	          return 'windows pc';
	        } else if (/iphone|ipod/.test(agent) && /mobile/.test(agent)) {
	          return 'iphone';
	        } else if (/ipad/.test(agent) && /mobile/.test(agent)) {
	          return 'ipad';
	        } else if (/android/.test(agent) && /mobile/.test(agent)) {
	          return 'android';
	        } else if (/linux/.test(agent)) {
	          return 'linux pc';
	        } else if (/mac/.test(agent)) {
	          return 'mac';
	        } else {
	          return 'other';
	        }
	      }(),
	    };
	    return result;
	    // console.log(result);
  	},
  	getBrower:()=>{
	    let agent = navigator.userAgent.toLowerCase();
	    let browser = { appname: 'unknown', version: '0' };
	    if(/(qqbrowser|ubrowser)\D+(\d[\d.]*)/.test(agent)) {//qq浏览器,UC浏览器
	      browser.appname = RegExp.$1;
	      browser.version = RegExp.$2;
	    } else if (/se[\s\.a-zA-Z\d]+metasr/.test(agent)) {
	      browser.appname = 'sougou';
	      browser.version = '0';
	    } else if (/(msie|firefox|opera|chrome|netscape)\D+(\d[\d.]*)/.test(agent)) {
	      browser.appname = RegExp.$1;
	      browser.version = RegExp.$2;
	    } else if (/version\D+(\d[\d.]*).*safari/.test(agent)) { // safari  
	      browser.appname = 'safari';
	      browser.version = RegExp.$2;
	    }
	    return browser;
	    // console.log(browser);
  	},
  	getPlatform:()=>{
    	let os = {
      		platform: navigator.platform.toLowerCase(),
    	};
    	return os;
  	// console.log(os);
  	},
  	jsonValueStrSubString:(obj,op)=>{
  		for(let n in op){
  			if(n in obj&&obj[n]){
  				obj[n].substring(op[n][0],op[n][1])
  			}
  		}
  		return obj
  	},
  	dateFormat:(date,fmt)=>{
  		fmt=fmt?fmt:'YYYY-mm-dd HH:MM:SS'
	    let ret;
	    const opt = {
	        "Y+": date.getFullYear().toString(),        // 年
	        "m+": (date.getMonth() + 1).toString(),     // 月
	        "d+": date.getDate().toString(),            // 日
	        "H+": date.getHours().toString(),           // 时
	        "M+": date.getMinutes().toString(),         // 分
	        "S+": date.getSeconds().toString()          // 秒
	        // 有其他格式化字符需求可以继续添加，必须转化成字符串
	    };
	    for (let k in opt) {
	        ret = new RegExp("(" + k + ")").exec(fmt);
	        if (ret) {
	            fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
	        };
	    };
	    return fmt;
	}

}

