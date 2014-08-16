(function() {
    'use strict';

    angular
        .module('bbw.event-index-controller', ['ionic', 'core-all'])
        .controller('EventIndexCtrl', EventIndexCtrl);

    EventIndexCtrl.$inject = ['$scope', '$log', '$filter', '$ionicModal', '$ionicActionSheet', '$ionicLoading', 'AppSettings', 'EventsService', 'AddressService', 'DistanceService'];
    
    function EventIndexCtrl($scope, $log, $filter, $ionicModal, $ionicActionSheet, $ionicLoading, AppSettings, EventsService, AddressService, DistanceService) {
        var vm = $scope;

        vm.initialized = false;
        vm.allowFavorites = AppSettings.allowFavorites;
        vm.eventInitialized = false;

        vm.sortByDate = true;

        vm.favoriteFilter = { text: "Show favorite events only", checked: false };

        vm.data = {
            isLoading: true
        };

        // state flag for which tab is being displayed
        vm.showEventMap = false;
        vm.showEventDescription = true;
        vm.showEventOther = false;

        // Load the modal from the given template URL
        $ionicModal.fromTemplateUrl('templates/event-filter-modal.html', {
            scope: vm,
            animation: 'slide-in-up'
        }).then(function(modal) {
            vm.modalFilter = modal;
        });

        // Load the modal from the given template URL
        $ionicModal.fromTemplateUrl('templates/event-detail-modal.html', {
            scope: vm,
            animation: 'slide-in-up'
        }).then(function(modal) {
            vm.modalEvent = modal;
        });

        vm.openFilterModal = function () {
            vm.modalFilter.show();
        };

        vm.closeFilterModal = function () {
            vm.modalFilter.hide();
        };
     
        vm.openEventModal = function (eventId) {
            vm.showLoading('Retrieving Event Details');
        
            // retrieve all data needed for the modal
            EventsService.get(eventId).then(function(event) {
                vm.event = event;

                EventsService.getLocationEvents(vm.event.location.name, eventId).then(function (locationEvents) {
                    vm.locationEvents = locationEvents;

                    vm.hideLoading();

                    if (!vm.modalEvent.isShown()) {
                        // setup state for the modal
                        vm.showEventDescription = true;
                        vm.showEventMap = false;

                        vm.modalEvent.show();
                        vm.currentModal = "eventDetail";
                    }
                });
            });
        };

        vm.closeEventModal = function () {
            vm.modalEvent.hide();

            vm.eventInitialized = true;
            vm.currentModal = null;
        };

        vm.loadingText = "Loading event data";

        vm.refreshContent = function () {
            // update content
            getEventData(true);

            // Stop the ion-refresher from spinning
            $scope.$broadcast('scroll.refreshComplete');
            $scope.$apply();
        };

        //Be sure to cleanup the modal
        $scope.$on('$destroy', function () {
            if (vm.modalEvent) {
                vm.modalEvent.remove();
            }

            if (vm.modalFilter) {
                vm.modalFilter.remove();
            }
        });

        // Execute action on hide modal
        $scope.$on('modal.shown', function () {
            // extra bootstrapping to display the map correctly
            if (vm.currentModal == "eventDetail") {
                var eventAddress = vm.event.location.address;
                if (!angular.isUndefined(eventAddress) && angular.isString(eventAddress)) {
                    AddressService.geocode(eventAddress).then(function (location) {
                        vm.eventInitialized = true;

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

                                vm.event.location.distance = DistanceService.haversine(start, end, { unit: 'mile' }).toFixed(1);

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

            vm.map = map;
        };

        vm.switchEventView = function (id) {
            vm.showEventDescription = (id == 'details') ? true : false;
            vm.showEventMap = (id == 'location') ? true : false;
            vm.showEventOther = (id == 'events') ? true : false;

            if (vm.showEventMap) {
                var eventAddress = vm.event.location.address;
                if (!angular.isUndefined(eventAddress) && angular.isString(eventAddress)) {
                    AddressService.geocode(eventAddress).then(function (location) {

                        vm.eventInitialized = true;
                        initializeMap(16, location, vm.event.location.name);
                    });
                }
            }

            google.maps.event.trigger(vm.map, "resize");
        };

        vm.switchSort = function () {
            vm.sortByDate = !vm.sortByDate;
        };

        vm.toggleFavorite = function () {
            EventsService.toggleFavorite(vm.event);
        };

        vm.toggleLocationFavorite = function (eventId) {
            var event = _.findWhere(vm.locationEvents, { id: eventId });
            if (event != null) {
                EventsService.toggleFavorite(event);
            }
        };

        vm.showLoading = function (text) {
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

            vm.loadingText = text;
            vm.data.isLoading = true;
        };

        vm.hideLoading = function () {
            $ionicLoading.hide();
            vm.data.isLoading = false;
        };


        var getEventData = function(force) {
            // Show loader from service
            vm.showLoading('Retrieving Event List');

            EventsService.all(force).then(function(events) {
                vm.events = events;

                vm.filterSettingsList = [
                    vm.favoriteFilter
    //                { text: "Limit to events near me", checked: false }
                ];

                EventsService.getEventLocations(vm.events).then(function (eventLocations) {
                    vm.eventLocations = _.map(eventLocations, function (location) {
                        return { name: location, selected: true };
                    });
                });

                // retrieve the list of unique dates for the events,    NOTE: these should be sorted at this point also
                EventsService.getEventDates(vm.events).then(function (eventDates) {
                    vm.eventDates = _.map(eventDates, function (date) {
                        return { date: date, selected: true };
                    });

                    vm.selection = [];

                    $scope.$watch('eventDates|filter:{selected:true}', function(nv) {
                        vm.selection = nv.map(function (date) {
                            return date.date;
                        });
                    }, true);

                    // Hide overlay when done
                    vm.hideLoading();
                    vm.initialized = true;
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
    }
})();
