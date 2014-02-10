'use strict';

angular.module('lunchButtonApp')
  .service('Analytics', ['$window', function ($window) {
    var googleAnalyticsId = 'UA-42482257-4';
    
    if ($window.ga) {
      $window.ga('create', googleAnalyticsId, 'mealshaker.com');
    } else if ($window.analytics) {
      $window.analytics.startTrackerWithId(googleAnalyticsId);
    }
    
    this.trackEvent = function (category, action, label, value) {
      if ($window.ga) {
        $window.ga('send', 'event', category, action, label, value);
      } else if ($window.analytics) {
        $window.analytics.trackEvent(category, action, label, value);
      }
    };
    this.trackPageView = function (pageName) {
      if ($window.ga) {
        var pageProps = pageName ? {'title': pageName} : {};
        $window.ga('send', 'pageview', pageProps);
      } else if ($window.analytics) {
        $window.analytics.trackView(pageName);
      }
    };
  }]);
