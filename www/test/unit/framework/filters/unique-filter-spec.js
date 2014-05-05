describe("Unit: Testing Framework costFilter", function () {

    var testArray, testObjects;

    beforeEach(module('core.uniqueFilter'));

    beforeEach(function() {
        testArray = [0, 0, 1, 2];

        testObjects = [{ number: 1 }, { number: 2 }, { number: 2 }, { number: 3 }];
    });

    it('should have a unique filter', inject(function ($filter) {
        expect($filter('unique')).toBeDefined();
    }));

    it('should return null when nothing is set', inject(function ($filter) {
        var unique = $filter('unique')();
        expect(unique).not.toBeDefined();
    }));

    it('should return simple', inject(function ($filter) {
        var items = $filter('unique')(testArray);
        expect(items.length).toEqual(3);
    }));

    it('should return complex', inject(function ($filter) {
        var items = $filter('unique')(testObjects, 'number');
        expect(items.length).toEqual(3);
    }));
});