var pages = function () {
	this.When(/^I am on homepage$/, function(callback) {
	  this.browser.get(this.baseUrl).then(callback);
	});
};

module.exports = pages;