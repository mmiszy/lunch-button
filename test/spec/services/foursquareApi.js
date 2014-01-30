'use strict';

describe('Service: Foursquareapi', function () {

  // load the service's module
  beforeEach(module('lunchButtonApp'));

  // instantiate service
  var Foursquareapi,
    $httpBackend,
    FOURSQUARE;

  beforeEach(inject(function (_Foursquareapi_, _$httpBackend_, _FOURSQUARE_) {
    Foursquareapi = _Foursquareapi_;
    $httpBackend = _$httpBackend_;
    FOURSQUARE = _FOURSQUARE_;
  }));

  it('should have Foursquareapi service', function () {
    expect(!!Foursquareapi).toBe(true);
  });

  describe('getVenues', function () {
    it('should get venues', function () {
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

    it('should filter out bad venues', function () {
      var venues = false;

      runs(function () {
        $httpBackend.whenGET(/.venues\/search./).respond({response: {
          venues: [{
            id: '1',
            name: 'Surf Burger',
            stats: {
              tipCount: 1234
            },
            categories: [{id: '4bf58dd8d48988d1cb941735'}]
          }, {
            id: '2',
            name: 'McDonald\'s',
            stats: {
              tipCount: 0
            },
            categories: [{id: '4bf58dd8d48988d16f941735'}]
          }, {
            id: '3',
            name: 'Starbucks',
            stats: {
              tipCount: 10
            },
            categories: [{id: FOURSQUARE.EXCLUDED_CATEGORIES[0]}]
          }]
        }});

        Foursquareapi.getVenues({coords: {}}).then(function (v) {
          venues = v;
        });

        $httpBackend.flush();
      });

      waitsFor(function () { return venues; });

      runs(function () {
        expect(venues.length).toEqual(1);
        expect(venues[0].id).toEqual('1');
      });
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
