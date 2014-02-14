'use strict';

angular.module('lunchButtonApp')
  .service('Utils', ['$window', '$q', function Utils($window, $q) {
    var isCordova = typeof($window.cordova) !== 'undefined';
    this.isCordova = function () {
      return isCordova;
    };
    this.supportsProtocolUrl = function (protocolUrl) {
      var deferred = $q.defer();
      if (typeof(CanOpen) !== 'undefined') {
        CanOpen(protocolUrl, function(isInstalled) {
          if(isInstalled) {
            return deferred.resolve(protocolUrl);
          }
          return deferred.reject('app not installed');
        }, function (error) {
          return deferred.reject(error);
        });
      } else {
        deferred.reject();
      }
      return deferred.promise;
    };

    this.getRandomInt = function (min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    this.getRandomArrayItem = function (arr) {
      var len = arr.length;
      return arr[this.getRandomInt(0, len-1)];
    };
  }]);
