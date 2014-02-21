'use strict';

angular.module('lunchButtonApp')
  .service('Foursquareapi', ['$http', 'FOURSQUARE', '$q', 'Utils', function Foursquareapi($http, FOURSQUARE, $q, Utils) {

    var filterBadVenues = function (venues) {
      var filteredVenues = venues.filter(function (venue) {
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
      if (filteredVenues.length < 2) {
        return venues;
      }
      return filteredVenues;
    };

    this.getVenues = function (position, category, distance) {
      var categories = [FOURSQUARE.CATEGORIES[category]].join(',');
      var ll = [position.coords.latitude, position.coords.longitude].join(',');

      return $http({
        method: 'GET',
        url: FOURSQUARE.API_ADDRESS + 'venues/search',
        timeout: 10000,
        params: {
          ll: ll,
          categoryId: categories,
          radius: distance || 800,
          limit: 50,

          intent: 'browse',

          'client_id': FOURSQUARE.CLIENT_ID,
          'client_secret': FOURSQUARE.CLIENT_SECRET,
          v: FOURSQUARE.API_VERSION
        }
      }).then(function (res) {
        return filterBadVenues(res.data.response.venues);
      });
    };

    this.getOneVenue = function (venueId, position) {
      var ll = [position.coords.latitude, position.coords.longitude].join(',');

      return $http({
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
        var venue = res.data.response.venue;
        var category = (venue.categories && venue.categories[0] && venue.categories[0].name) || '';
        venue.category = category;

        return venue;
      });
    };

    this.getRandomTipForVenue = function (venue) {
      return Utils.getRandomArrayItem(venue.tips.groups[0].items);
    };
  }]);
