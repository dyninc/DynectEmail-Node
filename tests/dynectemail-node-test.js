require("./common.js");

var querystring = require("querystring");

(function() {
	// ##test 01
	var dynectemail = new DynectEmailNode();

	assert.equal("emailapi.dynect.net", dynectemail.host);
})();

(function() {
	// ##test 02
	var dynectemail = new DynectEmailNode({
		apikey: "abcdef12345"
	});

	assert.equal("abcdef12345", dynectemail.apikey);
})();
