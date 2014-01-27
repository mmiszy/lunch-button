var assert = require('assert');

var starting = function () {
	this.Then(/^I should see the shake icon$/, function(callback) {
	   this.browser.findElement(this.By.css('.category-title'))
        .getAttribute('src')
        .then(function (src) {
            assert.equal( (/meal-title.png$/).test(src), true );
            callback();
        });
	});
};

module.exports = starting;