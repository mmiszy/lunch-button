var assert = require('assert');
var path = require('path');

var protractor = require('protractor');
var webdriver = require('selenium-webdriver');

var driver = new webdriver.Builder().
  usingServer('http://localhost:4444/wd/hub').
  withCapabilities(webdriver.Capabilities.chrome()).
  build();

driver.manage().timeouts().setScriptTimeout(100000);

var ptor = protractor.wrapDriver(driver);

var World = function (callback) {
	this.browser = ptor;
	this.By = protractor.By;
	this.assert = assert;

	callback(this);
};

exports.World = World;