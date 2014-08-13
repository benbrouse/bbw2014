angular.module('bbw.event-index-controller', ['ionic', 'core-all'])

// A simple controller that fetches a list of data from a service
.controller('EventIndexCtrl', ['$scope', '$log', '$filter', '$ionicModal', '$ionicActionSheet', '$ionicLoading', 'AppSettings', 'EventsService', 'AddressService', 'DistanceService', function ($scope, $log, $filter, $ionicModal, $ionicActionSheet, $ionicLoading, AppSettings, EventsService, AddressService, DistanceService) {
    $scope.initialized = false;
    $scope.allowFavorites = AppSettings.allowFavorites;
    $scope.eventInitialized = false;

    $scope.sortByDate = true;

    $scope.favoriteFilter = { text: "Show favorite events only", checked: false };

    $scope.data = {
        isLoading: true
    };

    // state flag for which tab is being displayed
    $scope.showEventMap = false;
    $scope.showEventDescription = true;
    $scope.showEventOther = false;

    // Load the modal from the given template URL
    $ionicModal.fromTemplateUrl('templates/event-filter-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modalFilter = modal;
    });

    // Load the modal from the given template URL
    $ionicModal.fromTemplateUrl('templates/event-detail-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modalEvent = modal;
    });

    $scope.openFilterModal = function () {
        $scope.modalFilter.show();
    };

    $scope.closeFilterModal = function() {
        $scope.modalFilter.hide();
    };
     
    $scope.openEventModal = function (eventId) {
        $scope.showLoading('Retrieving Event Details');
        
        // retrieve all data needed for the modal
        EventsService.get(eventId).then(function(event) {
            $scope.event = event;

            EventsService.getLocationEvents($scope.event.location.name, eventId).then(function (locationEvents) {
                $scope.locationEvents = locationEvents;

                $scope.hideLoading();

                if (!$scope.modalEvent.isShown()) {
                    // setup state for the modal
                    $scope.showEventDescription = true;
                    $scope.showEventMap = false;

                    $scope.modalEvent.show();
                    $scope.currentModal = "eventDetail";
                }
            });
        });
    };

    $scope.closeEventModal = function () {
        $scope.modalEvent.hide();

        $scope.eventInitialized = true;
        $scope.currentModal = null;
    };

    $scope.loadingText = "Loading event data";

    $scope.refreshContent = function () {
        // update content
        getEventData(true);

        // Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');
        $scope.$apply();
    };

    //Be sure to cleanup the modal
    $scope.$on('$destroy', function () {
        if ($scope.modalEvent) {
            $scope.modalEvent.remove();
        }

        if ($scope.modalFilter) {
            $scope.modalFilter.remove();
        }
    });

    // Execute action on hide modal
    $scope.$on('modal.shown', function () {
        // extra bootstrapping to display the map correctly
        if ($scope.currentModal == "eventDetail") {
            var eventAddress = $scope.event.location.address;
            if (!angular.isUndefined(eventAddress) && angular.isString(eventAddress)) {
                AddressService.geocode(eventAddress).then(function (location) {
                    $scope.eventInitialized = true;

                    navigator.geolocation.getCurrentPosition(
                        function (position) {
                            var start = {
                                latitude: position.coords.latitude,
                                longitude: position.coords.longitude
                            };

                            var end = {
                                latitude: location.lat(),
                                longitude: location.lng()
                            };

                            $scope.event.location.distance = DistanceService.haversine(start, end, { unit: 'mile' }).toFixed(1);

                            $scope.$apply();
                        },
                        function () {
                            $log.error('Error getting location');
                        }
                    );
                });
            }

            // HACK!!! - otherwise the google map doesn't account for anyspace at all!
            var modalElement = document.querySelector('.modal');
            var fullHeight = modalElement.clientHeight;

            var wrapperElement = angular.element(document.querySelector('.event-detail-wrapper'));
            // NOTE: 255 is the size of all the elements above the map div
            wrapperElement.attr('style', 'height: ' + (fullHeight - 255) + 'px');
        }
    });

    var initializeMap = function(zoomLevel, location, name) {
        var mapOptions = {
            center: location,
            zoom: zoomLevel,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        var mapElement = document.getElementById('map');
        var map = new google.maps.Map(mapElement, mapOptions);

        var infowindow = new google.maps.InfoWindow({
            content: "This is the text"
        });

        var marker = new google.maps.Marker({
            position: location,
            map: map,
            title: name
        });

        google.maps.event.addListener(marker, 'click', function () {
            $log.write('show the marker' + infowindow.content);
            //infowindow.open(map, marker);
        });

        $scope.map = map;
    };

    $scope.switchEventView = function (id) {
        $scope.showEventDescription = (id == 'details') ? true : false;
        $scope.showEventMap = (id == 'location') ? true : false;
        $scope.showEventOther = (id == 'events') ? true : false;

        if ($scope.showEventMap) {
            var eventAddress = $scope.event.location.address;
            if (!angular.isUndefined(eventAddress) && angular.isString(eventAddress)) {
                AddressService.geocode(eventAddress).then(function (location) {

                    $scope.eventInitialized = true;
                    initializeMap(16, location, $scope.event.location.name);
                });
            }
        }

        google.maps.event.trigger($scope.map, "resize");
    };

    $scope.switchSort = function() {
        $scope.sortByDate = !$scope.sortByDate;
    };

    $scope.toggleFavorite = function() {
        EventsService.toggleFavorite($scope.event);
    };

    $scope.toggleLocationFavorite = function(eventId) {
        var event = _.findWhere($scope.locationEvents, { id: eventId });
        if (event != null) {
            EventsService.toggleFavorite(event);
        }
    };

    $scope.showLoading = function(text) {
        // Show the loading overlay and text
        $ionicLoading.show({
            // The text to display in the loading indicator
            content: 'One moment please',

            // The animation to use
            animation: 'fade-in',

            // Will a dark overlay or backdrop cover the entire view
            showBackdrop: true,

            // The maximum width of the loading indicator
            // Text will be wrapped if longer than maxWidth
            maxWidth: 200,

            // The delay in showing the indicator
            showDelay: 500
        });

        $scope.loadingText = text;
        $scope.data.isLoading = true;
    };

    $scope.hideLoading = function () {
        $ionicLoading.hide();
        $scope.data.isLoading = false;
    };


    var getEventData = function(force) {
        // Show loader from service
        $scope.showLoading('Retrieving Event List');

        EventsService.all(force).then(function(events) {
            $scope.events = events;

            $scope.filterSettingsList = [
                $scope.favoriteFilter
//                { text: "Limit to events near me", checked: false }
            ];

            EventsService.getEventLocations($scope.events).then(function(eventLocations) {
                $scope.eventLocations = _.map(eventLocations, function(location) {
                    return { name: location, selected: true };
                });
            });

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
                $scope.hideLoading();
                $scope.initialized = true;
            }, function(reason) {
                // could not get the list of event dates
                $log.write(reason);
            });
        }, function(reason) {
            // could not get the list of events
            $log.write(reason);
        });
    };

    getEventData(false);
}]);
