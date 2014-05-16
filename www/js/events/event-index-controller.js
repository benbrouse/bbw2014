﻿angular.module('bbw.event-index-controller', ['ionic'])

// A simple controller that fetches a list of data from a service
.controller('EventIndexCtrl', ['$scope', '$log', '$filter', '$ionicModal', 'LoaderService', 'EventsService', 'AddressService', 'GoogleMapsService', function($scope, $log, $filter, $ionicModal, LoaderService, EventsService, AddressService, GoogleMapsService) {
    $scope.initialized = false;

    // Load the modal from the given template URL
    $ionicModal.fromTemplateUrl('templates/event-filter.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modalFilter = modal;
    });

    // Load the modal from the given template URL
    $ionicModal.fromTemplateUrl('templates/event-detail.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.modalEvent = modal;
    });

    $scope.openFilterModal = function () {
        $scope.modalFilter.show();
    };

    $scope.closeFilterModal = function() {
        $scope.modalFilter.hide();
    };
     
    $scope.openEventModal = function (eventId) {
        $scope.event = EventsService.get(eventId);
        $scope.currentModal = "eventDetail";
        $scope.modalEvent.show();
    };

    $scope.closeEventModal = function () {
        $scope.modalEvent.hide();
        $scope.currentModal = null;
    };

    //Be sure to cleanup the modal
    $scope.$on('$destroy', function() {
        $scope.modalFilter.remove();
        $scope.modalEvent.remove();
    });

    // Execute action on hide modal
    $scope.$on('modal.shown', function (modal) {
        // extra bootstrapping to display the map correctly
        if ($scope.currentModal == "eventDetail") {
            initializeMap();

            var eventAddress = $scope.event.location.address;
            if (!angular.isUndefined(eventAddress) && angular.isString(eventAddress)) {
                AddressService.geocode(eventAddress).then(function (location) {
                    $scope.map.setZoom(16);
                    $scope.map.setCenter(location);
                });
            }
        }
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

    var initializeMap = function ()
    {
        var mapOptions = {
            center: new google.maps.LatLng(43.07493, -89.381388),
            zoom: 16,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        var mapElement = document.getElementById('map');
        var map = new google.maps.Map(mapElement, mapOptions);

        // Stop the side bar from dragging when mousedown/tapdown on the map
        var mapElement = document.getElementById('map');
        google.maps.event.addDomListener(mapElement, 'mousedown', function (e) {
            e.preventDefault();
            return false;
        });

        $scope.map = map;
    }
}]);
