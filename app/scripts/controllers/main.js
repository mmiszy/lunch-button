'use strict';

angular.module('lunchButtonApp')
  .controller('MainCtrl', ['$scope', '$window', '$timeout', 'Foursquareapi', 'Geolocation', 'Utils', 'Analytics', function ($scope, $window, $timeout, Foursquareapi, Geolocation, Utils, Analytics) {
    $scope.categories = ['meal']; // ['meal', 'beer'];
    $scope.loadingTextIndex = '';

    Analytics.trackPageView('Main');

    var loadingTimeout;
    var lastTextIndex;

    $scope.texts = ['Rolling up some meatballs', 'Sniffing for hot sausage', 'Wrapping up tacos', 'Firing up the grill', 'Pouring some hot choco', 'Putting a cherry on top', 'Laying Bacon strips!', 'Opening duck season', 'Chickening out', 'Slicing up the pork'];

    if (Utils.isCordova()) {
      $scope.$on('$viewContentLoaded', function() {
        $window.navigator.splashscreen.hide();
      });
    }
    function trackShake(event) {
      var eventId = event ? 'Shaked' : 'Clicked';
      Analytics.trackEvent('interaction', 'GetVenue', eventId);
    }
    $scope.showVenue = function ($event, venue) {
      Analytics.trackPageView('ViewVenue');
      Analytics.trackEvent('interaction', 'ViewVenue', venue.name, venue.id);
      var protocolUrl = 'foursquare://venues/' + venue.id;
      $event.preventDefault();

      Utils.supportsProtocolUrl(protocolUrl)
        .then(function () {
          $window.open(protocolUrl);
        })
        .catch(function () {
          $window.open(venue.canonicalUrl, '_blank', 'location=yes,transitionstyle=fliphorizontal,presentationstyle=pagesheet,enableViewportScale=yes,toolbar=yes');
        });
    };
    $scope.openInSystemBrowser = function ($event, url) {
      if (Utils.isCordova()) {
        $event.preventDefault();
        $window.open(url, '_system');
      }
    };
    $scope.getRandomLunchVenue = function (category, event) {
      if ($scope.loading) {
        return;
      }

      category = category || $scope.currentCategory || 'meal';

      trackShake(event);

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
          Analytics.trackEvent('venue', 'found', venue.name, venue.id);

          $scope.venue = venue;
          $scope.tip = Foursquareapi.getRandomTipForVenue(venue);
          $scope.loading = false;
          $scope.done = true;
          $scope.currentCategory = category;
        }).catch(function (err) {
          $scope.loading = false;
          $scope.errorMessage = err;
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

    $window.addEventListener('shake', function (event) {
      $scope.$apply(function () {
        $scope.getRandomLunchVenue($scope.currentCategory, event);
      });
    }, false);
  }]);
