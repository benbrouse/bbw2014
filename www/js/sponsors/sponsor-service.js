(function() {
    'use strict';

    angular.module('bbw.sponsor-service', ['ngResource', 'core-services', 'jmdobry.angular-cache'])
        .factory('SponsorsService', [
            '$q', '$timeout', '$log', '$resource', '$angularCacheFactory', 'AppSettings', function($q, $timeout, $log, $resource, $angularCacheFactory, AppSettings) {
                var cacheName = 'sponsorDataCache';

                // NOTE: http://jmdobry.github.io/angular-cache/configuration.html
                var dataCache = $angularCacheFactory(cacheName, {
                    maxAge: AppSettings.cacheMaxAge,
                    cacheFlushInterval: AppSettings.cacheFlushInterval,
                    storageMode: 'localStorage' // This cache will sync itself with `localStorage`.
                });

                var dataUrl = AppSettings.url + 'sponsors/:id';

                var levels = [0, 1, 2, 3, 4];

                var retrieveAll = function(force) {
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
                        Sponsors.query().$promise.then(function(sponsorsList) {
                            // success
                            dataCache.put(cacheEntry, sponsorsList);
                            deferred.resolve(sponsorsList);
                        }, function(errResponse) {
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

                    return deferred.promise;
                };

                var getById = function(sponsorId) {
                    var id = angular.isString(sponsorId) ? Number(sponsorId) : sponsorId;

                    var deferred = $q.defer();

                    retrieveAll().then(function(sponsorList) {
                        var filteredSponsors = _.where(sponsorList, { id: id });
                        if (filteredSponsors != null && filteredSponsors.length > 0) {
                            var sponsor = filteredSponsors[0];

                            deferred.resolve(sponsor);
                        }
                    }, function(err) {
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
            }
        ]);
})();
