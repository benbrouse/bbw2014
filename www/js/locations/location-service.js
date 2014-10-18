(function() {
    'use strict';

    angular
        .module('bbw.location-service', ['ngResource', 'core-services', 'jmdobry.angular-cache'])
        .factory('LocationsService', LocationService);

    LocationService.$inject = ['$q', '$timeout', '$log', '$resource', '$angularCacheFactory', 'AppSettings'];
    
    function LocationService($q, $timeout, $log, $resource, $angularCacheFactory, AppSettings) {
        var cacheName = 'locationDataCache';

        // NOTE: http://jmdobry.github.io/angular-cache/configuration.html
        var dataCache = $angularCacheFactory(cacheName, {
            maxAge: AppSettings.cacheMaxAge,
            cacheFlushInterval: AppSettings.cacheFlushInterval,
            storageMode: 'localStorage' // This cache will sync itself with `localStorage`.
        });

        var dataUrl = AppSettings.url + 'locations/:id';

        var retrieveAll = function(force) {
            var deferred = $q.defer();

            // the cache entry for ALL sponsors
            var Locations = $resource(dataUrl);
            var cacheEntry = "locations";

            // should we make the call across the wire?
            var retrieve = false;
            if (!angular.isUndefined(force) && force) {
                retrieve = true;
            }

            if (!retrieve && dataCache.get(cacheEntry)) {
                deferred.resolve(dataCache.get(cacheEntry));
            } else {
                Locations.query().$promise.then(function(list) {
                    // success
                    dataCache.put(cacheEntry, list);
                    deferred.resolve(list);
                }, function(errResponse) {
                    if (dataCache.get(cacheEntry)) {
                        $log.error('SponsorService: falling back to cache entry');

                        // fail safe
                        deferred.resolve(dataCache.get(cacheEntry));
                    } else {
                        // fail
                        deferred.reject(errResponse);
                    }
                });
            }

            return deferred.promise;
        };

        var getById = function(identifier) {
            var id = angular.isString(identifier) ? Number(identifier) : identifier;
            var entity = {};

            var getData = retrieveAll();

            $q.all([getData]).then(function(list) {
                var filtered = _.where(list, { id: id });
                if (filtered != null && filtered.length > 0) {
                    entity = filtered[0];
                }

                return entity;
            });
        };

        return {
            all: retrieveAll,
            get: getById
        };
    }
})();