if (global.GENTLY_HIJACK) require = GENTLY_HIJACK.hijack(require);

var http = require('http'),
	Qs = require('qs');
	_ = require('underscore'),
	DynectEmailBase = require('./dynectemail-base');

var WRITE_METHODS = [
					//accounts
					'accounts', 'accounts/delete',
					//senders
					'senders', 'senders/delete',
					//recipients
					'recipients/activate', 'recipients/status',
					//send
					'send'];
				
var REQUEST_METHODS = [
					//accounts
					'accounts', 'accounts/xheaders',
					//senders
					'senders', 'senders/details', 'senders/dkim',
					//recipients
					'recipients/activate', 'recipients/status',
					//reports
					'reports/sent', 'reports/sent/count', 'reports/delivered',
					'reports/delivered/count', 'reports/bounces', 'reports/bounces/count', 
					'reports/complaints','reports/complaints/count', 'reports/issues', 
					'reports/issues/count', 'reports/opens','reports/opens/count', 
					'reports/clicks', 'reports/clicks/count', 
					//suppressions
					'suppressions', 'suppressions/count', 'suppressions/activate'];

var DynectEmailRequest = module.exports = function(dynectemail, method, params) {
	var that = this;
	DynectEmailBase.call(this);
	params = params || {};

	that.registerHandlers(params.handlers);

	sendRequest(dynectemail, params);

	function sendRequest(dynectemail, params) {
		var httpVerb = isWriteRequest() ? 'POST' : 'GET',
			url = dynectemail.url + '/' + dynectemail.format + '/' + method,
			port = dynectemail.secure ? 443 : 80,
			requestOptions = {host: dynectemail.host, port: port },
			connection = http.request(requestOptions)
			requestParams = buildRequestParams(params),
			data = Qs.stringify(requestParams);
		connection.on('error', function(error) {
			that.emit('error', error);
		});
		if (httpVerb == 'GET') {
			url += '?' + data;
		}
		
		var headers = requestHeaders(httpVerb, dynectemail.host, data);
		requestOptions['headers'] = headers;
		requestOptions['path'] = url;
		requestOptions['method'] = httpVerb;
		console.log('Request Options');
		console.log(JSON.stringify(requestOptions, null, 4));
		if (httpVerb == 'POST') {
			var request = http.request(requestOptions, chunkedResponse);
			request.on('error', function(e) {
				console.log('problem with request: ' + e.message);
			});
			console.log('Post Data');
			console.log(JSON.stringify(data, null, 4));
			request.setTimeout(5000);
			// write data to request body
			request.write(data);
			console.log('Data has been POSTed');
			request.end();
		} else {
			// Use convenience method for simple get
			// This calls end
			var request = http.get(requestOptions, chunkedResponse(response))
		}
	}

	function buildRequestParams(params) {
		var requestParams = that.filterParameters(params, []);

		requestParams.apikey = requestParams.apikey || dynectemail.apikey;
		return requestParams;
	}

	function isWriteRequest() {
		return params.reqtype || isWriteMethod(method);
	}

	function isWriteMethod(method) {
		if(typeof method == 'undefined')
			return 'senders'; //default request if one is not provided
		return method || _(WRITE_METHODS).include(method.toLowerCase());
	}

	function requestHeaders(httpVerb, host, data) {
		var headers = {
			host: host
		};
		headers['User-Agent'] = dynectemail.useragent;
		if (httpVerb == 'POST') {
			headers['Content-Length'] = Buffer.byteLength(data);
			headers['Content-Type'] = 'application/x-www-form-urlencoded';
		}

		return headers;
	}

	function chunkedResponse(response) {
		var data = '';
		response.on('data', function(chunk) {
			data += chunk.toString('utf8');
		});
		response.on('end', function() {
			if (dynectemail.format !== 'json') {
				that.emit('success', data);
				return;
			}
			try {
				var json = JSON.parse(data);
				console.log('Response Data');
				console.log(JSON.stringify(data, null, 4));
				if (json.error) {
					console.log('JSON Error %s', json.error);
					that.emit('error', json);
					return;
				}
				that.emit('success', json);
				return;
			}
			catch(e) {
				console.log('Response Error %s', e);
				that.emit('error', e)
				return;
			}
		});
		response.on('timeout',  function() {
			console.log('Timeout');
			that.emit('error');
			return
		});

	}
};

DynectEmailRequest.prototype = Object.create(DynectEmailBase.prototype);
