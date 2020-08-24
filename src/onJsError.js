 /* eslint-disable */


export default function onJsError(cb) {

    // 重写console.error, 可以捕获更全面的报错信息
	window.jsMonitorStarted=false
	var oldError = console.error;
	var that=this
	console.error = function () {
		// arguments的长度为2时，才是error上报的时机
//		if (arguments.length < 2) return;
		var errorMsg = arguments[0];
		cb&&cb.bind(that)(errorMsg,'', 0, 0, '')
		return oldError.apply(console, arguments);
	};
    // 重写 onerror 进行jsError的监听
	window.onerror = function(errorMsg,errorFile, lineNumber, columnNumber, errorObj){

		var errorStack = errorObj ? errorObj.stack : null;		
		cb&&cb.bind(that)(errorMsg , lineNumber, columnNumber,errorFile, errorStack)
	};
    
  };