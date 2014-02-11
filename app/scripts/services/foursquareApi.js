'use strict';

angular.module('lunchButtonApp')
  .service('Foursquareapi', ['$http', 'FOURSQUARE', 'MAX_DISTANCE', '$q', 'Utils', function Foursquareapi($http, FOURSQUARE, MAX_DISTANCE, $q, Utils) {

    var filterBadVenues = function (venues) {
      return venues.filter(function (venue) {
        if (!venue.stats.tipCount) {
          return false;
        }

        for (var i = 0, l = venue.categories.length; i < l; ++i) {
          if (FOURSQUARE.EXCLUDED_CATEGORIES.indexOf(venue.categories[i].id) >= 0) {
            return false;
          }
        }

        return true;
      });
    };

    var getFormattedDistance = function (distance) {
      if (distance >= 1000) {
        return (distance/1000).toFixed(2) + ' km';
      } else {
        return distance + ' metres';
      }
    };

    this.getVenues = function (position, category) {
      var deferred = $q.defer();
      var categories = [FOURSQUARE.CATEGORIES[category]].join(',');
      var ll = [position.coords.latitude, position.coords.longitude].join(',');

      $http({
        method: 'GET',
        url: FOURSQUARE.API_ADDRESS + 'venues/search',
        params: {
          ll: ll,
          categoryId: categories,
          radius: MAX_DISTANCE,
          limit: 50,

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

    this.getOneVenue = function (venueId, position) {
      var deferred = $q.defer();
      var ll = [position.coords.latitude, position.coords.longitude].join(',');

      $http({
        method: 'GET',
        url: FOURSQUARE.API_ADDRESS + 'venues/' + venueId,
        params: {
          ll: ll,

          'client_id': FOURSQUARE.CLIENT_ID,
          'client_secret': FOURSQUARE.CLIENT_SECRET,
          v: FOURSQUARE.API_VERSION
        }
      }).then(function (res) {
        /*jshint camelcase: false */
        res.data.response.venue.location.formatted_distance = getFormattedDistance(res.data.response.venue.location.distance);
        deferred.resolve(res.data.response.venue);
      }, function (err) {
        deferred.reject(err);
      });

      return deferred.promise;
    };

    this.getRandomTipForVenue = function (venue) {
      return Utils.getRandomArrayItem(venue.tips.groups[0].items);
    };
  }]);
