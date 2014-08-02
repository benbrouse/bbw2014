describe("Unit: Testing Framework costFilter", function () {

    beforeEach(module('core.costFilter'));

    it('should have a costnone filter', inject(function ($filter) {
        expect($filter('costnone')).toBeDefined();
    }));

    it('should return null when nothing is set', inject(function ($filter) {
        var cost = $filter('costnone')();
        expect(cost).not.toBeDefined();
    }));

    it('should return undefined when a number if passed in', inject(function ($filter) {
        var cost = $filter('costnone')(0);
        expect(cost).not.toBeDefined();
    }));

    it('should return undefined when an array is passed in', inject(function ($filter) {
        var cost = $filter('costnone')([1]);
        expect(cost).not.toBeDefined();
    }));

    it('should return free when 0USD and no default text', inject(function ($filter) {
        var currency = $filter('currency')(0);
        var cost = $filter('costnone')(currency);

        expect(cost).toBe('Free');
    }));

    it('should return the overridden text when 0USD and user specified text', inject(function ($filter) {
        var currency = $filter('currency')(0);
        var cost = $filter('costnone')(currency, 'output');

        expect(cost).toBe('output');
    }));

    it('should return the same output as the currency filter when non-zero', inject(function ($filter) {
        var currency = $filter('currency')(9.99);
        var cost = $filter('costnone')(currency, 'output');

        expect(currency).toEqual(cost);
    }));

});