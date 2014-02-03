var assert = require('assert');

var starting = function () {
    this.Then(/^I should see the foursquare link in the footer$/, function(callback) {
       this.browser.findElement(this.By.css('footer.tcc a'))
        .getAttribute('href')
        .then(function (src) {
            assert.equal( (/foursquare.com/).test(src), true );
            callback();
        });
    });
};

module.exports = starting;