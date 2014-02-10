'use strict';

angular.module('lunchButtonApp')
  .controller('MainCtrl', ['$scope', '$window', '$timeout', 'Foursquareapi', 'Geolocation', 'Utils', function ($scope, $window, $timeout, Foursquareapi, Geolocation, Utils) {
    $scope.categories = ['meal']; // ['meal', 'beer'];
    $scope.loadingTextIndex = '';

    var loadingTimeout;
    var lastTextIndex;

    $scope.texts = ['Rolling up some meatballs', 'Shifting for the sausage', 'Wrapping up tacos', 'Firing up the grill', 'Pouring some hot choco', 'Putting a cherry on top', 'Laying Bacon strips!', 'Opening duck season', 'Ckicening out', 'Slicing up the pork'];

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

    function changeLoadingText () {
      var index;
      do {
        index = Utils.getRandomInt(0, $scope.texts.length - 1);
      } while (lastTextIndex === index);
      lastTextIndex = index;

      $scope.loadingTextIndex = index;
      loadingTimeout = $timeout(changeLoadingText, 2000);
    }

    function cancelLoadingText () {
      $scope.loadingTextIndex = '';
      $timeout.cancel(loadingTimeout);
    }

    $scope.$watch('loading', function (newVal) {
      if (newVal === true) {
        changeLoadingText();
      } else {
        cancelLoadingText();
      }
    });

    $window.addEventListener('shake', $scope.getRandomLunchVenue, false);
  }]);
