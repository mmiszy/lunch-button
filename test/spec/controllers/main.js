'use strict';

describe('Controller: MainCtrl', function () {

  // load the controller's module
  beforeEach(module('lunchButtonApp'));

  var MainCtrl,
    scope,
    Foursquareapi = {},
    Geolocation = {};

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MainCtrl = $controller('MainCtrl', {
      $scope: scope,
      Foursquareapi: Foursquareapi,
      Geolocation: Geolocation
    });
  }));

  it('should have changing waiting texts while loading', inject(function ($timeout) {
    scope.loading = true;
    scope.$digest();
    expect(scope.loadingTextIndex).not.toEqual('');
    var previousIndex = scope.loadingTextIndex;
    $timeout.flush();
    expect(scope.loadingTextIndex).not.toEqual('');
    expect(scope.loadingTextIndex).not.toEqual(previousIndex);
  }));

  it('should stop changing texts when loaded', inject(function ($timeout) {
    scope.loading = true;
    scope.$digest();
    expect(scope.loadingTextIndex).not.toEqual('');
    scope.loading = false;
    scope.$digest();
    expect(scope.loadingTextIndex).toEqual('');
  }));
});
