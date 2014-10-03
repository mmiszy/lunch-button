'use strict';
angular.module('lunchButtonApp.mealshakerDraggable', ['ngTouch'])
  .directive('mealshakerDraggable', ['$window', '$swipe', '$animate', '$parse', '$timeout', function ($window, $swipe, $animate, $parse, $timeout) {
    var TRANSITION_CLASS = 'mealshaker-draggable-transition';
    var TRESHOLD = 30;

    return {
      restrict: 'A',
      link: function (scope, el, attrs) {
        var callbacks = {
          left: $parse(attrs.mealshakerDraggableLeft),
          right: $parse(attrs.mealshakerDraggableRight)
        };

        var startCoords, lastCoords, direction, currentPosition, minPosX, childWidth, transitioning = false;

        function adjustSizes() {
          var children = el.find('.swipe-item');
          var childrenNum = children.length;
          childWidth = children.outerWidth();

          // how far el can be moved to the left (negative)? not further than the width of all children but one
          minPosX = -( (childrenNum - 1) * childWidth);
        }

        function validateX(x) {
          if (x > 0) {
            x = 0;
          } else if (x < minPosX) {
            x = minPosX;
          }
          return x;
        }

        function endDragging() {
          el.removeAttr('style').addClass(TRANSITION_CLASS);
        }

        $timeout(adjustSizes);
        angular.element($window).on('resize', adjustSizes);

        $swipe.bind(el, {
          start: function (coords) {
            startCoords = angular.copy(coords);
            lastCoords = startCoords;
            currentPosition = el.position().left;
          },
          move: function (coords) {
            el.removeClass(TRANSITION_CLASS);

            var x = coords.x - startCoords.x + currentPosition;
            x = validateX(x);

            direction = lastCoords.x < coords.x ? 'right' : 'left';

            el.css('transform', 'translate3D(' + x + 'px, 0, 0)');

            lastCoords = coords;
          },
          end: function () {
            el.addClass(TRANSITION_CLASS);

            if (Math.abs(lastCoords.x - startCoords.x) < TRESHOLD) {
              endDragging();
              return;
            }

            var x = currentPosition + (childWidth * (direction === 'left' ? -1 : 1));
            x = validateX(x);
            transitioning = true;

            // there's an annoying lag on iOS caused by $scope.$apply so I animate it instantly
            $animate.enabled(false, el);
            el.one('webkitTransitionEnd transitionend', function () {
              if (transitioning) {
                transitioning = false;

                scope.$apply(callbacks[direction]);
                endDragging();
                $animate.enabled(true, el);
              }
            }).css('transform', 'translate3D(' + x + 'px, 0, 0)');
          },
          cancel: endDragging
        });

        scope.$on('$destroy', function () {
          angular.element($window).off('resize', adjustSizes);
        });
      }
    };
  }]);
