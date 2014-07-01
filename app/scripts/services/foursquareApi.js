'use strict';

angular.module('lunchButtonApp')
    .service('Foursquareapi', ['$http', 'FOURSQUARE', 'MAX_DISTANCE', '$q', 'Utils',
    function Foursquareapi($http, FOURSQUARE, MAX_DISTANCE, $q, Utils) {

        var filterBadVenues = function (venues) {
            return venues.filter(function (venue) {
                return !!venue.stats.tipCount;
            });
        };

        this.getVenues = function (position) {
            var categories = [FOURSQUARE.CATEGORIES.Food].join(',');
            var ll = [position.coords.latitude, position.coords.longitude].join(',');

            return $http({
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
                return $q.when(filterBadVenues(res.data.response.venues));
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
                return $q.when(res.data.response.venue);
            });
        };

        this.getRandomTipForVenue = function (venue) {
            return Utils.getRandomArrayItem(venue.tips.groups[0].items);
        };
    }]);
