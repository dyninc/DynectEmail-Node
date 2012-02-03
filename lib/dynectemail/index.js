var DynectEmailRequest = require("./dynectemail-request");

var DynectEmailNode = exports.DynectEmailNode = function(options) {
	options = options || {};
	this.url = "/rest";
	this.host = "emailapi.dynect.net";
	this.secure = options.secure || false;
	this.format = options.format || "json";
	this.apikey = options.apikey;
	this.useragent = options.useragent || 'dynectemail-node';
};

DynectEmailNode.prototype.request = function(method, params) {
	return new DynectEmailRequest(this, method, params);
};
