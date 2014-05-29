angular.module('bbw.event-service', ['ngResource', 'core-services', 'jmdobry.angular-cache'])

.factory('EventsService', ['$q', '$timeout', '$filter', '$log', '$resource', '$angularCacheFactory', 'AppSettings', function ($q, $timeout, $filter, $log, $resource, $angularCacheFactory, AppSettings) {
    var cacheName = 'eventDataCache';

    // NOTE: http://jmdobry.github.io/angular-cache/configuration.html
    var dataCache = $angularCacheFactory(cacheName, {
        maxAge: AppSettings.cacheMaxAge,
        cacheFlushInterval: AppSettings.cacheFlushInterval,
        storageMode: 'localStorage'         // This cache will sync itself with `localStorage`.
    });

    var dataUrl = AppSettings.url + 'events/:id';

    // Some fake testing data
    var mockData = [
        {
            id: 0,
            title: 'Event 0 Longer Title More Blah Blah Blah',
            date: '2014-10-10T20:44:55',
            cost: 9.99,
            description: 'Description 1. The sly fox went to roost. Blah Blah.     Can you see this?',
            image: 'img/temp/HS_logo_sl.png',
            location: { name: 'Metropolitan', address: '902 S Charles St, Baltimore, MD 21230', image: 'img/temp/HS_logo_sl.png' },
            sponsors: [ '0', '1']
        },
        { id: 15, title: 'Event 15', date: '2014-10-10T21:44:55', cost: 20, description: 'Description 1.', location: { name: 'Max\'s Taphouse', address: '737 S Broadway, Baltimore, MD 21231', image: 'img/temp/Maxs_New_sl.png' } },
        { id: 1, title: 'Event 1', date: '2014-10-10T20:44:55', cost: 0, description: 'Description 2', location: { name: 'Metropolitan', address: '902 S Charles St, Baltimore, MD 21230', image: 'img/temp/metro_logo_sl.png' } },
        { id: 2, title: 'Event 2', date: '2014-10-11T20:44:55', cost: 0, description: 'Description 3', location: { name: 'Metropolitan', address: '902 S Charles St, Baltimore, MD 21230', image: 'img/temp/metro_logo_sl.png' } },
        { id: 3, title: 'Event 3', date: '2014-10-11T20:44:55', cost: 0, description: 'Description 3', location: { name: 'Metropolitan', address: '902 S Charles St, Baltimore, MD 21230', image: 'img/temp/metro_logo_sl.png' } },
        { id: 5, title: 'Event 5', date: '2014-10-14T20:44:55', cost: 0, description: 'Description 3', location: { name: 'Metropolitan', address: '902 S Charles St, Baltimore, MD 21230', image: 'img/temp/metro_logo_sl.png' } },
        { id: 6, title: 'Event 6', date: '2014-10-14T20:44:55', cost: 0, description: 'Description 3', location: { name: 'Metropolitan', address: '902 S Charles St, Baltimore, MD 21230', image: 'img/temp/metro_logo_sl.png' } },
        { id: 7, title: 'Event 7', date: '2014-10-15T20:44:55', cost: 0, description: 'Description 3', location: { name: 'Metropolitan', address: '902 S Charles St, Baltimore, MD 21230', image: 'img/temp/metro_logo_sl.png' } },
        { id: 8, title: 'Event 8', date: '2014-10-17T20:44:55', cost: 0, description: 'Description 3', location: { name: 'Metropolitan', address: '902 S Charles St, Baltimore, MD 21230', image: 'img/temp/metro_logo_sl.png' } },
        { id: 9, title: 'Event 9', date: '2014-10-17T20:44:55', cost: 0, description: 'Description 3', location: { name: 'Metropolitan', address: '902 S Charles St, Baltimore, MD 21230', image: 'img/temp/metro_logo_sl.png' } },
        { id: 10, title: 'Event 10', date: '2014-10-19T20:44:55', cost: 0, description: 'Description 3', location: { name: 'Metropolitan', address: '902 S Charles St, Baltimore, MD 21230', image: 'img/temp/metro_logo_sl.png' } },
        { id: 11, title: 'Event 11', date: '2014-10-19T20:44:55', cost: 0, description: 'Description 3', location: { name: 'Metropolitan', address: '902 S Charles St, Baltimore, MD 21230', image: 'img/temp/metro_logo_sl.png' } },
        { id: 12, title: 'Event 12', date: '2014-10-20T20:44:55', cost: 0, description: 'Description 3', location: { name: 'Metropolitan', address: '902 S Charles St, Baltimore, MD 21230', image: 'img/temp/metro_logo_sl.png' } },
        { id: 13, title: 'Event 13', date: '2014-10-20T20:44:55', cost: 0, description: 'Description 3', location: { name: 'Metropolitan', address: '902 S Charles St, Baltimore, MD 21230', image: 'img/temp/metro_logo_sl.png' } },
        { id: 14, title: 'Event 14', date: '2014-10-20T20:44:55', cost: 0, description: 'Description 4', location: { name: 'Barflys', address: '620 E Fort Ave, Baltimore, MD 21230', phone: '4101112345', image: 'img/temp/barflys_logo.png' } },
        {
            id: 4, title: 'Event 4', date: '2014-10-12T20:44:55', cost: 0, description: 'Description 3', location: { name: 'Barflys', address: '620 E Fort Ave, Baltimore, MD 21230', phone: '4101112345', image: 'img/temp/barflys_logo.png' } 
        }
    ];

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

        if (!retrieve && dataCache.get(cacheEntry)) {
            deferred.resolve(dataCache.get(cacheEntry));
        } else {
            if (AppSettings.useMockData) {
                $timeout(function () {
                    dataCache.put(cacheEntry, mockData);
                    deferred.resolve(mockData);
                }, 1500);
            } else {
                Events.query().$promise.then(function (list) {
                    // success
                    dataCache.put(cacheEntry, list);
                    deferred.resolve(list);
                }, function (errResponse) {
                    if (dataCache.get(cacheEntry)) {
                        $log.write('EventsService: falling back to cache entry');

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

    var getEventById = function (eventId) {
        var id = angular.isString(eventId) ? Number(eventId) : eventId;

        var deferred = $q.defer();

        retrieveAll().then(function (eventList) {
            var filtered = _.where(eventList, { id: id });
            if (filtered != null && filtered.length > 0) {
                var record = filtered[0];
                record.favorite = isFavorite(record.id);

                deferred.resolve(record);
            }
        }, function (err) {
            deferred.reject(err);
        });

        return deferred.promise;
    };

    var isFavorite = function (eventId) {
        // TODO: complete this
        $log.write(eventId);
        return false;
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

                deferred.resolve(eventList);
            };

            if (angular.isUndefined(passedEventList)) {
                retrieveAll().then(function (eventList) {
                    processEventList(eventList);
                });
            } else {
                processEventList(passedEventList);
            }

            return deferred.promise;
        },

        toggleFavorite: function (eventId) {
            // retrieve the event and toggle it's status
            var event = getEventById(eventId);
            event.favorite = !event.favorite;

            // TODO: persist the favorite status for this event


            return event;
        }
    };
}]);
