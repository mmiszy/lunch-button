'use strict';

angular.module('lunchButtonApp')
  .controller('MainCtrl', ['$scope', 'Foursquareapi', 'Geolocation', 'Utils', function ($scope, Foursquareapi, Geolocation, Utils) {
    $scope.getRandomLunchVenue = function () {
      if ($scope.loading) {
        return;
      }

      $scope.loading = true;
      $scope.done = false;
      var position;
      Geolocation.getCurrentPosition()
        .then(function (pos) {
          position = pos;
          return Foursquareapi.getVenues(position);
        }).then(function (venues) {
          var venue = Utils.getRandomArrayItem(venues);
          return Foursquareapi.getOneVenue(venue.id, position);
        }).then(function (venue) {
          $scope.venue = venue;
          $scope.tip = Foursquareapi.getRandomTipForVenue(venue);
          $scope.loading = false;
          $scope.done = true;
        });
    };
  }]);
