require("./common");
var _ = require("underscore"),
	querystring = require('querystring'),
	DynectEmailRequest = require("./../lib/dynectemail/dynectemail-request"),
	fakes = require("./fakes");

(function() {
	var dynectemail, connection, url, gently, request;
	
	// ##test 01
	(function() {
		dynectemail = new DynectEmailNode({ secure: true });
		assert.equal(true, dynectemail.secure);
	})();
})();
