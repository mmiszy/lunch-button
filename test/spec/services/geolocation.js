'use strict';

describe('Service: Geolocation', function () {

  // load the service's module
  beforeEach(module('lunchButtonApp'));

  // instantiate service
  var Geolocation,
    getCurrentPosition = jasmine.createSpy();
  beforeEach(inject(function (_Geolocation_) {
    Geolocation = _Geolocation_;

    navigator.__defineGetter__('geolocation', function () {
        return {
          getCurrentPosition: getCurrentPosition
        };
    });
  }));

  it('should have Geolocation service', function () {
    expect(!!Geolocation).toBe(true);
  });

  it('should allow getting current position', function () {
    expect(Geolocation.getCurrentPosition).toEqual(jasmine.any(Function));
  });

  it('should return promise', function () {
    expect(Geolocation.getCurrentPosition().then).toEqual(jasmine.any(Function));
  });

  it('should call native API', function () {
    Geolocation.getCurrentPosition();
    expect(getCurrentPosition).toHaveBeenCalled();
  });

});
