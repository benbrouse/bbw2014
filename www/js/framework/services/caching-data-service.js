(function () {
    'use strict';

    angular
        .module('core.caching-data-service', ['ngResource', 'core-services', 'jmdobry.angular-cache'])
        .factory('CachingDataService', CachingDataService);

    CachingDataService.$inject = ['$q', '$timeout', '$log', '$resource', '$angularCacheFactory', 'AppSettings'];

    function CachingDataService($q, $timeout, $log, $resource, $angularCacheFactory, AppSettings) {
        var cacheNameData;
        var cacheNameUpdate;

        var dataCache;
        var updateCache;

        var setup = function(cacheName) {
            cacheNameData = cacheName;
            cacheNameUpdate = cacheName + 'Update';

            // NOTE: http://jmdobry.github.io/angular-cache/configuration.html
            dataCache = $angularCacheFactory(cacheNameData, {
                maxAge: AppSettings.cacheMaxAge,
                cacheFlushInterval: AppSettings.cacheFlushInterval,
                storageMode: 'localStorage', // This cache will sync itself with `localStorage`.
                verifyIntegrity: false
            });

            updateCache = $angularCacheFactory(cacheNameUpdate, {
                maxAge: AppSettings.cacheMaxAge,
                cacheFlushInterval: AppSettings.cacheFlushInterval,
                storageMode: 'localStorage', // This cache will sync itself with `localStorage`.
                verifyIntegrity: false
            });
        };

        var requiresUpdate = function(cacheKey, force, duration) {
            // should we make the call across the wire ??
            var retrieve = false;
            if (!angular.isUndefined(force) && force) {
                retrieve = true;
            }

            // secondary check - should we force a call across the wire since they haven't refreshed in a while ??
            if (!retrieve) {
                var lastUpdate = updateCache.get(cacheKey);

                if (angular.isUndefined(lastUpdate)) {
                    // the data doesn't exist in cache so we need an update
                    retrieve = true;
                } else {
                    // compare the current date to when the cache was last updated for this entry
                    var lastUpdateDate = new Date(lastUpdate);
                    var lastUpdateDateWrapper = moment(lastUpdateDate);

                    // add N hours to the last time this was checked and compare against now
                    var offsetDuration = 4;
                    if (!angular.isUndefined(duration)) {
                        offsetDuration = duration;
                    }

                    lastUpdateDateWrapper.add(offsetDuration, 'h');

                    if (moment().isAfter(lastUpdateDateWrapper)) {
                        retrieve = true;
                    }
                }
            }

            return retrieve;
        };

        var retrieveAll = function (cacheKey, dataUrl, force, duration) {
            var deferred = $q.defer();

            // the cache entry for ALL events
            var DataService = $resource(dataUrl);

            // determine if we need a refresh from the server
            var updateCacheKey = cacheNameData + 'LastUpdate';
            var retrieve = requiresUpdate(updateCacheKey, force, duration);

            var cacheValue = dataCache.get(cacheKey);

            if (!retrieve && !angular.isUndefined(cacheValue)) {
                $timeout(function () {
                    deferred.resolve(cacheValue);
                }, 0);
            } else {
                DataService.query().$promise.then(function (list) {
                    cacheValue = list;

                    // store the list in cache
                    dataCache.put(cacheKey, cacheValue);

                    // update the last modified cache time
                    var currentDate = new Date();
                    updateCache.put(updateCacheKey, currentDate.toGMTString());

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

        var retrieveById = function (dataUrl, id, force, duration) {
            var deferred = $q.defer();

            var DataService = $resource(dataUrl);

            // determine if we need a refresh from the server
            var updateCacheKey = cacheNameData + 'LastUpdate:' + id;
            var retrieve = requiresUpdate(updateCacheKey, force, duration);

            // retrieve the current value from the cache
            var cacheKey = cacheNameData + ":" + id;
            var cacheValue = dataCache.get(cacheKey);

            if (!retrieve && !angular.isUndefined(cacheValue)) {
                $timeout(function () {
                    deferred.resolve(cacheValue);
                }, 0);
            } else {
                // make the call across the wire
                DataService.get({ id: id }).$promise.then(function (entity) {
                    cacheValue = entity;

                    // store the entity in cache
                    var currentDate = new Date();
                    updateCache.put(updateCacheKey, currentDate.toGMTString());
                    dataCache.put(cacheKey, cacheValue);

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

        return {
            setup: setup,

            all: retrieveAll,
            retrieveById: retrieveById
        };
    }
})();
