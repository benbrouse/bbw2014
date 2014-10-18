(function() {
    'use strict';

    angular
        .module('bbw.event-service', ['ngResource', 'core-services', 'jmdobry.angular-cache', 'locations'])
        .factory('EventsService', EventsService);

    EventsService.$inject = ['$q', '$timeout', '$filter', '$log', '$resource', '$angularCacheFactory', 'LocationsService', 'DateUtils', 'AppSettings'];

    function EventsService($q, $timeout, $filter, $log, $resource, $angularCacheFactory, LocationsService, DateUtils, AppSettings) {
        var cacheNameData = 'eventDataCache';
        var cacheNameEventUpdate = 'eventUpdateCache';
        var cacheNameFavorite = 'eventFavoriteCache';

        // NOTE: http://jmdobry.github.io/angular-cache/configuration.html
        var dataCache = $angularCacheFactory(cacheNameData, {
            maxAge: AppSettings.cacheMaxAge,
            cacheFlushInterval: AppSettings.cacheFlushInterval,
            storageMode: 'localStorage', // This cache will sync itself with `localStorage`.
            verifyIntegrity: false
        });

        var favoriteCache = $angularCacheFactory(cacheNameFavorite, {
            maxAge: AppSettings.cacheMaxAge,
            cacheFlushInterval: AppSettings.cacheFlushInterval,
            storageMode: 'localStorage', // This cache will sync itself with `localStorage`.
            verifyIntegrity: false
        });

        var updateCache = $angularCacheFactory(cacheNameEventUpdate, {
            maxAge: AppSettings.cacheMaxAge,
            cacheFlushInterval: AppSettings.cacheFlushInterval,
            storageMode: 'localStorage', // This cache will sync itself with `localStorage`.
            verifyIntegrity: false
        });

        var updateCacheKey = 'EventLastUpdate';

        var dataUrl = AppSettings.url + 'events/:id';

        var retrieveAll = function(force) {
            var deferred = $q.defer();

            // the cache entry for ALL events
            var Events = $resource(dataUrl);
            var cacheEntry = "events";

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

            LocationsService.all(retrieve).then(function(locations) {
                if (!retrieve && !angular.isUndefined(cacheValue)) {
                    $timeout(function() {
                        //cacheValue = processList(cacheValue, locations);
                        deferred.resolve(cacheValue);
                    }, 0);
                } else {
                    Events.query().$promise.then(function (list) {

                        // define a function to be used to sort the list
                        var date_sort_asc = function (date1, date2) {
                            if (new Date(date1.date) > new Date(date2.date)) {
                                return 1;
                            }
                            if (new Date(date1.date) < new Date(date2.date)) {
                                return -1;
                            }
                            return 0;
                        };

                        // sort the array in ascending order.
                        list = list.sort(date_sort_asc);

                        var updatedList = [];
                        var prevEvent = null;
                        var correlationId = 0;

                        for (var i = 0; i < list.length; i++) {

                            var event = list[i];

                            event.description = event.description;
                            event.type = 'event';
                            event.selected = true;
                            event.correlationId = correlationId;

                            if (i === 0) {
                                var initDivider = angular.copy(event);
                                initDivider.selected = false;
                                initDivider.separator = true;
                                initDivider.correlationId = correlationId;
                                updatedList.push(initDivider);
                            }
                            else if (prevEvent != null && !DateUtils.isSameDate(prevEvent.date, event.date)) {
                                correlationId++;
                                event.correlationId = correlationId;

                                var dayDivider = angular.copy(event);

                                dayDivider.selected = false;
                                dayDivider.separator = true;
                                dayDivider.correlationId = correlationId;

                                updatedList.push(dayDivider);
                            }

                            updatedList.push(event);

                            prevEvent = event;
                        }

                        cacheValue = processList(updatedList, locations);

                        // store the list in cache
                        var currentDate = new Date();
                        updateCache.put(updateCacheKey, currentDate.toGMTString());
                        dataCache.put(cacheEntry, cacheValue);
                        deferred.resolve(cacheValue);
                    }, function(errResponse) {
                        if (!angular.isUndefined(cacheValue)) {
                            $log.error('EventsService: falling back to cache entry');

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
            list = _.map(list, function (event) {
                event.type = 'event';
                event.favorite = isFavorite(event.id);
                event.location = getLocation(locations, event.locationId);
                return event;
            });

            return list;
        };

        var getEventById = function(eventId) {
            var id = angular.isString(eventId) ? Number(eventId) : eventId;

            var deferred = $q.defer();

            LocationsService.all(false).then(function (locations) {

                retrieveAll(false).then(function(eventList) {
                    var filtered = _.where(eventList, { id: id });
                    if (filtered != null && filtered.length > 0) {
                        var record = filtered[0];
                        record.favorite = isFavorite(record.id);
                        record.location = getLocation(locations, record.locationId);

                        deferred.resolve(record);
                    }
                }, function(err) {
                    deferred.reject(err);
                });
            });

            return deferred.promise;
        };

        var isFavorite = function(eventId) {
            var cacheEntry = "fav:" + eventId;
            var cacheValue = favoriteCache.get(cacheEntry);

            return !angular.isUndefined(cacheValue);
        };

        var getLocation = function(locations, id) {
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
//                    var eventDatesOnly = _.pluck(eventList, 'date');
                    var eventDatesOnly = [
                        '2014-10-10T12:00:00', '2014-10-11T12:00:00', '2014-10-12T12:00:00', '2014-10-13T12:00:00',
                        '2014-10-14T12:00:00', '2014-10-15T12:00:00', '2014-10-16T12:00:00', '2014-10-17T12:00:00',
                        '2014-10-18T12:00:00', '2014-10-19T12:00:00'
                    ];

                    var eventShortDates = _.map(eventDatesOnly, function(date) {
                        var parsedDate = new Date(date);
                        return new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate()).toISOString();
                    });

                    // begin to transform the list
                    eventList = $filter('unique')(eventShortDates, 'date');

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

                    // sort the array in ascending order.
                    eventList = eventList.sort(date_sort_asc);

                    deferred.resolve(eventList);
                };

                if (angular.isUndefined(passedEventList)) {
                    retrieveAll(false).then(function(eventList) {
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
                    retrieveAll(false).then(function(eventList) {
                        processEventList(eventList);
                    });
                } else {
                    processEventList(passedEventList);
                }

                return deferred.promise;
            },

            getLocationEvents: function(locationName, excludeId, passedEventList) {
                var deferred = $q.defer();

                LocationsService.all(false).then(function(locations) {
                    var processEventList = function(eventList) {
                        // begin to transform the list
                        eventList = $filter('matchesString')(eventList, 'location.name', locationName);
                        eventList = $filter('exclude')(eventList, 'id', excludeId);

                        // add in the favorite flag & event locations
                        eventList = _.map(eventList, function(event) {
                            event.favorite = isFavorite(event.id);
                            //event.location = getLocation(locations, event.locationId);
                            return event;
                        });

                        deferred.resolve(eventList);
                    };

                    if (angular.isUndefined(passedEventList)) {
                        retrieveAll(false).then(function(eventList) {
                            processEventList(eventList);
                        });
                    } else {
                        processEventList(passedEventList);
                    }
                });

                return deferred.promise;
            },

            toggleFavorite: function(event) {
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
    }
})();
