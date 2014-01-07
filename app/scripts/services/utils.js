'use strict';

angular.module('lunchButtonApp')
  .service('Utils', function Utils() {
    this.getRandomInt = function (min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    this.getRandomArrayItem = function (arr) {
      var len = arr.length;
      return arr[this.getRandomInt(0, len-1)];
    };
  });
