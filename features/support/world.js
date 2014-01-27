var assert = require('assert'),
    path = require('path'),
    browserName = process.env.browser || 'chrome',
    protractor = require('protractor'),
    webdriver = require('selenium-webdriver'),
    exec = require('child_process').exec,
    util = require('util')
;

var driver = new webdriver.Builder().usingServer('http://localhost:4444/wd/hub').withCapabilities(webdriver.Capabilities[browserName]()).build();

driver.manage().timeouts().setScriptTimeout(100000);

var browser = protractor.wrapDriver(driver);

module.exports = function() {
  this.registerHandler('AfterFeatures', function (e, done) {
    browser.quit();

    if (browserName === 'chrome') {
      exec('pkill chromedriver');
    } else if (browserName === 'phantomjs') {
      exec('pkill phantomjs');
    }

    setTimeout(function() {
       done();
    }, 500);
  });

  this.World = module.exports.World;
};

module.exports.World = function World(callback) {
  this.browser = browser;
  this.By = protractor.By;
  this.p = protractor;
  this.assert = assert;
  this.baseUrl = 'http://localhost:9000/';

  callback();
};