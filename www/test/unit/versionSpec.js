describe('version', function () {
    beforeEach(module('bbw-version'));

    it('should return current version', inject(function (version) {
        expect(version).toEqual('0.0.1');
    }));
});