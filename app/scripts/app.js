'use strict';

angular.module('lunchButtonApp', [
  'ngRoute',
  'ngTouch',
  'ngAnimate',
  'angular-carousel'
])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  }]);
