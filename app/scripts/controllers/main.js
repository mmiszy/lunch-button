'use strict';

angular.module('lunchButtonApp')
  .controller('MainCtrl', ['$scope', 'Foursquareapi', 'Geolocation', function ($scope, Foursquareapi, Geolocation) {

    var getRandomInt = function (min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    var getRandomVenue = function (venues) {
      var len = venues.length;
      return venues[getRandomInt(0, len-1)];
    };

    $scope.getRandomLunchVenue = function () {
      Geolocation.getCurrentPosition()
        .then(Foursquareapi.getVenues)
        .then(function (venues) {
          $scope.venue = getRandomVenue(venues);
        });
    };
  }]);
