var EventEmitter = require('events').EventEmitter,
	_ = require('underscore');

var DynectEmailBase = function() {
	EventEmitter.call(this);
};

DynectEmailBase.prototype = Object.create(EventEmitter.prototype);

DynectEmailBase.prototype.registerHandlers = function(handlers) {
	if (typeof handlers !== 'object') {
		return;
	}

	var that = this;
	_(handlers).each(function(value, key) {
		that.on(key, value);
	});
};

var defaultBlacklist = ['error', 'success', 'handlers'];
DynectEmailBase.prototype.filterParameters = function(parameters, blacklist) {
	var filteredParams = {};
	_(parameters).each(function(value, key) {
		if (isBlackListed(key)) {
			return;
		}
		filteredParams[key] = value;
	});
	return filteredParams;

	function isBlackListed(name) {
		return _(defaultBlacklist).include(name) || _(blacklist).include(name);
	}
};

DynectEmailBase.prototype.scheduleCallback = function(callback, delay) {
	return setTimeout(callback, delay);
};

DynectEmailBase.prototype.cancelCallback = function(identifier) {
	clearTimeout(identifier);
};

module.exports = DynectEmailBase;
