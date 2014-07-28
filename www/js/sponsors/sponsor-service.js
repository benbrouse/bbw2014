angular.module('bbw.sponsor-service', ['ngResource', 'core-services', 'jmdobry.angular-cache'])

.factory('SponsorsService', ['$q', '$timeout', '$log', '$resource', '$angularCacheFactory', 'AppSettings', function ($q, $timeout, $log, $resource, $angularCacheFactory, AppSettings) {
    var cacheName = 'sponsorDataCache';

    // NOTE: http://jmdobry.github.io/angular-cache/configuration.html
    var dataCache = $angularCacheFactory(cacheName, {
        maxAge: AppSettings.cacheMaxAge,
        cacheFlushInterval: AppSettings.cacheFlushInterval,
        storageMode: 'localStorage'         // This cache will sync itself with `localStorage`.
    });

    var dataUrl = AppSettings.url + 'sponsors/:id';

    var levels = [0, 1, 2, 3, 4];

    var mockData = [
        {
            id: 0,
            level: 0,
            title: 'Heavy Seas',
            image: 'img/temp/HS_logo_sl.png',
            description: 'This is the description for Heavy Seas.',
            location: { address1: '4615 Hollins Ferry Rd', address2: 'Halethorpe, MD 21227' },
            phone: '4102477822',
            url: 'http://www.hsbeer.com',
            twitter: '@HeavySeasBeer'
        },
        {
            id: 1,
            level: 1,
            title: 'Metropolitan',
            image: 'img/temp/metro_logo_sl.png',
            description: 'This is the description for Metropolitan.',
            location: { address1: '902 S. Charles Street', address2: 'Baltimore, MD 21230' },
            phone: '4102340235',
            url: 'http://www.metrobalto.com/'
        },
        {
            id: 2,
            level: 1,
            title: 'Max\'s Tap House',
            image: 'img/temp/Maxs_New_sl.png',
            description: 'This is the description for Max\'s.',
        },
        {
            id: 3,
            level: 2,
            title: 'Brewer\'s Art',
            image: 'img/temp/brewers-art.png',
            description: 'Another description for Brewer\'s Art.',
            location: { address1: '1106 North Charles Street', address2: 'Baltimore, MD 21201' },
            phone: '4105476925'
        }
    ];

    var retrieveAll = function (force) {
        var deferred = $q.defer();

        // the cache entry for ALL sponsors
        var Sponsors = $resource(dataUrl);
        var cacheEntry = "sponsors";

        // should we make the call across the wire?
        var retrieve = false;
        if (!angular.isUndefined(force) && force) {
            retrieve = true;
        }

        if (!retrieve && dataCache.get(cacheEntry)) {
            deferred.resolve(dataCache.get(cacheEntry));
        } else {
            if (AppSettings.useMockData) {
                $timeout(function () {
                    dataCache.put(cacheEntry, mockData);
                    deferred.resolve(mockData);
                }, 1500);
            } else {
                Sponsors.query().$promise.then(function (sponsorsList) {
                    // success
                    dataCache.put(cacheEntry, sponsorsList);
                    deferred.resolve(sponsorsList);
                }, function (errResponse) {
                    if (dataCache.get(cacheEntry)) {
                        $log.write('SponsorService: falling back to cache entry');

                        // fail safe
                        deferred.resolve(dataCache.get(cacheEntry));
                    } else {
                        // fail
                        deferred.reject(errResponse);
                    }
                });
            }
        }

        return deferred.promise;
    };

    var getById = function (sponsorId) {
        var id = angular.isString(sponsorId) ? Number(sponsorId) : sponsorId;

        var deferred = $q.defer();

        retrieveAll().then(function (sponsorList) {
            var filteredSponsors = _.where(sponsorList, { id: id });
            if (filteredSponsors != null && filteredSponsors.length > 0) {
                var sponsor = filteredSponsors[0];

                deferred.resolve(sponsor);
            }
        }, function (err) {
            deferred.reject(err);
        });

        return deferred.promise;
    };

    return {
        all: retrieveAll,
        get: getById,

        getLevels: function() {
            return levels;
        }
    };
}]);
