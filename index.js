
import tool from './src/tool.js'
import onJsError from './src/onJsError.js'
import packageJson from './package.json'
let timeObj=''
let cm_run_installed=false
let info={
	brower:'',
	platform:'',
	device:''
}
class Cc_monitor {
	constructor(config) {
		this.limit=config.limit||10 //超过限制将发送请求
		this.max=config.max||40 //最大条数，超过将清空缓存
		this.errorNumLimit=config.errorNumLimit||50
		this.apiBaseUrl=config.apiBaseUrl||'./aaa'
		this.waitLoginName=config.waitLoginName||false
		this.registered={}
		this.errorNum=0
		this.coordinate=''
		
	}
	usePagehideSend(cb){
		/**
		 *	使用页面关闭时发送所有数据 
		 */
		window.addEventListener('pagehide',()=>{
			if(this.waitLoginName&&(window.ccm_config?!window.ccm_config.loginName:true)){
				return
			}
			if(cb){
				cb()
			}
			let res=[];
			let _r;
			for(var n in this.registered){				
				_r=this.send(n,false);
				if(!(typeof _r=='object'&&_r.code=='ok')&&_r){
					res.push(_r)			
				}
			}
			if(res.length>0){
				tool.setStorage('ccMonitorError',res)//缓存错误
			}else{
				tool.setStorage('ccMonitorError','')//清除缓存错误
			}
			
		})		
	}
	register(code,apiUrl){
		this.registered[code]={
			hasData:false,
			apiUrl:apiUrl
		}
		if(code=='jsError'){
			onJsError.bind(this)(this.onJsErrorHandle)
		}
	}
	getUid(){
		//生成uid
		let ccm_base_uid=tool.getStorage('ccm_base_uid')
		if(ccm_base_uid){
			return ccm_base_uid
		}else{
			ccm_base_uid=tool.guid()
			tool.setStorage('ccm_base_uid',ccm_base_uid)
			return ccm_base_uid
		}
	}
	getCCM_config(){
		let ccm_config_area={}
		if(window.ccm_config&&typeof window.ccm_config == 'object'){
			ccm_config_area=window.ccm_config
		}
		if(!ccm_config_area.appCd){
			throw ('没有appCd,请设置ccm_config变量，如window.ccm_config={appCd:yourAppCd}')
		}
		return ccm_config_area
	}
	
	getTempData(code){
		const CCM_config=this.getCCM_config()
		const data={
			appCd:CCM_config.appCd,
			loginName:CCM_config.loginName,
			uId:this.getUid(),

			brower:info.brower?info.brower.appname+' '+info.brower.version:'',
			platform:info.platform,
			device:info.device
		}
		if(code!='jsError'){
			data['coordinate']=CCM_config.coordinate||this.coordinate
		}

		return data
	}
	updateLoginName(){
		//遍历loginName
		const CCM_config=this.getCCM_config()
		for(let n in this.registered){				
			let storageName=this.getStorageName(n);			
			let storageData=tool.getStorage(storageName)
			if(storageData){
				for(let x in storageData){
					storageData[x]['loginName']=CCM_config.loginName
				}
			}	
			tool.setStorage(storageName,storageData)
		}
		if(CCM_config.loginName){
			this.startTimingTask()
		}
	}
	updateCCMconfig(op){
		//更新配置		
		if(!window.ccm_config){
			window.ccm_config={}
		}
		for(var n in op){
			window.ccm_config[n]=op[n]
		}
		if('loginName' in op){
			this.updateLoginName()
		}
	}
	__print(code){
		switch(code){
			case 'errorExceed':
				console.warn('连续请求错误超过'+this.errorNumLimit+'自动关闭监控系统，请检查请求接口')
				break;
			case 'dataExceedMax':
				console.error('请求数据过多，请检查接口是否调用')
				break;
			case 'noAppCd':
				console.error('需要 appCd')
				break;
		}
	}
	
	getStorageName(type){
		if(type in this.registered){
			return 'ccm_'+type
		}else{
			throw ('没有注册'+type)
		}

	}
	
	onJsErrorHandle(origin_errorMsg, origin_lineNumber, origin_columnNumber,origin_file, origin_errorObj){
		var errorMsg = origin_errorMsg ? origin_errorMsg : '';
		var errorObj = origin_errorObj ? origin_errorObj : '';
		var errorStackStr;
		let errorType;
		if(errorObj){
			errorStackStr = JSON.stringify(errorObj)
			errorType = errorStackStr.split(": ")[0].replace('"', "");
			
		}
		var obj={'errorType':errorType,'errorMsg':errorMsg,'errorFile':origin_file,'lineNumber':origin_lineNumber,'columnNumber':origin_columnNumber,'errorStack':errorStackStr} 
		tool.jsonValueStrSubString(obj,{
			errorType:[0,32],
			errorMsg:[0,80],
			errorFile:[0,32],
			errorStack:[0,200]
		})
		this.addJsError(obj)
	}
	
	addVisit(name,describe,u) {
		/** 添加访问页面信息
		 */
		const coordinate=tool.getCoordinate()
		let _u=u?u:window.location.href
		_u=_u.substr(0,200)
		let _data={
			pageName:name,
			explain:describe,
			coordinate:coordinate,
			url:_u
		}
		
		this.pushData(_data,'visit')
	}
	addEvent(name,describe) {	
		/** 添加自定义事件
		 */
		let _data={
			eventName:name,
			explain:describe
		}		
		this.pushData(_data,'event')
	}
	addJsError(data) {
		/** 添加js错误
		 */
		let _data=data
		let u=window.location.href
		u=u.substr(0,100)
		_data['url']=u
		this.pushData(_data,'jsError')
	}
	clearData(code) {		
		let storageName=this.getStorageName(code);		
		tool.setStorage(storageName,'')
	}
	hasData(){
		let hasFlag=false
		for(var n in this.registered){
			if(this.registered[n].hasData){
				hasFlag=true
			}
		}
		return hasFlag
	}
	startTimingTask(){

		if(timeObj){
			return
		}
		
		timeObj=setInterval(()=>{
			for(var n in this.registered){
				this.send(n);
			}
			const hasFlag=this.hasData()

			if(!hasFlag){
				this.stopTiming()
			}
			if(this.errorNum>this.errorNumLimit){
				this.__print('errorExceed')
				this.stopTiming()
				return
			}
		},3000)
	}
	stopTiming(){
		timeObj&&clearInterval(timeObj)
		timeObj=null
	}
	pushData(data,code){	
		try{
			if(this.errorNum>this.errorNumLimit){
				this.__print('errorExceed')
				return
			}			
			const tempData=this.getTempData(code)
			data=Object.assign(data,tempData);
	
			let storageName=this.getStorageName(code);
			
			let storageData=tool.getStorage(storageName)
			if(!tool.isArray(storageData)){
				storageData=[]
			}
			if(storageData.length>this.max){
				storageData=[data]
				this.__print('dataExceedMax')
			}else{
				storageData.push(data)	
			}	
	
			this.registered[code].hasData=true//告诉定时任务，有数据	
			if(storageData.length>this.limit){
				if(this.waitLoginName&&!data.loginName){
					this.stopTiming()
					return
				}
				this.send(storageName) //立即执行
			}else{	
	
				tool.setStorage(storageName,storageData)
			}
			if(this.waitLoginName&&!data.loginName){
				this.stopTiming()
				return
			}
			this.startTimingTask()//开启定时任务			
		}catch(e){
			console.warn(e)
		}			
	}
	send(code,async){
		if(!code){
			console.warn('必须传入第一个参数，如visit;event等字符串')
			return
		}
		
		try{
			let storageName=this.getStorageName(code);			
			let storageData=tool.getStorage(storageName)
			if(!tool.isArray(storageData)||storageData.length==0){
				this.registered[code].hasData=false //告诉定时任务，无数据	
				return
			}

			const m_url=this.apiBaseUrl+this.registered[code].apiUrl

			storageData=JSON.stringify(storageData)
			let res=tool.ajax({
				type:'post',
				url:m_url,
				data:storageData,
				success:()=>{
					tool.setStorage(storageName,'')
					this.errorNum=0
				},
				error:()=>{
					this.errorNum=this.errorNum+1 //错误计数
				}
			},'',async)
			if(async===false){
				if(typeof res=='object'&&res.code=='ok'){
					tool.setStorage(storageName,'')
					this.errorNum=0
				}else{
					console.warn(res)					
				}
			}
			return res
		}catch(e){
			console.log(e)
			return e
		}	
		
	}
}
const cm_run=(op)=>{
	if(cm_run_installed) return	

	info.device=tool.getDevice().device
	info.brower=tool.getBrower()
	info.platform=tool.getPlatform().platform
	
	window['ccm']=new Cc_monitor({
		limit:10,
		max:40,
		errorNumLimit:50,
		apiBaseUrl:op&&op.apiBaseUrl?op.apiBaseUrl:'/api',
		waitLoginName:op&&op.waitLoginName?op.waitLoginName:false//等待有LoginName时触发
	})
	
	try{
		tool.getCoordinate((res)=>{
			window['ccm'].coordinate=res
		})
	}catch(e){
		console.log(e)
	}
	const open=op&&op.open?op.open:{
		'event':true,
		'visit':true,
		'jsError':true
	}
	const apiPath={
		'event':op&&op.api&&op.api.event?op.api.event:'/s_statistics/addEvent',
		'visit':op&&op.api&&op.api.event?op.api.visit:'/s_statistics/addVisit',
		'jsError':op&&op.api&&op.api.event?op.api.jsError:'/s_statistics/addErrorJs'
	}
	open.event&&window['ccm'].register('event',apiPath.event)
	open.visit&&window['ccm'].register('visit',apiPath.visit)
	open.jsError&&window['ccm'].register('jsError',apiPath.jsError)
	
	console.log('cc_monitor 启动成功')
	
	var ccMonitorError=tool.getStorage('ccMonitorError')
	if(ccMonitorError&&ccMonitorError.length>0){
		console.log('ccMonitorError:',ccMonitorError)
	}

}

export default {
	'install':cm_run,
	'version':packageJson.version,
	
}
