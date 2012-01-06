global.Gently = require("gently");
global.GENTLY_HIJACK = new Gently();
global.assert = require("assert");
global.DynectEmailNode = require("./../lib/dynectemail").DynectEmailNode;
if (process.setMaxListeners) {
    process.setMaxListeners(900);
}
global.emptyFn = function() { };
