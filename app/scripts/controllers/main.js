'use strict';

angular.module('lunchButtonApp')
  .controller('MainCtrl',
  ['$scope', '$rootScope', '$window', '$timeout', '$q', '$sce', '$filter', '$location', 'Foursquareapi', 'Geolocation', 'Utils', 'Analytics', 'storage',
  function ($scope, $rootScope, $window, $timeout, $q, $sce, $filter, $location, Foursquareapi, Geolocation, Utils, Analytics, storage) {
    $scope.categories = [{
      id: 'meal',
      text: 'to eat'
    }, {
      id: 'beer',
      text: 'to drink'
    }];
    $scope.search = {};
    $scope.loadingTextIndex = '';
    storage.bind($scope, 'search.distance', {defaultValue: 800});

    $rootScope.currentCategory = $rootScope.currentCategory || 'meal';

    $timeout(function () {
      if (!$rootScope.ngViewClasses) {
        $rootScope.ngViewClasses = ['ready'];
      }
    });

    Analytics.trackPageView('Main');

    var loadingTimeout;
    var lastTextIndex;

    var allTexts = {
      meal: ['Rolling up some meatballs', 'Sniffing for hot sausage', 'Wrapping up tacos', 'Firing up the grill', 'Pouring some hot choco', 'Putting a cherry on top', 'Laying Bacon strips!', 'Opening duck season', 'Chickening out', 'Slicing up the pork'],
      beer: ['Tap me an IPA please', 'Shaken, not stirred', 'A whiskey on the rock', 'A guinness a day, keeps the doctor away', 'In wine there is truth']
    };

    $scope.texts = allTexts.meal;

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

    $scope.openMap = function ($event) {
      if (!$scope.venue.location || !$scope.venue.location.lat) {
        $event.preventDefault();
        return;
      }
      $scope.openInSystemBrowser($event, 'http://maps.apple.com/?q=' + $scope.venue.location.lat + ',' + $scope.venue.location.lng);
    };

    $scope.callNumber = function ($event, number) {
      if (!number) {
        $event.preventDefault();
        return;
      }
      if (Utils.isCordova() || Utils.isMobile()) {
        $window.location.href = 'tel:' + number;
      } else {
        $scope.showPhoneNumber(number);
      }
    };

    $scope.openInSystemBrowser = function ($event, url) {
      $event.preventDefault();
      if (Utils.isCordova()) {
        $window.open(url, '_system');
      } else {
        $window.location.href = url;
      }
    };

    var cachedVenues = [];
    
    $scope.getLunchVenue = function (category, id, event) {
      if ($scope.loading) {
        return;
      }

      category = category || $rootScope.currentCategory || 'meal';
      $scope.texts = allTexts[category];

      trackShake(event);

      $scope.loading = true;
      $scope.done = false;
      $scope.errorMessage = '';

      var position;
      getCurrentPosition().then(function (pos) {
        position = pos;

        if (id) {
          return $q.when({id: id});
        }

        if (cachedVenues && cachedVenues.length) {
          return $q.when(cachedVenues).then(getRandomVenue);
        }

        return Foursquareapi.getVenues(position, category, $scope.search.distance).catch(function () {
          return $q.reject({
            title: 'Network Issue',
            message: 'Out of Internetz?!\nConnect & Try again.'
          });
        }).then(getRandomVenue);
      }).then(function (venue) {
        return Foursquareapi.getOneVenue(venue.id, position);
      }).then(function (venue) {
        Analytics.trackEvent('venue', 'found', venue.name, venue.id);

        $scope.venue = venue;
        $scope.tip = Foursquareapi.getRandomTipForVenue(venue);
        $scope.done = true;
      }).catch(function (errObj) {
        if (Utils.isCordova()) {
          $window.navigator.notification.alert(errObj.message, angular.noop, errObj.title);
        } else {
          $scope.errorMessage = $sce.trustAsHtml($filter('nl2br')(errObj.message));
        }
      }).finally(function () {
        $scope.loading = false;
      });
    };

    if ($location.search().id) {
      $scope.getLunchVenue(null, $location.search().id);
    }

    function changeLoadingText () {
      var index;
      do {
        index = Utils.getRandomInt(0, $scope.texts.length - 1);
        if ($scope.texts.length === 1) {
          break;
        }
      } while (lastTextIndex === index);
      lastTextIndex = index;

      $scope.loadingTextIndex = index;
      loadingTimeout = $timeout(changeLoadingText, 2000);
    }

    function cancelLoadingText () {
      $scope.loadingTextIndex = '';
      $timeout.cancel(loadingTimeout);
    }

    function getRandomVenue (venues) {
      if (!venues || !venues.length) {
        return $q.reject({
          title: 'No venues',
          message: 'No venues found in ' + $filter('format_distance')($scope.search.distance)
        });
      }
      var venue = Utils.popRandomArrayItem(venues);
      cachedVenues = venues;
      return $q.when(venue);
    }

    function getCurrentPosition () {
      return Geolocation.getCurrentPosition()
        .catch(function (errMsg) {
          if (Utils.isCordova()) {
            errMsg = 'You have denied Mealshaker permission to use Location Services. Go to Settings > Privacy > Location Services and enable Location Services for the app and try again.';
          }
          return $q.reject({
            title: 'Could not get your location',
            message: errMsg
          });
        });
    }

    $scope.showPhoneNumber = function (number) {
      $scope.dialog = {
        text: $sce.trustAsHtml('Phone number:<br><span>' + number + '</span>')
      };
    };

    $scope.hideDialog = function () {
      $scope.dialog = null;
    };

    $scope.goTo = function (where) {
      $rootScope.currentCategory = where;
    };

    $scope.goBack = function () {
      $location.search('id', null);
      $scope.venue = null;
    };

    $scope.$watch('loading', function (newVal) {
      if (newVal === true) {
        changeLoadingText();
      } else {
        cancelLoadingText();
      }
    });

    $scope.$watch('venue', function (newVal) {
      if (newVal && newVal.id) {
        $location.search('id', newVal.id);
      }
    });

    $window.addEventListener('shake', function (event) {
      $scope.$apply(function () {
        $scope.getLunchVenue($scope.currentCategory, null, event);
      });
    }, false);
  }])
  .filter('nl2br', [function () {
    return function (text) {
      return text && text.replace(/\n|&#10;/g, '<br>');
    };
  }])
  .filter('format_distance', function () {
    return function (distance) {
      if (distance >= 1000) {
        return (distance / 1000).toFixed(1) + ' km';
      } else {
        return distance + ' m';
      }
    };
  })
  .directive('animClass', ['$route', function ($route) {
    return {
      link: function (scope, el) {
        var $el = angular.element(el);
        var enterClass = $route.current.animation && $route.current.animation.enter;
        var leaveClass = $route.current.animation && $route.current.animation.leave;

        $el.addClass(enterClass);

        scope.$on('$destroy', function () {
          $el.removeClass(enterClass);
          $el.addClass(leaveClass);
        });
      }
    };
  }]);
