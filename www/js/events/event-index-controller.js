﻿(function() {
    'use strict';

    angular
        .module('bbw.event-index-controller', ['ionic', 'core-all'])
        .controller('EventIndexCtrl', EventIndexCtrl);

    EventIndexCtrl.$inject = ['$scope', '$log', '$filter', '$ionicModal', '$ionicActionSheet', '$ionicLoading', '$timeout', '$document', 'AppSettings', 'EventsService', 'AddressService', 'DistanceService'];
    
    function EventIndexCtrl($scope, $log, $filter, $ionicModal, $ionicActionSheet, $ionicLoading, $timeout, $document, AppSettings, EventsService, AddressService, DistanceService) {

        var modals = {};
        var vm = $scope;

        vm.allowFavorites = AppSettings.allowFavorites;
        vm.data = { isLoading: true };
        vm.eventInitialized = false;
        vm.favoriteFilter = { text: "Show favorite events only", checked: false };
        vm.initialized = false;
        vm.loadingText = "Loading event data";

        vm.refreshContent = refreshContent;
        vm.switchEventView = switchEventView;

        vm.sortByDate = true;

        // state flag for which tab is being displayed
        vm.showEventMap = false;
        vm.showEventDescription = true;
        vm.showEventOther = false;

        vm.switchSort = function () { vm.sortByDate = !vm.sortByDate; };

        vm.toggleFavorite = function () { EventsService.toggleFavorite(vm.event); };
        vm.toggleLocationFavorite = toggleLocationFavorite;

        //// modals
        vm.openFilterModal = function () { modals.modalFilter.show(); };
        vm.closeFilterModal = function () { modals.modalFilter.hide(); };

        vm.openEventModal = openEventModal;
        vm.closeEventModal = closeEventModal;

        activate();

        ////////////////////
        function activate() {
            setupModals();
            setupControllerEvents();

            $timeout(function () {
                getEventData(false);
            }, 100);
        }

        function openEventModal(eventId) {
            showLoading('Retrieving Event Details');

            setupModals();

            // retrieve all data needed for the modal
            EventsService.get(eventId).then(function(event) {

                EventsService.getLocationEvents(event.location.name, eventId).then(function(locationEvents) {
                    vm.event = event;
                    vm.locationEvents = locationEvents;

                    hideLoading();

                    if (!modals.modalEvent.isShown()) {
                        // setup default state for the modal
                        vm.showEventDescription = true;
                        vm.showEventMap = false;
                        vm.showEventOther = false;

                        modals.modalEvent.show();

                        vm.currentModal = "eventDetail";
                    }
                });
            });
        }

        function closeEventModal() {
            modals.modalEvent.hide();

            vm.eventInitialized = false;
            vm.currentModal = null;
        }

        function getEventData(force) {
            // Show loader from service
            showLoading('Retrieving Event List');

            EventsService.all(force).then(function (events) {
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

                    $scope.$watch('eventDates|filter:{selected:true}', function (nv) {
                        vm.selection = nv.map(function (date) {
                            return date.date;
                        });
                    }, true);

                    // Hide overlay when done
                    hideLoading();
                    vm.initialized = true;
                }, function (reason) {
                    // could not get the list of event dates
                    $log.write(reason);
                });
            }, function (reason) {
                // could not get the list of events
                $log.write(reason);
            });
        }

        function hideLoading() {
            // $ionicLoading.hide();
            vm.data.isLoading = false;
        }

        function refreshContent() {
            // update content
            getEventData(true);

            // Stop the ion-refresher from spinning
            $scope.$broadcast('scroll.refreshComplete');
            $scope.$apply();
        }

        function setupControllerEvents() {
            //Be sure to cleanup the modal
            $scope.$on('$destroy', function () {
                if (modals.modalEvent) {
                    modals.modalEvent.remove();
                }

                if (modals.modalFilter) {
                    modals.modalFilter.remove();
                }
            });

            // Execute action on hide modal
            $scope.$on('modal.shown', function () {
                // extra bootstrapping to display the map correctly
                if (vm.currentModal == "eventDetail") {

                    // HACK!!! - otherwise the google map doesn't account for anyspace at all!
                    var modalElement = document.querySelector('.modal');
                    var fullHeight = modalElement.clientHeight;

                    var wrapperElement = angular.element(document.querySelector('#map'));
                    // NOTE: 255 is the size of all the elements above the map div
                    wrapperElement.attr('style', 'height: ' + (fullHeight - 255) + 'px');

                    // HACK: for this is a temporary fix for the ionic framework
                        // http://forum.ionicframework.com/t/modal-not-receiving-touch-events/8025/2
                    $timeout(function() {
                        if($document[0].body.classList.contains('loading-active')) {
                            $document[0].body.classList.remove('loading-active');
                        }
                    }, 500);

                    var eventAddress = vm.event.location.address;
                    if (!angular.isUndefined(eventAddress) && angular.isString(eventAddress)) {
                        AddressService.geocode(eventAddress).then(function (location) {
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

                                    vm.map = {
                                        center: {
                                            latitude: location.lat(),
                                            longitude: location.lng()
                                        },
                                        zoom: 16
                                    };

                                    vm.marker = {
                                        id: 0,
                                        coords: {
                                            latitude: location.lat(),
                                            longitude: location.lng()
                                        },
                                        options: {
                                            draggable: false
                                        }
                                    };

                                    $scope.$apply();

                                    $timeout(function() {
                                        vm.eventInitialized = true;
                                        //vm.map.control.refresh();
                                    }, 250);
                                },
                                function () {
                                    $log.error('Error getting location');
                                }
                            );
                        });
                    }


                }
            });
        }

        function setupModals() {
            if (modals.modalFiter == null) {
                // Load the modal from the given template URL
                $ionicModal.fromTemplateUrl('templates/event-filter-modal.html', {
                    scope: vm,
                    animation: 'slide-in-up'
                }).then(function (modal) {
                    modals.modalFilter = modal;
                });
            }

            if (modals.modalEvent == null) {
                // Load the modal from the given template URL
                $ionicModal.fromTemplateUrl('templates/event-detail-modal.html', {
                    scope: vm,
                    animation: 'slide-in-up'
                }).then(function (modal) {
                    modals.modalEvent = modal;
                });
            }
        }

        function showLoading(text) {
            //// Show the loading overlay and text
            //$ionicLoading.show({
            //    // The text to display in the loading indicator
            //    template: 'One moment please'
            //});

            vm.loadingText = text;
            vm.data.isLoading = true;
        }

        function switchEventView(id) {
            vm.showEventDescription = (id == 'details') ? true : false;
            vm.showEventMap = (id == 'location') ? true : false;
            vm.showEventOther = (id == 'events') ? true : false;
        }    

        function toggleLocationFavorite(eventId) {
            var event = _.findWhere(vm.locationEvents, { id: eventId });
            if (event != null) {
                EventsService.toggleFavorite(event);
            }
        }
    }
})();
