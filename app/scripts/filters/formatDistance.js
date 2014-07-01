'use strict';

angular.module('lunchButtonApp')
	.filter('formatDistance', function () {
		return function (distance) {
			if (distance >= 1000) {
				return (distance / 1000).toFixed(2) + ' km';
			} else if (distance > 1) {
				return distance + ' metres';
			} else {
				return distance + ' metre';
			}
		}
	});