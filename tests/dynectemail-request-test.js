require("./common");
var _ = require("underscore"),
	querystring = require('querystring'),
	DynectEmailRequest = require("./../lib/dynectemail/dynectemail-request"),
	fakes = require("./fakes");

(function() {
	var dynectemail, connection, url, gently, request;
	
	var before = function() {
		dynectemail = new DynectEmailNode();
		connection = new fakes.Client(80, dynectemail.host);
		request = new fakes.ClientRequest();
		gently = new Gently();
		gently.expect(GENTLY_HIJACK.hijacked.http, "createClient", function() {
			return connection;
		});
	};
	
	// ##test 01
	(function() {
		before();
		gently.expect(connection, "request", function(method, url, options) {
			assert.equal("POST", method);
			assert.equal(dynectemail.host, options.host);
			return request;
		});
		var dynectemailRequest = new DynectEmailRequest(dynectemail, "any/method");
	})();
	
	// ##test 02
	(function() {
		before();
		gently.expect(connection, "request", function() {
			return request;
		});
		gently.expect(request, "end");
		var dynectemailRequest = new DynectEmailRequest(dynectemail);
	})();
	
	// ##test 03
	(function() {
		before();
		gently.expect(connection, "request", function(method, url, options) {
		assert.equal("dynectemail-node", options["User-Agent"]);
			return request;
		});
		var dynectEmailRequest = new DynectEmailRequest(dynectemail, "any/method");
	})();
	
	// ##test 04
	(function() {
		before();
		var useragent = "custom-user-agent";
		gently.expect(connection, "request", function(method, url, options) {
			assert.equal(useragent, options["User-Agent"]);
			return request;
		});
		dynectemail = new DynectEmailNode({ useragent: useragent });
		var dynectemailRequest = new DynectEmailRequest(dynectemail, "any/method");
	})();
})();

(function() {

	var dynectemail, connection, url, gently, request, params;

	var before = function() {
		dynectemail = new DynectEmailNode();
		connection = new fakes.Client(80, dynectemail.host);
		request = new fakes.ClientRequest();
		gently = new Gently();
		params = { foo:"bar" };
		gently.expect(GENTLY_HIJACK.hijacked.http, "createClient", function() {
			return connection;
		});
	};
	
	(function() {
		before();
		gently.expect(connection, "request", function(method, url, options) {
			assert.equal("POST", method);
			assert.equal(dynectemail.url + '/' + dynectemail.format + '/any/method', url);
			assert.equal(dynectemail.host, options.host);
			return request;
		});
		var dynectEmailRequest = new DynectEmailRequest(dynectemail, "any/method", params, 'POST');
	})();

	(function() {
		before();
		gently.expect(connection, "request", function(method, url, options) {
			assert.ok(options["Content-Length"]);
			assert.equal("application/x-www-form-urlencoded", options["Content-Type"]);
			return request;
		});
		var dynectEmailRequest = new DynectEmailRequest(dynectemail, "any/method", params);
	})();
})();

(function() {
	var dynectemail, connection, url, gently, request, receivedData;

	var before = function () {
		dynectemail = new DynectEmailNode();
		connection = new fakes.Client(80, dynectemail.host);
		request = new fakes.ClientRequest();
		gently = new Gently();
		gently.expect(GENTLY_HIJACK.hijacked.http, "createClient", function() {
			return connection;
		});
	};

	(function() {
		before();
		whenReceiving("{\"testdata\":\"received\"}");
		expectRequestToEmit(function(event, data) {
			assert.equal("success", event);
			assert.equal("received", data.testdata);
		});
	});

	(function() {
		before();
		whenReceiving("{\"testdata\"");
		expectRequestToEmit(function(event, error) {
			assert.equal("error", event);
			assert.ok(error);
		});
	});

	(function() {
		before();
		whenReceiving(["{\"testda", "ta\":\"recei", "ved\"}"]);
		expectRequestToEmit(function(event, data) {
		assert.equal("success", event);
		assert.equal("received", data.testdata);
		});
	})();

	(function() {
		before();
		var xml = "<somexml />";
		dynectemail.format = "xml";
		whenReceiving(xml);
		expectRequestToEmit(function(event, data) {
			assert.equal(xml, data);
		});
	})();

	function whenReceiving(data) {
		if (data.constructor.name !== 'Array') {
			data = [data];
		}
		receivedData = data;
	}

	function expectRequestToEmit(expectation) {
		gently.expect(connection, "request", function() {
			return request;
		});
		var dynectemailRequest = new DynectEmailRequest(dynectemail);
		gently.expect(dynectemailRequest, "emit", expectation);
		var response = new fakes.ClientResponse();
		request.emit("response", response);
		_(receivedData).each(function(data) {
			response.emit("data", data);
		});
		response.emit("end");
	}
})();

