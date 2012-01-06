require('./common');
var DynectEmailBase = require("./../lib/dynectemail/dynectemail-base");

(function() {
	// ##test 01
	var events = { expected: function(){} };
	var gently = new Gently();
	var dynectemailBase = new DynectEmailBase();
	gently.expect(events, "expected");
	dynectemailBase.on("test", function() {
		events.expected();
	});
	dynectemailBase.emit("test");
})();

(function() {
	// ##test 02
	var handlers = {
		error: function() { },
		success: function() { },
		anything: function() { }
	};
	var gently = new Gently();
	gently.expect(handlers, "error");
	gently.expect(handlers, "success");
	gently.expect(handlers, "anything");
	var dynectemailBase = new DynectEmailBase();
	dynectemailBase.registerHandlers(handlers);
	dynectemailBase.emit("error");
	dynectemailBase.emit("success");
	dynectemailBase.emit("anything");
})();

(function() {
	var dynectemailBase = new DynectEmailBase();
	var original = { one: 1, two: 2, three: 3 };
	var copy;
	
	// ##test 03
	(function() {
		var copy = dynectemailBase.filterParameters(original);
		assert.deepEqual(copy, original);
	})();
	
	// ##test 04
	(function() {
		copy = dynectemailBase.filterParameters(original);
		copy.four = 4;
		assert.notDeepEqual(copy, original);
	})();
	
	// ##test 05
	(function() {
		copy = dynectemailBase.filterParameters(original, ["one", "three"]);
		assert.equal(typeof copy.one, "undefined");
		assert.equal(typeof copy.three, "undefined");
		assert.equal(copy.two, 2);
	})();
	
	// ##test 06
	(function() {
		copy = dynectemailBase.filterParameters({
			error: emptyFn,
			success: emptyFn,
			handlers: { }
		});
		assert.equal(typeof copy.error, "undefined");
		assert.equal(typeof copy.success, "undefined");
		assert.equal(typeof copy.handlers, "undefined");
	})();
	
})();
