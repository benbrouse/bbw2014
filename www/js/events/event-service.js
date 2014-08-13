(function() {
    'use strict';
    
    angular.module('bbw.event-service', ['ngResource', 'core-services', 'jmdobry.angular-cache', 'locations'])

    .factory('EventsService', ['$q', '$timeout', '$filter', '$log', '$resource', '$angularCacheFactory', 'LocationsService', 'AppSettings', function ($q, $timeout, $filter, $log, $resource, $angularCacheFactory, LocationsService, AppSettings) {
        var cacheNameData = 'eventDataCache';
        var cacheNameFavorite = 'eventFavoriteCache';

        // NOTE: http://jmdobry.github.io/angular-cache/configuration.html
        var dataCache = $angularCacheFactory(cacheNameData, {
            maxAge: AppSettings.cacheMaxAge,
            cacheFlushInterval: AppSettings.cacheFlushInterval,
            storageMode: 'localStorage'         // This cache will sync itself with `localStorage`.
        });

        var favoriteCache = $angularCacheFactory(cacheNameFavorite, {
            maxAge: AppSettings.cacheMaxAge,
            cacheFlushInterval: AppSettings.cacheFlushInterval,
            storageMode: 'localStorage'         // This cache will sync itself with `localStorage`.
        });


        var dataUrl = AppSettings.url + 'events/:id';

        var retrieveAll = function (force) {
            var deferred = $q.defer();

            // the cache entry for ALL events
            var Events = $resource(dataUrl);
            var cacheEntry = "events";

            // should we make the call across the wire?
            var retrieve = false;
            if (!angular.isUndefined(force) && force) {
                retrieve = true;
            }

            LocationsService.all(force).then(function (locations) {
                var cacheValue = dataCache.get(cacheEntry);

                if (!retrieve && !angular.isUndefined(cacheValue)) {
                    $timeout(function () {
                        cacheValue = processList(cacheValue, locations);
                        deferred.resolve(cacheValue);
                    }, 0);
                } else {
                    Events.query().$promise.then(function (list) {
                        cacheValue = processList(list, locations);

                        dataCache.put(cacheEntry, cacheValue);
                        deferred.resolve(cacheValue);
                    }, function (errResponse) {
                        if (!angular.isUndefined(cacheValue)) {
                            $log.write('EventsService: falling back to cache entry');

                            // fail safe
                            deferred.resolve(cacheValue);
                        } else {
                            // fail
                            deferred.reject(errResponse);
                        }
                    });
                }
            });


            return deferred.promise;
        };

        var processList = function(list, locations) {
            // add in the favorite flag
            list = _.map(list, function(event) {
                event.favorite = isFavorite(event.id);
                return event;
            });

            list = _.map(list, function(event) {
                event.location = getLocation(locations, event.locationId);
                return event;
            });

            return list;
        };

        var getEventById = function (eventId) {
            var id = angular.isString(eventId) ? Number(eventId) : eventId;

            var deferred = $q.defer();

            LocationsService.all().then(function(locations) {
                retrieveAll().then(function (eventList) {
                    var filtered = _.where(eventList, { id: id });
                    if (filtered != null && filtered.length > 0) {
                        var record = filtered[0];
                        record.favorite = isFavorite(record.id);
                        record.location = getLocation(locations, record.locationId);

                        deferred.resolve(record);
                    }
                }, function (err) {
                    deferred.reject(err);
                });
            });

            return deferred.promise;
        };

        var isFavorite = function (eventId) {
            var cacheEntry = "fav:" + eventId;
            var cacheValue = favoriteCache.get(cacheEntry);

            return !angular.isUndefined(cacheValue);
        };

        var getLocation = function (locations, id) {
            var entity = {};

            var filtered = _.where(locations, { id: id });
            if (filtered != null && filtered.length > 0) {
                entity = filtered[0];
            }

            return entity;
        };


        return {
            all: retrieveAll,
            get: getEventById,

            getEventDates: function(passedEventList) {
                var deferred = $q.defer();

                var processEventList = function(eventList) {
                    // get a list of unique dates for the events
                    var eventDatesOnly = _.pluck(eventList, 'date');

                    var eventShortDates = _.map(eventDatesOnly, function(date) {
                        var parsedDate = new Date(date);
                        return new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate()).toISOString();
                    });

                    // begin to transform the list
                    eventList = $filter('unique')(eventShortDates, 'date');

                    // define a function to be used to sort the list
                    var date_sort_asc = function(date1, date2) {
                        if (new Date(date1) > new Date(date2)) {
                            return 1;
                        }
                        if (new Date(date1) < new Date(date2)) {
                            return -1;
                        }
                        return 0;
                    };

                    // First let's sort the array in ascending order.
                    eventList = eventList.sort(date_sort_asc);

                    deferred.resolve(eventList);
                };

                if (angular.isUndefined(passedEventList)) {
                    retrieveAll().then(function(eventList) {
                        processEventList(eventList);
                    });
                } else {
                    processEventList(passedEventList);
                }

                return deferred.promise;
            },

            getEventLocations: function(passedEventList) {
                var deferred = $q.defer();

                var processEventList = function(eventList) {
                    // get a list of unique locations for the events
                    var eventLocationsOnly = _.pluckDeep(eventList, 'location.name');

                    // begin to transform the list
                    eventList = $filter('unique')(eventLocationsOnly, 'name');

                    // First let's sort the array in ascending order.
                    eventList = eventList.sort();

                    deferred.resolve(eventList);
                };

                if (angular.isUndefined(passedEventList)) {
                    retrieveAll().then(function(eventList) {
                        processEventList(eventList);
                    });
                } else {
                    processEventList(passedEventList);
                }

                return deferred.promise;
            },

            getLocationEvents: function (locationName, excludeId, passedEventList) {
                var deferred = $q.defer();

                LocationsService.all().then(function(locations) {
                    var processEventList = function (eventList) {
                        // begin to transform the list
                        eventList = $filter('matchesString')(eventList, 'location.name', locationName);
                        eventList = $filter('exclude')(eventList, 'id', excludeId);

                        // define a function to be used to sort the list
                        var date_sort_asc = function (date1, date2) {
                            if (new Date(date1) > new Date(date2)) {
                                return 1;
                            }
                            if (new Date(date1) < new Date(date2)) {
                                return -1;
                            }
                            return 0;
                        };

                        // First let's sort the array in ascending order.
                        eventList = eventList.sort(date_sort_asc);

                        // add in the favorite flag
                        eventList = _.map(eventList, function (event) {
                            event.favorite = isFavorite(event.id);
                            return event;
                        });

                        // resolve the event location
                        eventList = _.map(eventList, function (event) {
                            event.location = getLocation(locations, event.locationId);
                            return event;
                        });

                        deferred.resolve(eventList);
                    };

                    if (angular.isUndefined(passedEventList)) {
                        retrieveAll().then(function (eventList) {
                            processEventList(eventList);
                        });
                    } else {
                        processEventList(passedEventList);
                    }
                });

                return deferred.promise;
            },

            toggleFavorite: function (event) {
                event.favorite = !event.favorite;

                var cacheEntry = "fav:" + event.id;
                if (event.favorite) {
                    favoriteCache.put(cacheEntry, true);
                } else {
                    favoriteCache.remove(cacheEntry);
                }
            },

            isFavorite: isFavorite
        };
    }]);

})();
