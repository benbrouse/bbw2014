﻿angular.module('bbw.event-index-controller', ['ionic'])

// A simple controller that fetches a list of data from a service
.controller('EventIndexCtrl', ['$scope', '$log', '$filter', '$ionicModal', '$ionicActionSheet', 'LoaderService', 'EventsService', 'AddressService', function ($scope, $log, $filter, $ionicModal, $ionicActionSheet, LoaderService, EventsService, AddressService) {
    $scope.initialized = false;
    $scope.eventInitialized = false;

    $scope.sortByDate = true;

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
        LoaderService.show('Retrieving Event Details');
        
        // retrieve all data needed for the modal
        $scope.event = EventsService.get(eventId);
        EventsService.getLocationEvents($scope.event.location.name, eventId).then(function (locationEvents) {
            $scope.locationEvents = locationEvents;

            LoaderService.hide();

            if (!$scope.modalEvent.isShown()) {
                // setup state for the modal
                $scope.showEventDescription = true;
                $scope.showEventMap = false;

                $scope.modalEvent.show();
                $scope.currentModal = "eventDetail";
            }
        });
    };

    $scope.closeEventModal = function () {
        $scope.modalEvent.hide();

        $scope.eventInitialized = true;
        $scope.currentModal = null;
    };

    $scope.refreshContent = function () {
        // todo: get update content

        // Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');
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
                    initializeMap(16, location, $scope.event.location.name);
                });
            }
        }
    });

    // Show loader from service
    LoaderService.show('Retrieving Event List');

    EventsService.all().then(function(events) {
        $scope.events = events;

        $scope.filterSettingsList = [
            { text: "Only display my selected events", checked: false },
            { text: "Limit to events near me", checked: false }
        ];

        EventsService.getEventLocations($scope.events).then(function (eventLocations) {
            $scope.eventLocations = _.map(eventLocations, function (location) {
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

    var initializeMap = function(zoomLevel, location, name) {
        var mapOptions = {
            center: location,
            zoom: zoomLevel,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        var mapElement = document.getElementById('map');
        var map = new google.maps.Map(mapElement, mapOptions);

        new google.maps.Marker({
            position: location,
            map: map,
            title: name
        });

        // Stop the side bar from dragging when mousedown/tapdown on the map
        google.maps.event.addDomListener(mapElement, 'mousedown', function(e) {
            e.preventDefault();
            return false;
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
}]);
