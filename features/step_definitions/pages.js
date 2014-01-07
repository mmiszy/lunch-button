var pages = function () {
	this.World = require("../support/world.js").World;

	this.When(/^I am on homepage$/, function(callback) {
	  this.browser.get('http://localhost:9001').then(callback);
	});
};

module.exports = pages;