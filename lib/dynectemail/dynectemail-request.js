if (global.GENTLY_HIJACK) require = GENTLY_HIJACK.hijack(require);

var http = require('http'),
	https = require('https')
	qs = require('qs'),
	_ = require('underscore'),
	DynectEmailBase = require('./dynectemail-base'),
	logger = require("../logger")

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
	logger.debuglevel = dynectemail.debuglevel;

	that.registerHandlers(params.handlers);

	sendRequest(dynectemail, params);

	function sendRequest(dynectemail, params) {
		var httpVerb = isWriteRequest() ? 'POST' : 'GET',
			url = dynectemail.url + '/' + dynectemail.format + '/' + method,
			port = dynectemail.secure ? 443 : 80,
			requestOptions = {host: dynectemail.host, port: port },
			requestParams = buildRequestParams(params),
			data = qs.stringify(requestParams),
			headers = requestHeaders(httpVerb, dynectemail.host, data);
		requestOptions['headers'] = headers;
		requestOptions['path'] = url;
		requestOptions['method'] = httpVerb;
		logger.log('debug', 'Request Options\n' + JSON.stringify(requestOptions, null, 4));
		if (httpVerb == 'GET') {
			url += '?' + data;
		}
		if (dynectemail.secure) {
			var request = https.request(requestOptions, chunkedResponse);
		} else {
			var request = http.request(requestOptions, chunkedResponse);
		}
		request.on('error', function(e) {
  			logger.log('error', 'Problem with request: ' + e.message);
		});
		if (httpVerb == 'POST') {
			logger.log('debug', 'POST data\n' + data);
			request.write(data);
		}
		// request.on('response', chunkedResponse);
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
				logger.log('debug', 'Response: ' + data);
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
