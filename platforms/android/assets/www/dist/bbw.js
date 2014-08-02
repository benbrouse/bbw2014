angular.module('events', [
                          'bbw.event-service',
                          'bbw.event-index-controller',
                          'bbw.event-detail-controller',
                          'bbw.eventDateSelectedFilter'
]);


angular.module('sponsors', [
                            'bbw.sponsor-service',
                            'bbw.sponsor-index-controller',
                            'bbw.sponsor-detail-controller',
                            'bbw.sponsor-level-filter'
]);

angular.module('bbw-depends', ['events', 'sponsors']);
;// the main app definition
var app = angular.module('bbw', ['ionic', 'google-maps', 'core-all', 'bbw-depends']);

app.config(function($stateProvider, $urlRouterProvider) {


    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    $stateProvider
        // setup an abstract state for the tabs directive
        .state('tab', {
            url: "/tab",
            abstract: true,
            templateUrl: "templates/tabs.html"
        })
        .state('tab.event-index', {
            url: '/events',
            views: {
                'events-tab': {
                    templateUrl: 'templates/event-index.html',
                    controller: 'EventIndexCtrl'
                }
            }
        })
        .state('tab.event-detail', {
            url: '/event/:eventId',
            views: {
                'events-tab': {
                    templateUrl: 'templates/event-detail.html',
                    controller: 'EventDetailCtrl'
                }
            }
        })
        .state('tab.sponsor-index', {
            url: '/sponsors',
            views: {
                'sponsors-tab': {
                    templateUrl: 'templates/sponsor-index.html',
                    controller: 'SponsorIndexCtrl'
                }
            }
        })
        .state('tab.sponsor-detail', {
            url: '/sponsor/:sponsorId',
            views: {
                'sponsors-tab': {
                    templateUrl: 'templates/sponsor-detail.html',
                    controller: 'SponsorDetailCtrl'
                }
            }
        })
        .state('tab.contact', {
            url: '/contact',
            views: {
                'contact-tab': {
                    templateUrl: 'templates/contact.html'
                }
            }
        })
        .state('tab.about', {
            url: '/about',
            views: {
                'about-tab': {
                    templateUrl: 'templates/about.html'
                }
            }
        })
        .state('tab.openingtap', {
            url: '/opening-tap',
            views: {
                'about-tab': {
                    templateUrl: 'templates/opening-tap.html'
                }
            }
        });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/about');
});

angular.module('bbw-version', []).value('version', '0.0.1');

;'use strict';

/**

 */
angular.module('bbw.eventDateSelectedFilter', []).filter('eventDateSelected', ['$parse', function ($parse) {

    return function (items, filterOn, selectedDates) {
        if ((filterOn || angular.isUndefined(filterOn)) && angular.isArray(items)) {
            var newItems = [],
              get = angular.isString(filterOn) ? $parse(filterOn) : function (item) { return item; };

            var extractValueToCompare = function (item) {
                return angular.isObject(item) ? get(item) : item;
            };

            var isSameDate = function (date1, date2) {
                var convertDate1 = new Date(date1);
                convertDate1.setHours(0, 0, 0, 0);

                var convertDate2 = new Date(date2);
                convertDate2.setHours(0, 0, 0, 0);

                return angular.equals(convertDate1, convertDate2);
            };

            angular.forEach(items, function (item) {
                var itemDate = extractValueToCompare(item);

                angular.forEach(selectedDates, function(selectedDate) {
                    if (isSameDate(itemDate, selectedDate)) {
                        newItems.push(item);
                    }
                });
            });

            items = newItems;
        }

        return items;
    };
}]);;angular.module('bbw.event-detail-controller', ['ionic'])

// A simple controller that shows a tapped item's data
.controller('EventDetailCtrl', ['$scope', '$stateParams', '$window', 'EventsService', 'AddressService', 'GoogleMapsService', function ($scope, $stateParams, $window, EventsService, AddressService, GoogleMapsService) {
    $scope.leftButtons = [
        {
            type: 'button-icon icon ion-arrow-left-c',
            tap: function () {
                $window.history.back();
            }
        }
    ];

    var getMapInstance = function () {
        var mapEl = angular.element(document.querySelector('.angular-google-map'));
        var iScope = mapEl.isolateScope();
        var map = iScope.map;

        return map;
    };

    $scope.event = EventsService.get($stateParams.eventId);

    $scope.$on('viewState.viewEnter', function () {
        var map = getMapInstance();
        GoogleMapsService.gmaps.event.trigger(map, "resize");
    });

    // do we have an address for this event ??
    var eventAddress = $scope.event.location.address;
    if (!angular.isUndefined(eventAddress) && angular.isString(eventAddress)) {
        AddressService.geocode(eventAddress).then(function (location) {
            var map = getMapInstance();

            map.setZoom(16);
            map.setCenter(location);
        });
    }

    $scope.map = {
        center: {
            latitude: 45,
            longitude: -73
            // latitude: $scope.myInfo.location.latitude,
            // longitude: $scope.myInfo.location.longitude
        },
        bounds: {},
        zoom: 8
    };
}]);
;angular.module('bbw.event-index-controller', ['ionic'])

// A simple controller that fetches a list of data from a service
.controller('EventIndexCtrl', ['$scope', '$log', '$filter', '$ionicModal', 'LoaderService', 'EventsService', function($scope, $log, $filter, $ionicModal, LoaderService, EventsService) {
    $scope.initialized = false;

    $scope.leftButtons = [
        //{
        //    type: 'button-icon icon ion-navicon',
        //    tap: function() {
        //        $scope.sideMenuController.toggleLeft();
        //    }
        //}
    ];

    $scope.rightButtons = [
        {
            type: 'button-icon icon ion-navicon',
            tap: function() {
                $scope.openModal();
            }
        }
    ];

    // Load the modal from the given template URL
    $ionicModal.fromTemplateUrl('templates/event-filter.html', function($ionicModal) {
        $scope.modal = $ionicModal;
    }, {
        // Use our scope for the scope of the modal to keep it simple
        scope: $scope,
        // The animation we want to use for the modal entrance
        animation: 'slide-in-up'
    });

    $scope.toggle = function() {
        //alert('Test');
    };

    $scope.openModal = function() {
        $scope.modal.show();
    };

    $scope.closeModal = function() {
        $scope.modal.hide();
    };

    //Be sure to cleanup the modal
    $scope.$on('$destroy', function() {
        $scope.modal.remove();
    });

    // Show loader from service
    LoaderService.show('Retrieving Event List');

    EventsService.all().then(function(events) {
        $scope.events = events;

        // retrieve the list of unique dates for the events,    NOTE: these should be sorted at this point also
        EventsService.getEventDates($scope.events).then(function(eventDates) {
            $scope.eventDates = _.map(eventDates, function(date) {
                return { date: date, selected: true };
            });

            $scope.selection = [];

            $scope.$watch('eventDates|filter:{selected:true}', function(nv) {
                $scope.selection = nv.map(function(date) {
                    return date.date;
                });
            }, true);

            // Hide overlay when done
            LoaderService.hide();
            $scope.initialized = true;
        }, function (reason) {
            // could not get the list of event dates
            $log.write(reason);
        });
    }, function (reason) {
        // could not get the list of events
        $log.write(reason);
    });

}]);
;angular.module('bbw.event-service', [])

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
        get: function (eventId) {
            var id = angular.isString(eventId) ? Number(eventId) : eventId;

            // Simple index lookup
            var filteredEvents = _.where(events, { id: id });
            return filteredEvents[0];
        },

        getEventDates: function (passedEventList) {
            var deferred = $q.defer();

            var processEventList = function(eventList) {
                // get a list of unique dates for the events
                var eventDatesOnly = _.pluck(eventList, 'date');

                var eventShortDates = _.map(eventDatesOnly, function (date) {
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
;angular.module('core-services', [
                            'core.address-service',
                            'core.loader-service',
                            'core.google-maps-service'
]);

angular.module('core-filters', [
                            'core.costFilter',
                            'core.matchesDateFilter',
                            'core.uniqueFilter'
]);

angular.module('core-all', [
                            'core-services',
                            'core-filters'
]);;'use strict';

/**
 * Intended to be chained after the currency filter.    If there is no cost,
   output the text whatever is passed
 */
angular.module('core.costFilter', []).filter('costnone', ['$injector', function ($injector) {

    return function (items, defaultText) {
        if (angular.isString(items)) {
            var $filter = $injector.get('$filter');
            var currencyFilter = $filter('currency');

            var nothing = currencyFilter(0);

            if (angular.equals(items, nothing)) {
                if(angular.isUndefined(defaultText)) {
                    defaultText = "Free";
                }

                items = defaultText;
            }
        } else {
            // we are forcing this to be an error
            items = undefined;
        }

        return items;
    };
}]);;'use strict';

/**
 * This was taken from the project: http://angular-ui.github.io/ui-utils
 *
 * Filters out all duplicate items from an array by checking the specified key
 * @param [key] {string} the name of the attribute of each object to compare for uniqueness
 if the key is empty, the entire object will be compared
 if the key === false then no filtering will be performed
 * @return {array}
 */
angular.module('core.matchesDateFilter', []).filter('matchesDate', ['$parse', function ($parse) {

    return function (items, filterOn, dateToMatch) {

        if (filterOn === false) {
            return items;
        }

        if ((filterOn || angular.isUndefined(filterOn)) && angular.isArray(items)) {
            var newItems = [],
              get = angular.isString(filterOn) ? $parse(filterOn) : function (item) { return item; };

            var extractValueToCompare = function (item) {
                return angular.isObject(item) ? get(item) : item;
            };

            var isSameDate = function (date1, date2) {
                var convertDate1 = new Date(date1);
                convertDate1.setHours(0, 0, 0, 0);

                var convertDate2 = new Date(date2);
                convertDate2.setHours(0, 0, 0, 0);

                return angular.equals(convertDate1, convertDate2);
            };

            angular.forEach(items, function (item) {
                var itemDate = extractValueToCompare(item);
                if (isSameDate(itemDate, dateToMatch)) {
                    newItems.push(item);
                }
            });

            items = newItems;
        }
        return items;
    };
}]);;'use strict';

/**
 * This was taken from the project: http://angular-ui.github.io/ui-utils
 *
 * Filters out all duplicate items from an array by checking the specified key
 * @param [key] {string} the name of the attribute of each object to compare for uniqueness
 if the key is empty, the entire object will be compared
 if the key === false then no filtering will be performed
 * @return {array}
 */
angular.module('core.uniqueFilter', []).filter('unique', ['$parse', function ($parse) {

    return function (items, filterOn) {

        if (filterOn === false) {
            return items;
        }

        if ((filterOn || angular.isUndefined(filterOn)) && angular.isArray(items)) {
            var newItems = [],
              get = angular.isString(filterOn) ? $parse(filterOn) : function (item) { return item; };

            var extractValueToCompare = function (item) {
                return angular.isObject(item) ? get(item) : item;
            };

            angular.forEach(items, function (item) {
                var isDuplicate = false;

                for (var i = 0; i < newItems.length; i++) {
                    if (angular.equals(extractValueToCompare(newItems[i]), extractValueToCompare(item))) {
                        isDuplicate = true;
                        break;
                    }
                }

                if (!isDuplicate) {
                    newItems.push(item);
                }

            });
            items = newItems;
        }
        return items;
    };
}]);;/*
    core service to perform address lookups
*/
angular.module('core.address-service', ['core.google-maps-service'])
.factory('AddressService', ['$q', '$timeout', 'GoogleMapsService', function ($q, $timeout, GoogleMapsService) {
    var geocodeAddress = function(address) {
        var deferred = $q.defer();

        if (!angular.isUndefined(address) && !angular.isNull(address) && angular.isString(address)) {
            var geocoder = new GoogleMapsService.gmaps.Geocoder();

            geocoder.geocode({ 'address': address }, function (results, status) {
                if (status == GoogleMapsService.gmaps.GeocoderStatus.OK) {
                    deferred.resolve(results[0].geometry.location);
                } else {
                    deferred.reject("Geocode was not successful for the following reason: " + status);
                }
            });
        } else {
            deferred.reject("The address was not in the correct format.");
        }

        return deferred.promise;
    };

    return {
        geocode: geocodeAddress
    };
}]);
;/*
    core service to wrap the google.maps global object
*/

angular.module('core.google-maps-service', [])

.service('GoogleMapsService', function () {
    return {
        gmaps: google.maps
    };
});;angular.module('core.loader-service', [])
.factory('LoaderService', ['$rootScope', '$ionicLoading', function ($rootScope, $ionicLoading) {

    // Trigger the loading indicator
    return {
        show: function(text) { //code from the ionic framework doc

            // Show the loading overlay and text
            $rootScope.loading = $ionicLoading.show({

                // The text to display in the loading indicator
                content: text,

                // The animation to use
                animation: 'fade-in',

                // Will a dark overlay or backdrop cover the entire view
                showBackdrop: true,

                // The maximum width of the loading indicator
                // Text will be wrapped if longer than maxWidth
                maxWidth: 200,

            });
        },
        hide: function() {
            $rootScope.loading.hide();
        }
    };
}]);;angular.module('bbw.sponsor-detail-controller', [])

// A simple controller that shows a tapped item's data
.controller('SponsorDetailCtrl', ['$scope', '$stateParams', '$window', 'SponsorsService', function ($scope, $stateParams, $window, SponsorsService) {
    $scope.sponsor = SponsorsService.get($stateParams.sponsorId);

    $scope.leftButtons = [
           {
               type: 'button-icon icon ion-arrow-left-c',
               tap: function () {
                   $window.history.back();
               }
           }
    ];
}]);;angular.module('bbw.sponsor-index-controller', [])

// A simple controller that fetches a list of data from a service
.controller('SponsorIndexCtrl', ['$scope', 'LoaderService', 'SponsorsService', function($scope, LoaderService, SponsorsService) {
    $scope.initialized = false;

    LoaderService.show('Retrieving Sponsor List');

    SponsorsService.all().then(function(sponsors) {
        $scope.sponsors = sponsors;
        $scope.levels = SponsorsService.getLevels();

        // Hide overlay when done
        LoaderService.hide();
        $scope.initialized = true;
    });
}]);


;'use strict';

/**
 * Converts sponsor level to a human readable version
 */
angular.module('bbw.sponsor-level-filter', []).filter('sponsorLevel', [function () {

    return function (item) {
        if (!angular.isNumber(item)) {
            return item;
        }

        switch(item) {
            case 0:
                item = "Flagship Sponsor";
                break;

            case 1:
                item = "Gold Sponsor";
                break;

            case 2:
                item = "Silver Sponsor";
                break;

            default:
                item = "Unknown Sponsor";
                break;
        }

        return item;
    };
}]);;angular.module('bbw.sponsor-service', [])

.factory('SponsorsService', ['$q', '$timeout', function ($q, $timeout) {
    // Some fake testing data
    var sponsors = [
      { id: 0, level: 0, title: 'Heavy Seas', image: 'img/temp/HS_logo_sl.png', description: 'This is the description for Heavy Seas.' },
      { id: 1, level: 1, title: 'Metropolitan', image: 'img/temp/metro_logo_sl.png', description: 'This is the description for Metropolitan.' },
      { id: 2, level: 1, title: 'Max\'s Tap House', image: 'img/temp/Maxs_New_sl.png', description: 'This is the description for Max\'s.' },
      { id: 3, level: 2, title: 'Brewer\'s Art', image: 'img/temp/brewers-art.png', description: 'Another description for Brewer\'s Art.' }
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
