'use strict';
angular.module('lunchButtonApp.resize', [])
.directive('resizeBlockquote', ['$timeout', 'Utils', function ($timeout, Utils) {
  var outerHeight = function (el) {
    return Math.max(el.clientHeight, el.scrollHeight, el.offsetHeight);
  };

  var offsetTop = function (el) {
    var top = 0;
    if (el.getBoundingClientRect) {
      top = el.getBoundingClientRect().top;
    }
    return top + window.pageYOffset - window.document.documentElement.clientTop;
  };

  return {
    link: function (scope, el) {
      var $el = angular.element(el);
      var $footer = angular.element(document.querySelector('.result footer'));

      var margin = parseFloat(window.getComputedStyle($el[0]).getPropertyValue('margin-bottom'));

      var timer;
      function update () {
        $timeout.cancel(timer);

        var diff = offsetTop($footer[0]) - (offsetTop($el[0]) + outerHeight($el[0]));
        var maxHeight = outerHeight($el[0]) - margin + diff;

        $el.css('max-height', maxHeight + 'px');

        timer = $timeout(function () {
          if ($el[0].scrollHeight > $el[0].clientHeight) {
            $el.parent().addClass('scrollable');
          } else {
            $el.parent().removeClass('scrollable');
          }
        });
      }
      var dupdate = Utils.debounce(update, 50, true);

      $timeout(dupdate);
      angular.element(window).off('resize', dupdate).on('resize', dupdate);
    }
  };
}]);
