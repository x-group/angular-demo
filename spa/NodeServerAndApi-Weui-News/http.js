/* Final Server */
var http = require('http'),
	fs = require('fs'),
	url = require('url'),
	querystring = require('querystring');
path = require('path'),
	mime = require('./mime');

http.createServer(function(request, response) {
	//路由
	//get path from request's url
	var pathname = url.parse(request.url).pathname;
	//map the path to server path
	var absPath = __dirname + "/webroot" + pathname;
	//test whether the file is exists first
	//path.exists已经剔除现在改用fs.exists
	//判断文件是否存在
	fs.exists(absPath, function(exists) {
		if(exists) {
			//二进制方式读取文件
			fs.readFile(absPath, 'binary', function(err, data) {
				//our work is here
				if(err) throw err;
				//获取合适的 MIME 类型并写入 response 头信息
				var ext = path.extname(pathname);
				//把.html处理成html
				ext = ext ? ext.slice(1) : 'unknown';
				var contentType = mime.types[ext] || "text/plain";
				response.writeHead(200, {
					'Content-Type': contentType
				});
				//console.log(data);
				//使用二进制模式写
				response.write(data, 'binary');
				response.end();
			});
		} else {
			//show 404
			//response.end('404 File not found.');
		}
	});
	var paramStr = url.parse(request.url).query;
	//将参数转化为json对象
	//例如把?callback=JSON_CALLBACK&name=yao 转化为对象{callback:'JSON_CALLBACK',name:'yao'}
	var param = querystring.parse(paramStr);
	console.log(pathname)
	switch(pathname) {
		case '/indexTest':
			//在首页时候的默认相应 JSON.stringify()转字符串
			response.end(param.callback + "(" + JSON.stringify(datas) + ")");
			break;
		case '/rebot':
			//执行代理请求，请求图灵机器人接口，并返回jsonp
			//responseRebotMessage(param, response);
			break;
		case '/api':
			//执行代理请求，请求图灵机器人接口，并返回jsonp
			newApi(param, response);
			break;
		default:
			//读文件的方式，展示html页面
			//responseIndex(response);
			break;
	}
}).listen(8889);
console.log('Server start in port 8889');

function newApi(param, response) {
	var data = {
		channelId: '5572a109b3cdc86cf39001db',
		channelName: '国内最新',
		title: '上市',
		needContent: '0',
		needHtml: '0',
		page: param.page,
	};
	http.request({
		//域名
		hostname: 'apis.baidu.com',
		//端口号
		port: '80',
		//路由和参数  后面是需要提交的数据
		path: '/showapi_open_bus/channel_news/search_news?' + querystring.stringify(data),
		//请求方法 可以为post
		method: 'GET',
		//这里放期望发送出去的请求头
		//注意百度是把API KEY放在请求头里面
		headers: {
			'apiKey': '0aea38d1a7c4443f2f00adc86c4c3e72'
		}
	}, function(resquest) {
		resquest.setEncoding('utf8');
		var str = '';
		resquest.on('data', function(data) {
			str += data;
		});
		resquest.on('end', function() {
			response.end(param.callback + "(" + JSON.stringify(str) + ")");
		})
	}).on('error', function(e) {
		console.log('problem with request: ' + e.message);
	}).end();
}