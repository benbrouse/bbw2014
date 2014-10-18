(function () {
    'use strict';

    angular
        .module('bbw.about-service', ['ngResource', 'core-services', 'jmdobry.angular-cache'])
        .factory('AboutService', AboutService);

    AboutService.$inject = ['$q', '$timeout', '$filter', '$log', '$resource', '$angularCacheFactory', 'DateUtils', 'AppSettings'];

    function AboutService($q, $timeout, $filter, $log, $resource, $angularCacheFactory, DateUtils, AppSettings) {
        var cacheNameData = 'aboutDataCache';
        var cacheNameUpdate = 'aboutDataUpdate';

        // NOTE: http://jmdobry.github.io/angular-cache/configuration.html
        var dataCache = $angularCacheFactory(cacheNameData, {
            maxAge: AppSettings.cacheMaxAge,
            cacheFlushInterval: AppSettings.cacheFlushInterval,
            storageMode: 'localStorage', // This cache will sync itself with `localStorage`.
            verifyIntegrity: false
        });

        var updateCache = $angularCacheFactory(cacheNameUpdate, {
            maxAge: AppSettings.cacheMaxAge,
            cacheFlushInterval: AppSettings.cacheFlushInterval,
            storageMode: 'localStorage', // This cache will sync itself with `localStorage`.
            verifyIntegrity: false
        });

        var updateCacheKey = 'AboutLastUpdate';

        var dataUrl = AppSettings.url + 'content/:id';

        var retrieveAll = function(force) {
            var deferred = $q.defer();

            // the cache entry for ALL events
            var DataService = $resource(dataUrl);
            var cacheEntry = "aboutSummary";

            // should we make the call across the wire due to a user request ??
            var retrieve = false;
            if (!angular.isUndefined(force) && force) {
                retrieve = true;
            }

            // should we force a call across the wire since they haven't refreshed in a while ??
            var lastUpdate = updateCache.get(updateCacheKey);
            if (!retrieve) {
                if (angular.isUndefined(lastUpdate)) {
                    retrieve = true;
                } else {
                    // compare the current date to when the cache was last updated
                    var lastUpdateDate = new Date(lastUpdate);
                    var lastUpdateDateWrapper = moment(lastUpdateDate);

                    // add 4 hours to the last time this was checked and compare against now
                    lastUpdateDateWrapper.add(4, 'h');

                    if (moment().isAfter(lastUpdateDateWrapper)) {
                        retrieve = true;
                    }
                }
            }

            var cacheValue = dataCache.get(cacheEntry);

            if (!retrieve && !angular.isUndefined(cacheValue)) {
                $timeout(function () {
                    deferred.resolve(cacheValue);
                }, 0);
            } else {
                DataService.query().$promise.then(function (list) {
                    cacheValue = list;

                    // store the list in cache
                    var currentDate = new Date();
                    updateCache.put(updateCacheKey, currentDate.toGMTString());
                    dataCache.put(cacheEntry, cacheValue);

                    deferred.resolve(cacheValue);
                }, function (errResponse) {
                    if (!angular.isUndefined(cacheValue)) {
                        $log.error('DataService: falling back to cache entry');

                        // fail safe
                        deferred.resolve(cacheValue);
                    } else {
                        // fail
                        deferred.reject(errResponse);
                    }
                });
            }

            return deferred.promise;
        };

        var retrieveSummary = function (force, id) {
            var deferred = $q.defer();

            // the cache entry for ALL events
            var DataService = $resource(dataUrl);
//            var cacheEntry = "aboutSummary";

            DataService.get({ id: id }).$promise.then(function (entity) {
                deferred.resolve(entity);
            });

            return deferred.promise;
        };

        return {
            all: retrieveAll,
            summary: retrieveSummary
        };
    }
})();
