'use strict';

xdescribe('Service: Foursquareapi', function () {

  // load the service's module
  beforeEach(module('lunchButtonApp'));

  // instantiate service
  var Foursquareapi,
    $httpBackend;
  beforeEach(inject(function (_Foursquareapi_, _$httpBackend_) {
    Foursquareapi = _Foursquareapi_;
    $httpBackend = _$httpBackend_;
  }));

  it('should have Foursquareapi service', function () {
    expect(!!Foursquareapi).toBe(true);
  });

  describe('getVenues', function () {
    it('should get venue', function () {
      expect(Foursquareapi.getVenues).toEqual(jasmine.any(Function));
    });

    it('should return promise', function () {
      expect(Foursquareapi.getVenues({coords: {}}).then).toEqual(jasmine.any(Function));
    });

    it('should do an $http call', function () {
      var venues = false;

      runs(function () {
        $httpBackend.whenGET(/.venues\/search./).respond({response: {venues: []}});

        Foursquareapi.getVenues({coords: {}}).then(function (v) {
          venues = v;
        });

        $httpBackend.flush();
      });

      waitsFor(function () { return venues; });
    });
  });

  describe('getOneVenue', function () {
    it('should get venue', function () {
      expect(Foursquareapi.getOneVenue).toEqual(jasmine.any(Function));
    });

    it('should return promise', function () {
      expect(Foursquareapi.getOneVenue('myId', {coords: {}}).then).toEqual(jasmine.any(Function));
    });

    it('should do an $http call', function () {
      var venue = false;

      runs(function () {
        $httpBackend.whenGET(/./).respond({response: {venue: {}}});

        Foursquareapi.getOneVenue('myId', {coords: {}}).then(function (v) {
          venue = v;
        });

        $httpBackend.flush();
      });

      waitsFor(function () { return venue; });
    });
  });

});
