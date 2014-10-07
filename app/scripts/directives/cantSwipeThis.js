'use strict';
angular.module('lunchButtonApp')
  .directive('cantSwipeThis', [function () {
    return {
      restrict: 'A',
      link: function (scope, el) {
        var stop = function (e) { e.stopPropagation(); };
        el.on('mousedown', stop);
        el.on('touchstart', stop);

        scope.$on('$destroy', function () {
          el.off('mousedown', stop);
          el.off('touchstart', stop);
        });
      }
    };
  }]);
