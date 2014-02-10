'use strict';
angular.module('lunchButtonApp.social', [])
.service('metaService', ['$window', function () {
  return {
    getFacebookMetaTag: function (property) {
      var temp = document.querySelector('meta[property="og:' + property + '"]');
      return (temp && temp.getAttribute('content')) || '';
    },
    getTwitterMetaTag: function (property) {
      var temp = document.querySelector('meta[name="twitter:' + property + '"]');
      return (temp && temp.getAttribute('content')) || '';
    }
  };
}])
.directive('facebookShare', ['$window', '$log', 'metaService', function ($window, $log, metaService) {
  var currentPlace;

  function init (scope, elm) {
    elm.on('click', function (event) {
      event.stopPropagation();
      event.preventDefault();

      var image = metaService.getFacebookMetaTag('image'),
        description = metaService.getFacebookMetaTag('title'),
        url = metaService.getFacebookMetaTag('url');

      if (currentPlace) {
        description = 'Going for a meal at ' + currentPlace + ' by using Mealshaker';
      }

      $window.FB.ui({
        method: 'feed',
        link: url,
        caption: description,
        picture: image,
        description: 'Shake to find a nearby place to eat!'
      }, function (response) {
        $log.log(response);
      });
    });
  }

  return {
    restrict: 'A',
    scope: {
      description: '='
    },
    link: function linking (scope, elm, attrs) {
      if ($window.fbAsyncInit) {
        if ($window.fbAsyncInit.hasRun) {
          init(scope, elm, attrs);
        } else {
          var cb = $window.fbAsyncInit;
          $window.fbAsyncInit = function () {
            cb();
            init(scope, elm, attrs);
          };
        }
      } else {
        $log.error('[directive:facebookShare] fbAsyncInit must be defined first');
      }

      scope.$watch('description', function (newVal) {
        currentPlace = newVal;
      });
    }
  };
}])
.directive('twitterShare', ['$window', '$log', 'metaService', function ($window, $log, metaService) {
  var currentPlace;

  var windowOptions = 'scrollbars=yes,resizable=yes,toolbar=no,location=yes';

  function init (scope, elm) {
    elm.on('click', function (event) {
      event.stopPropagation();
      event.preventDefault();

      var winHeight = screen.height;
      var winWidth = screen.width;
      var width = 550;
      var height = 420;

      var left = Math.round((winWidth / 2) - (width / 2));
      var top = 0;
      if (winHeight > height) {
        top = Math.round((winHeight / 2) - (height / 2));
      }

      $window.open(getParams(), 'intent', windowOptions + ',width=' + width + ',height=' + height + ',left=' + left + ',top=' + top);
    });
  }

  function getParams () {
    var intent = 'https://twitter.com/intent/tweet';
    var params = {
      url: metaService.getTwitterMetaTag('url'),
      via: 'Mealshaker',
      text: metaService.getTwitterMetaTag('description')
    };

    if (currentPlace) {
      params.text = 'Going for a meal at ' + currentPlace + ' by using Mealshaker';
    }

    var queryString = '';

    for (var i in params) {
      if (params.hasOwnProperty(i)) {
        if (params[i]) {
          if (queryString) {
            queryString += '&';
          }
          queryString += [i, $window.encodeURIComponent(params[i])].join('=');
        }
      }
    }

    return [intent, queryString].join('?');
  }

  return {
    scope: {
      description: '='
    },
    restrict: 'A',
    link: function(scope, elm, attrs) {
      init(scope, elm, attrs);

      scope.$watch('description', function (newVal) {
        currentPlace = newVal;
      });
    }
  };
}]);