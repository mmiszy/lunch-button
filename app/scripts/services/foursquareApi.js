'use strict';

angular.module('lunchButtonApp')
  .service('Foursquareapi', ['$http', 'FOURSQUARE', 'MAX_DISTANCE', '$q', function Foursquareapi($http, FOURSQUARE, MAX_DISTANCE, $q) {
    var deferred = $q.defer();

    var filterBadVenues = function (venues) {
      return venues.filter(function (venue) {
        return !!venue.stats.tipCount;
      });
    };

    this.getVenues = function (position) {
      var categories = [FOURSQUARE.CATEGORIES.Food].join(',');
      var ll = [position.coords.latitude, position.coords.longitude].join(',');

      $http({
        method: 'GET',
        url: FOURSQUARE.API_ADDRESS + 'venues/search',
        params: {
          ll: ll,
          categoryId: categories,
          radius: MAX_DISTANCE,

          intent: 'browse',

          'client_id': FOURSQUARE.CLIENT_ID,
          'client_secret': FOURSQUARE.CLIENT_SECRET,
          v: FOURSQUARE.API_VERSION
        }
      }).then(function (res) {
        deferred.resolve(filterBadVenues(res.data.response.venues));
      }, function (err) {
        deferred.reject(err);
      });

      return deferred.promise;
    };
  }]);
