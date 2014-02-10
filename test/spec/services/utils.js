'use strict';

describe('Service: Utils', function () {

  // load the service's module
  beforeEach(module('lunchButtonApp'));

  // instantiate service
  var Utils;

  describe('cordova not present', function () {
    beforeEach(inject(function($window, _Utils_) {
      Utils = _Utils_;
    }));

    it('should detect non-Cordova environment', inject(function ($window) {
      expect(Utils.isCordova()).toBe(false);
    }));
  });

  describe('cordova present', function () {
    beforeEach(inject(function($window) {
      $window.cordova = {};
    }));
    beforeEach(inject(function(_Utils_) {
      Utils = _Utils_;
    }));

    it('should detect Cordova environment on construct', inject(function () {
      expect(Utils.isCordova()).toBe(true);
    }));
  });
});
