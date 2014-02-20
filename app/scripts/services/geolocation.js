'use strict';

angular.module('lunchButtonApp')
  .service('Geolocation', ['$q', function Geolocation($q) {
    this.getCurrentPosition = function () {
      var deferred = $q.defer();

      navigator.geolocation.getCurrentPosition(function (pos) {
        deferred.resolve(pos);
      }, function () {
        deferred.reject('Turn on GPS');
      });

      return deferred.promise;
    };
  }]);
