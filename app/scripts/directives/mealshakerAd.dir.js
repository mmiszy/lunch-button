'use strict';
angular.module('lunchButtonApp.mealshakerAd', [])
  .directive('mealshakerAd', ['$window', '$document', '$rootScope', 'Utils', 'ADS', function ($window, $document, $rootScope, Utils, ADS) {
    var admobAd = $window.admobAd;
    var initialised = false;

    function showAdMobAd() {
      try {
        if (!initialised) {
          admobAd.initBanner(ADS.ADMOB_BANNER_ID, admobAd.AD_SIZE.BANNER.width, admobAd.AD_SIZE.BANNER.height);
          initialised = true;
        }
        admobAd.showBanner(admobAd.AD_POSITION.BOTTOM_CENTER);
      } catch (e) {
        console.log(e.message);
      }
    }

    function hideAdMobAd() {
      try {
        admobAd.hideBanner();
      } catch (e) {
        console.log(e.message);
      }
    }

    return {
      restrict: 'E',
      scope: {
        'visible': '='
      },
      link: function (scope) {
        if (Utils.isCordova()) {
          scope.$watch('visible', function (newVal, oldVal) {
            if (newVal && !oldVal) {
              showAdMobAd();
            } else if (!newVal && oldVal) {
              hideAdMobAd();
            }
          });
        }
      }
    };
  }]);
