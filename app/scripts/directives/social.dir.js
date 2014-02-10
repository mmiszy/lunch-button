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
.service('cordovaShareService', ['$window', '$q', function ($window, $q) {
  return {
    shareToFacebook: function (shareData) {
      return this.share('PostToFacebook', shareData);
    },
    shareToTwitter: function (shareData) {
      return this.share('PostToTwitter', shareData);
    },
    serviceTypeToName: function(serviceType) {
      return serviceType === 'PostToFacebook' ? 'Facebook' : 'Twitter';
    },
    share: function (activityType, shareData) {
      var serviceName = this.serviceTypeToName(activityType),
        fallBackFacebookShare = this.facebookSdkShare;
      shareData = shareData || {};
      shareData.activityType = activityType;

      var image = shareData.image;
      delete shareData.image;
      $window.socialmessage.shareTo(shareData, function () {}, function () {
        if (activityType === 'PostToFacebook') {
          shareData.image = image;
          fallBackFacebookShare(shareData);
        } else {
          $window.navigator.notification.alert(
            'You need to configure your account in Settings > ' + serviceName + ' to be able to share Mealshaker',
            function () {}, 'Unable to share');
        }
      });
    },
    showGenericErrorMessage: function(serviceName) {
      $window.navigator.notification.alert(
        'You need to configure your account in Settings > ' + serviceName + ' to be able to share Mealshaker',
        function () {}, 'Unable to share');
    },
    facebookSdkShare: function(shareData) {
      var deferred = $q.defer();
      var plugin = new CC.CordovaFacebook();

      plugin.init('1403543656559746', 'com.thecometcult.mealshaker', ['publish_actions']);
      plugin.login(function (accessToken) {
        deferred.resolve(accessToken);
      }, function (error) {
        deferred.reject(error);
      });

      deferred.promise
        .then(function () {
          var deferred = $q.defer();

          // now ready to post
          plugin.share('Mealshaker', shareData.url, shareData.image, 'Shake to find a nearby place to eat!', shareData.text, function (success) {
            deferred.resolve(success);
          }, function (error) {
            deferred.reject(error);
          });
          return deferred.promise;
        })
        .catch(function () {
          this.showGenericErrorMessage('Facebook');
        }.bind(this));
    }
  };
}])
.directive('facebookShare', ['$window', '$log', 'metaService', 'cordovaShareService', 'Analytics', 'Utils', function ($window, $log, metaService, cordovaShareService, Analytics, Utils) {
  var currentPlace;

  function init (scope, elm) {
    elm.on('click', function (event) {
      event.stopPropagation();
      event.preventDefault();
      Analytics.trackEvent('interaction', 'share', 'facebook');

      var image = metaService.getFacebookMetaTag('image'),
        description = metaService.getFacebookMetaTag('title'),
        url = metaService.getFacebookMetaTag('url');

      if (currentPlace) {
        description = 'Going for a meal at ' + currentPlace + ' by using Mealshaker';
      }

      if (Utils.isCordova()) {
        return cordovaShareService.shareToFacebook({
          text: description,
          image: image,
          url: url
        });
      } else {
        $window.FB.ui({
          method: 'feed',
          link: url,
          picture: image,
          caption: description,
          description: 'Shake to find a nearby place to eat!'
        }, function (response) {
          $log.log(response);
        });
      }
    });
  }

  return {
    restrict: 'A',
    scope: {
      description: '='
    },
    link: function linking (scope, elm, attrs) {
      scope.$watch('description', function (newVal) {
        currentPlace = newVal;
      });

      if (Utils.isCordova()) {
        init(scope, elm, attrs);
      } else if ($window.fbAsyncInit) {
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
    }
  };
}])
.directive('twitterShare', ['$window', '$log', 'metaService', 'cordovaShareService', 'Analytics', 'Utils', function ($window, $log, metaService, cordovaShareService, Analytics, Utils) {
  var currentPlace;

  var windowOptions = 'scrollbars=yes,resizable=yes,toolbar=no,location=yes';

  function trimVenueName (venueName) {
    if (venueName.length > 79) {
      return venueName.substring(0, 76).trim() + '...';
    }
    return venueName;
  }

  function twitterDescription () {
    var description = metaService.getTwitterMetaTag('description');

    if (currentPlace) {
      description = 'Going for a meal at ' + trimVenueName(currentPlace) + ' by using @Mealshaker';
    }
    return description;
  }

  function webTwitterShare () {
    var winHeight = screen.height,
      winWidth = screen.width,
      width = 550,
      height = 420;

    var left = Math.round((winWidth / 2) - (width / 2));
    var top = 0;
    if (winHeight > height) {
      top = Math.round((winHeight / 2) - (height / 2));
    }

    $window.open(getParams(), 'intent', windowOptions + ',width=' + width + ',height=' + height + ',left=' + left + ',top=' + top);
  }

  function init (scope, elm) {
    elm.on('click', function (event) {
      event.stopPropagation();
      event.preventDefault();
      Analytics.trackEvent('interaction', 'share', 'twitter');

      if (Utils.isCordova()) {
        cordovaShareService.shareToTwitter({
          text: twitterDescription(),
          url: metaService.getTwitterMetaTag('url')
        });
      } else {
        webTwitterShare();
      }
    });
  }

  function getParams () {
    var intent = 'https://twitter.com/intent/tweet';
    var params = {
      url: metaService.getTwitterMetaTag('url'),
      via: 'Mealshaker',
      text: twitterDescription()
    };

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