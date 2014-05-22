angular.module('bbw.sponsor-service', [])

.factory('SponsorsService', ['$q', '$timeout', function ($q, $timeout) {
    // Some fake testing data
    var sponsors = [
        {
            id: 0, level: 0, title: 'Heavy Seas', image: 'img/temp/HS_logo_sl.png', description: 'This is the description for Heavy Seas.',
            location: { address1: '4615 Hollins Ferry Rd', address2: 'Halethorpe, MD 21227' },
            phone: '4102477822', url: 'http://www.hsbeer.com', twitter: '@HeavySeasBeer'
        },
        {
            id: 1, level: 1, title: 'Metropolitan', image: 'img/temp/metro_logo_sl.png', description: 'This is the description for Metropolitan.',
            location: { address1: '902 S. Charles Street', address2: 'Baltimore, MD 21230' },
            phone: '4102340235', url: 'http://www.metrobalto.com/'
        },
        {
            id: 2, level: 1, title: 'Max\'s Tap House', image: 'img/temp/Maxs_New_sl.png', description: 'This is the description for Max\'s.',
        },
        {
            id: 3, level: 2, title: 'Brewer\'s Art', image: 'img/temp/brewers-art.png', description: 'Another description for Brewer\'s Art.',
            location: { address1: '1106 North Charles Street', address2: 'Baltimore, MD 21201' },
            phone: '4105476925'
        }
    ];

    var levels = [0, 1, 2];

    var retrieveAll = function () {
        var deferred = $q.defer();

        $timeout(function () {
            deferred.resolve(sponsors);
        }, 300);

        return deferred.promise;
    };

    return {
        all: retrieveAll,
        get: function (sponsorId) {
            // Simple index lookup
            return sponsors[sponsorId];
        },
        getLevels: function() {
            return levels;
        }
    };
}]);
