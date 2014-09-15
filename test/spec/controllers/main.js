'use strict';

describe('Controller: MainCtrl', function () {

  // load the controller's module
  beforeEach(module('lunchButtonApp'));

  var MainCtrl,
    scope,
    Foursquareapi = {},
    Geolocation = {},
    $q,
    $timeout;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, _$q_, _$timeout_) {
    scope = $rootScope.$new();
    MainCtrl = $controller('MainCtrl', {
      $scope: scope,
      Foursquareapi: Foursquareapi,
      Geolocation: Geolocation
    });

    $q = _$q_;
    $timeout = _$timeout_;
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

  describe('Geolocation fails', function () {
    Geolocation.getCurrentPosition = jasmine.createSpy().andCallFake(function () {
      var deferred = $q.defer();
      $timeout(function () {
        deferred.reject('Turn on GPS');
      });
      return deferred.promise;
    });

    it('should show error', function () {
      scope.getLunchVenue();
      $timeout.flush();
      expect(scope.errorMessage).toBeTruthy();
    });
  });
});
