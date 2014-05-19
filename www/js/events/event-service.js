angular.module('bbw.event-service', [])

.factory('EventsService', ['$q', '$timeout', '$filter', function ($q, $timeout, $filter) {
    // Some fake testing data
    var events = [
      { id: 0, title: 'Event 0', date: '2014-10-10T20:44:55', cost: 9.99, description: 'Description 1.', location: { name: 'Metropolitan', address: '902 S Charles St, Baltimore, MD 21230', image: 'img/temp/HS_logo_sl.png' } },
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
      { id: 14, title: 'Event 14', date: '2014-10-20T20:44:55', cost: 0, description: 'Description 4', location: { name: 'Metropolitan', address: '902 S Charles St, Baltimore, MD 21230', image: 'img/temp/metro_logo_sl.png' } },
      { id: 4, title: 'Event 4', date: '2014-10-12T20:44:55', cost: 0, description: 'Description 3', location: { name: 'Metropolitan', address: '902 S Charles St, Baltimore, MD 21230', image: 'img/temp/metro_logo_sl.png' } }
    ];

    var retrieveAll = function () {
        var deferred = $q.defer();

        $timeout(function() {
            deferred.resolve(events);
        }, 300);

        return deferred.promise;
    };

    return {
        all: retrieveAll,
        get: function(eventId) {
            var id = angular.isString(eventId) ? Number(eventId) : eventId;

            // Simple index lookup
            var filteredEvents = _.where(events, { id: id });
            return filteredEvents[0];
        },

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

        getLocationEvents: function (locationName, passedEventList) {
            var deferred = $q.defer();

            var processEventList = function (eventList) {
                // begin to transform the list
                eventList = $filter('matchesString')(eventList, 'location.name', locationName);

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
        }
};
}]);
