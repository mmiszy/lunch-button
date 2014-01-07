var sharing = function () {
	this.World = require("../support/world.js").World;

	this.Then(/^I can see the facebook like button$/, function(callback) {
	  callback.pending();
	});
};

module.exports = sharing;