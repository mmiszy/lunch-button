'use strict';

SwiftClick.attach(document.body);

angular.module('lunchButtonApp', [
  'ngRoute',
  'ngTouch',
  'ngAnimate',
  'rzModule',
  'angularLocalStorage',
  'lunchButtonApp.social',
  'lunchButtonApp.resize',
  'lunchButtonApp.mealshakerAd',
  'lunchButtonApp.mealshakerDraggable'
])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        animation: {
          leave: 'flip-left',
          enter: 'flip-right'
        },
        reloadOnSearch: false
      })
      .when('/info', {
        templateUrl: 'views/info.html',
        animation: {
          leave: 'flip-right',
          enter: 'flip-left'
        },
        controller: ['$timeout', '$rootScope', function ($timeout, $rootScope) {
          $timeout(function () {
            $rootScope.ngViewClasses = ['ready'];
          });
        }]
      })
      .otherwise({
        redirectTo: '/'
      });
  }])
  .run(['$rootScope', 'Utils', function ($rootScope, Utils) {
    $rootScope.isCordova = Utils.isCordova();
  }]);
