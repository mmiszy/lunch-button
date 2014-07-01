'use strict';

xdescribe('App setup', function () {
  beforeEach(module('lunchButtonApp'));

  it('should have 4sq config constants', inject(function ($injector) {
    var sq = $injector.get('FOURSQUARE');
    expect(sq).toBeTruthy();
  }));
});
