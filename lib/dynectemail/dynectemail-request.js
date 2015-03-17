if (global.GENTLY_HIJACK) require = GENTLY_HIJACK.hijack(require);

var http = require('http'),
	querystring = require('querystring'),
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
		var port = dynectemail.secure ? 443 : 80;
		var requestOptions = {host: dynectemail.host, port: port };
		var connection = http.request(requestOptions);
		var httpVerb = isWriteRequest() ? 'POST' : 'GET',
			url = dynectemail.url + '/' + dynectemail.format + '/' + method,
			port = port,
			requestParams = buildRequestParams(params),
			data = querystring.stringify(requestParams);
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
		var request = http.request(requestOptions);
		if (httpVerb == 'POST') {
			request.write(data);
		}
		request.on('response', chunkedResponse);
		request.end();
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
			headers['Content-Length'] = data.length;
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
				if (json.error) {
					that.emit('error', json);
					return;
				}
				that.emit('success', json);
			}
			catch(e) {
				that.emit('error', e)
			}
		});
	}
};

DynectEmailRequest.prototype = Object.create(DynectEmailBase.prototype);
