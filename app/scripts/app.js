'use strict';

SwiftClick.attach(document.body);

angular.module('lunchButtonApp', [
  'ngRoute',
  'ngTouch',
  'ngAnimate',
  'angular-carousel',
  'lunchButtonApp.social'
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
