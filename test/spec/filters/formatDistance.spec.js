'use strict';

describe('Filter: formatDistance', function () {
    beforeEach(module('lunchButtonApp'));



























    it('should format distance', inject(function ($filter) {
    	var formatDistance = $filter('formatDistance');

    	expect(formatDistance(1)).toBe('1 metre');
    	expect(formatDistance(2)).toBe('2 metres');
    	expect(formatDistance(999)).toBe('999 metres');
    	expect(formatDistance(1000)).toBe('1.00 km');
    	expect(formatDistance(1234)).toBe('1.23 km');
    	expect(formatDistance(1237)).toBe('1.24 km');

    }));

















});
