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

  it('should stop changing texts when loaded', function () {
    scope.loading = true;
    scope.$digest();
    expect(scope.loadingTextIndex).not.toEqual('');
    scope.loading = false;
    scope.$digest();
    expect(scope.loadingTextIndex).toEqual('');
  });

  describe('Geolocation works', function () {
    beforeEach(function () {
      Geolocation.getCurrentPosition = jasmine.createSpy().andCallFake(function () {
        var deferred = $q.defer();
        $timeout(function () {
          deferred.resolve();
        });
        return deferred.promise;
      });
    });

    describe('caching', function () {
      beforeEach(function () {
        Foursquareapi.getVenues = jasmine.createSpy().andCallFake(function () {
          var deferred = $q.defer();
          deferred.resolve([{}, {}]);
          return deferred.promise;
        });
        Foursquareapi.getOneVenue = jasmine.createSpy().andCallFake(function () {
          var deferred = $q.defer();
          deferred.resolve({});
          return deferred.promise;
        });
        Foursquareapi.getRandomTipForVenue = jasmine.createSpy();
      });

      it('should cache subsequent requests', function () {
        scope.getLunchVenue();
        $timeout.flush();
        scope.getLunchVenue();
        $timeout.flush();
        expect(Foursquareapi.getVenues.callCount).toEqual(1);
      });

      it('should not cache if any parameters change', function () {
        scope.search.distance = 1000;

        scope.getLunchVenue('meal');
        $timeout.flush();
        scope.getLunchVenue('meal');
        $timeout.flush();
        expect(Foursquareapi.getVenues.callCount).toEqual(1);

        scope.getLunchVenue('beer');
        $timeout.flush();
        expect(Foursquareapi.getVenues.callCount).toEqual(2);

        scope.getLunchVenue('beer');
        $timeout.flush();
        expect(Foursquareapi.getVenues.callCount).toEqual(2);

        scope.search.distance = 500;
        scope.getLunchVenue('beer');
        $timeout.flush();
        expect(Foursquareapi.getVenues.callCount).toEqual(3);
      });
    });
  });

  describe('Geolocation fails', function () {
    beforeEach(function () {
      Geolocation.getCurrentPosition = jasmine.createSpy().andCallFake(function () {
        var deferred = $q.defer();
        $timeout(function () {
          deferred.reject('Turn on GPS');
        });
        return deferred.promise;
      });
    });

    it('should show error', function () {
      scope.getLunchVenue();
      $timeout.flush();
      expect(scope.errorMessage).toBeTruthy();
    });
  });
});
