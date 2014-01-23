'use strict';

angular.module('lunchButtonApp')
  .controller('MainCtrl', ['$scope', '$window', 'Foursquareapi', 'Geolocation', 'Utils', function ($scope, $window, Foursquareapi, Geolocation, Utils) {
    $scope.categories = ['meal']; // ['meal', 'beer'];

    $scope.getRandomLunchVenue = function (category) {
      if ($scope.loading) {
        return;
      }
      if (typeof category !== 'string') {
        category = '';
      }
      category = category || $scope.currentCategory || 'meal';

      $scope.loading = true;
      $scope.done = false;
      var position;
      Geolocation.getCurrentPosition()
        .then(function (pos) {
          position = pos;
          return Foursquareapi.getVenues(position, category);
        }).then(function (venues) {
          var venue = Utils.getRandomArrayItem(venues);
          return Foursquareapi.getOneVenue(venue.id, position);
        }).then(function (venue) {
          $scope.venue = venue;
          $scope.tip = Foursquareapi.getRandomTipForVenue(venue);
          $scope.loading = false;
          $scope.done = true;
          $scope.currentCategory = category;
        });
    };

    $window.addEventListener('shake', $scope.getRandomLunchVenue, false);
  }]);
