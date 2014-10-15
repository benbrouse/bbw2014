(function() {
    'use strict';

    angular
        .module('bbw.event-index-controller', ['ionic', 'core-all'])
        .controller('EventIndexCtrl', EventIndexCtrl);

    EventIndexCtrl.$inject = ['$scope', '$log', '$filter', '$ionicModal', '$ionicActionSheet', '$ionicLoading', '$timeout', '$document', 'AppSettings', 'EventsService', 'AddressService', 'DistanceService', 'DateUtils', 'ToastService'];
    
    function EventIndexCtrl($scope, $log, $filter, $ionicModal, $ionicActionSheet, $ionicLoading, $timeout, $document, AppSettings, EventsService, AddressService, DistanceService, DateUtils, ToastService) {

        var modals = {};
        var vm = $scope;

        vm.allowFavorites = AppSettings.allowFavorites;
        vm.data = { isLoading: true, itemWidth: 0 };
        vm.eventInitialized = false;
        vm.favoriteFilter = { text: "Show favorite events only", checked: false };
        vm.getItemHeight = getItemHeight;
        vm.getItemWidth = getItemWidth;
        vm.initialized = false;
        vm.loadingText = "Loading event data";

        vm.openGPSNavigator = openGPSNavigator;
        vm.refreshContent = refreshContent;
        vm.switchEventView = switchEventView;

        vm.sortByDate = true;

        // state flag for which tab is being displayed
        vm.showEventMap = false;
        vm.canShowEventMap = false;
        vm.showEventDescription = false;
        vm.showEventOther = false;

        vm.showSocial = false;
        vm.socialOptions = {
            facebook: false,
            google: false,
            email: false,
            twitter: false
        };

        vm.gpsAvailable = false;
        vm.navigationAppUrl = "";

        vm.shareEvent = shareEvent;
        vm.switchSort = function () { vm.sortByDate = !vm.sortByDate; };

        vm.toggleFavorite = toggleFavorite;
        vm.toggleLocationFavorite = toggleLocationFavorite;

        //// modals
        vm.openFilterModal = function() {
            modals.modalFilter.show();
            vm.initialized = false;
            showLoading('Processing Filters');
        };

        vm.closeFilterModal = function () {
            modals.modalFilter.hide().then(function() {
                updateContent();
            });
        };

        vm.openEventModal = openEventModal;
        vm.closeEventModal = closeEventModal;

        activate();

        ////////////////////
        function activate() {
            showLoading('Retrieving Event List');
            setupModals();
            setupControllerEvents();

            $timeout(function () {
                getEventData(false);
                hideLoading();

                vm.data.itemWidth = angular.element(document.getElementById('event-content'))[0].clientWidth;
            }, 250);
        }

        function closeEventModal() {
            modals.modalEvent.hide();

            vm.eventInitialized = false;
            vm.currentModal = null;
        }

        function filterEvents(eventList) {
            var filteredList = [];

            var eventCount = 0;
            for (var i = 0; i < eventList.length; i++) {
                var event = eventList[i];

                var addToList = true;

                // process the event against the favorite filter
                if (vm.favoriteFilter.checked && !event.separator) {
                    if (!EventsService.isFavorite(event.id)) {
                        addToList = false;
                    }
                }

                // process the event against the date filters
                if (addToList) {
                    if (!angular.isUndefined(vm.eventDates)) {
                        for (var j = 0; j < vm.eventDates.length; j++) {
                            if (DateUtils.isSameDate(vm.eventDates[j].date, event.date)) {
                                addToList = vm.eventDates[j].selected;
                            }
                        }
                    }
                }

                if (addToList) {
                    if (event.selected) {
                        eventCount++;
                    }

                    filteredList.push(event);
                }
            }

            if (filteredList.length === 0 || eventCount === 0) {
                filteredList = [];
                var emptyEvent = { message: true, selected: true };
                filteredList.push(emptyEvent);
            }

            return filteredList;
        }

        function getEventData(force, updateText) {
            if (! angular.isUndefined(updateText)) {
                showLoading(updateText);
            } else {
                showLoading('Retrieving Event List');
            }
            vm.initialized = false;

            EventsService.all(force).then(function (events) {
                vm.eventsMaster = events;

                vm.filterSettingsList = [
                    vm.favoriteFilter
    //                { text: "Limit to events near me", checked: false }
                ];

                if (force) {
                    EventsService.getEventLocations(vm.events).then(function (eventLocations) {
                        vm.eventLocations = _.map(eventLocations, function (location) {
                            return { name: location, selected: true };
                        });
                    });
                }

                // retrieve the list of unique dates for the events,    NOTE: these should be sorted at this point also
                if (angular.isUndefined(vm.eventDates)) {
                    EventsService.getEventDates(vm.events).then(function(eventDates) {
                        vm.eventDates = _.map(eventDates, function(date) {
                            var dateSelected = true;

                            var eventDate = new Date(date);
                            var eventDateWrapper = moment(eventDate);

                            //// add 4 hours to the last time this was checked and compare against now
                            //lastUpdateDateWrapper.add(4, 'h');

                            if (moment().isAfter(eventDateWrapper) && !moment().isSame(eventDateWrapper, 'day')) {
                                dateSelected = false;
                            }

                            return { date: date, selected: dateSelected };
                        });

                        vm.selection = [];

                        if (!angular.isUndefined(vm.eventDateWatcher)) {
                            vm.eventDateWatcher();
                        }

                        vm.eventDateWatcher = $scope.$watch('eventDates|filter:{selected:true}', function(nv) {
                            vm.selection = nv.map(function(date) {
                                return date.date;
                            });
                        }, true);

                        vm.events = filterEvents(vm.eventsMaster);

                    }, function (reason) {
                        // could not get the list of event dates
                        $log.write(reason);
                    });
                } else {
                    vm.events = filterEvents(vm.eventsMaster);
                }

                // Hide overlay when done
                hideLoading();
                vm.initialized = true;

            }, function (reason) {
                // could not get the list of events
                $log.write(reason);
            });
        }

        function getItemHeight(item, index) {
            if (item.type === 'message') {
                return 74;
            }

            return (item.selected ? 125 : 38);
        }

        function getItemWidth(item, index) {
            return vm.data.itemWidth + "px";
        }

        function hideLoading() {
            //$ionicLoading.hide();
            vm.data.isLoading = false;
        }

        function openEventModal(event) {

            //showLoading('Retrieving Event Details');

            setupModals();

            // retrieve all data needed for the modal
            EventsService.getLocationEvents(event.location.name, event.id, vm.eventsMaster).then(function (locationEvents) {
                if (!angular.isUndefined(vm.event) && event.locationId == vm.event.locationId) {
                    event.location.distance = vm.event.location.distance;
                }

                vm.locationEvents = locationEvents;
                vm.event = event;

                if (!modals.modalEvent.isShown()) {
                    modals.modalEvent.show();

                    // setup default state for the modal
                    vm.showEventDescription = true;
                    vm.showEventMap = false;
                    vm.canShowEventMap = false;
                    vm.gpsAvailable = false;
                    vm.showEventOther = false;

                    vm.currentModal = "eventDetail";
                }

                //hideLoading();
            });
        }

        function openGPSNavigator() {
            window.location = vm.navigationAppUrl;
            return false;
        }

        function refreshContent() {
            $timeout(function() {
                // update content
                getEventData(true);

                // Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            }, 0);
        }

        function updateContent() {
            $timeout(function() {
                getEventData(false, "Filtering events");  // get the data from cache and apply filters

                // Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            }, 0);
        }

        function setupControllerEvents() {
            //Be sure to cleanup the modal
            $scope.$on('$destroy', function() {
                if (modals.modalEvent) {
                    modals.modalEvent.remove();
                }

                if (modals.modalFilter) {
                    modals.modalFilter.remove();
                }
            });

            // Execute action on hide modal
            $scope.$on('modal.shown', function() {
                //hideLoading();

                // extra bootstrapping to display the map correctly
                if (vm.currentModal == "eventDetail") {
                    //// HACK: for this is a temporary fix for the ionic framework
                    // http://forum.ionicframework.com/t/modal-not-receiving-touch-events/8025/2
                    //$timeout(function() {
                    //    if ($document[0].body.classList.contains('loading-active')) {
                    //        $document[0].body.classList.remove('loading-active');
                    //    }
                    //}, 500);

                    var eventAddress = vm.event.location.address;
                    if (!angular.isUndefined(eventAddress) && angular.isString(eventAddress)) {
                        AddressService.geocode(eventAddress).then(function(location) {

                            //#region 
                            angular.extend($scope, {
                                center: {
                                    lat: location.lat(),
                                    lng: location.lng(),
                                    zoom: 16
                                },
                                markers: {
                                    locationMarker: {
                                        lat: location.lat(),
                                        lng: location.lng(),
                                        focus: true,
                                        draggable: false
                                    }
                                },

                                layers: {
                                    baselayers: {
                                        //osm: {
                                        //    name: 'OpenStreetMap',
                                        //    url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                                        //    type: 'xyz'
                                        //},
                                        googleRoadmap: {
                                            name: 'Streets',
                                            layerType: 'ROADMAP',
                                            type: 'google'
                                        },

                                        //// http://wiki.openstreetmap.org/wiki/MapQuest#MapQuest-hosted_map_tiles
                                        //mapQuest: {
                                        //    name: 'Street',
                                        //    url: 'http://{s}.mqcdn.com/tiles/1.0.0/{styleId}/{z}/{x}/{y}.png',
                                        //    type: 'xyz',
                                        //    layerParams: {
                                        //        styleId: 'osm',
                                        //        attribution: 'Data, imagery and map information provided by MapQuest, OpenStreetMap <http://www.openstreetmap.org/copyright> and contributors',
                                        //        subdomains: ['otile1', 'otile2', 'otile3', 'otile4'],

                                        //    }
                                        //},
                                        mapQuestSat: {
                                            name: 'Satellite',
                                            url: 'http://{s}.mqcdn.com/tiles/1.0.0/{styleId}/{z}/{x}/{y}.png',
                                            type: 'xyz',
                                            layerParams: {
                                                styleId: 'sat',
                                                attribution: 'Data, imagery and map information provided by MapQuest, OpenStreetMap <http://www.openstreetmap.org/copyright> and contributors',
                                                subdomains: ['otile1', 'otile2', 'otile3', 'otile4'],
                                            }
                                        }
                                    }
                                }
                            });

                            //#endregion

                            vm.canShowEventMap = true;

                            return location;
                        }).then(function(location) {

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

                                    $timeout(function () {
                                        vm.event.location.distance = DistanceService.haversine(start, end, { unit: 'mile' }).toFixed(1);

                                        if (ionic.Platform.isAndroid()) {
                                            vm.navigationAppUrl = "geo:" + end.latitude + "," + end.longitude + ";u=35"; // "37.786971,-122.399677;u=35";
                                        } else if (ionic.Platform.isIOS()) {
                                            // http://stackoverflow.com/questions/14286951/mobile-html5-launch-phones-native-navigation-app
                                            vm.navigationAppUrl = "maps:daddr=" + end.latitude + "," + end.longitude;
                                        }

                                        vm.gpsAvailable = true;
                                    }, 250);
                                },
                                function (err) {
                                    $log.error('Error getting location: ' + err.code);
                                }
                            );
                        });
                    }

                    vm.eventInitialized = true;
                }
            });

            $scope.$on('modal.hidden', function () {
            });
        }

        //function setupSharing(event) {
        //    var message = 'Check out this event for Baltimore Beer Week!';

        //    vm.showSocial = false;
        //    vm.socialOptions.facebook = false;
        //    vm.socialOptions.google = false;
        //    vm.socialOptions.twitter = false;

        //    if (!angular.isUndefined(window.plugins) && !angular.isUndefined(window.plugins.socialsharing)) {
        //        window.plugins.socialsharing.canShareVia(shareEventDecode('facebook'), message, event.title, event.location.image, event.sourceUrl, function(e) {
        //            alert(e);
        //            vm.socialOptions.facebook = true;
        //            vm.showSocial = true;

        //        }, function(e) { alert('error' + e); });

        //        window.plugins.socialsharing.canShareVia(shareEventDecode('google'), message, event.title, event.location.image, event.sourceUrl, function (e) {
        //            vm.socialOptions.google = true;
        //            vm.showSocial = true;
        //        });

        //        window.plugins.socialsharing.canShareVia(shareEventDecode('twitter'), message, event.title, event.location.image, event.sourceUrl, function (e) {
        //            vm.socialOptions.twitter = true;
        //            vm.showSocial = true;
        //        });
        //    } else {
        //        vm.socialOptions.facebook = true;
        //        vm.socialOptions.google = true;
        //        vm.socialOptions.twitter = true;
        //        vm.showSocial = true;
        //    }

        //}

        function setupModals() {
            if (modals.modalFiter == null) {
                // Load the modal from the given template URL
                $ionicModal.fromTemplateUrl('templates/event-filter-modal.html', {
                    scope: vm,
                    animation: 'no-animation',
                    //animation: 'slide-in-up',
                    hardwareBackButtonClose: false
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

        function shareEvent(event, type) {
            var message = 'Check out this event for Baltimore Beer Week!';
            var app = shareEventDecode(type);

            var image = (type !== 'google') ? event.location.image : null;

            if (!angular.isUndefined(app)) {
                window.plugins.socialsharing.shareVia(app, message, event.title, image, event.sourceUrl);
            }
        }

        function shareEventDecode(type) {
            var app = null;

            switch(type) {
                case 'facebook':
                    app = 'com.facebook.katana';
                    break;

                case 'twitter':
                    app = 'com.twitter.android';
                    break;

                case 'google':
                    app = 'com.google.android.apps.plus';
                    break;

                case 'email':
                    app = 'email';
                    break;
            }

            return app;
        }

        function showLoading(text) {
            //// Show the loading overlay and text
            //$ionicLoading.show({
            //    // The text to display in the loading indicator
            //    template: text
            //});

            vm.loadingText = text;
            vm.data.isLoading = true;
        }

        function switchEventView(id) {
            if (!vm.eventInitialized) {
                return;
            }

            vm.showEventDescription = (id == 'details') ? true : false;
            vm.showEventMap = (id == 'location') ? true : false;
            vm.showEventOther = (id == 'events') ? true : false;
        }    

        function toggleFavorite(eventId) {
            var event = _.findWhere(vm.events, { id: eventId });
            if (event != null) {
                EventsService.toggleFavorite(event);
            }
        }

        function toggleLocationFavorite(eventId) {
            var event = _.findWhere(vm.locationEvents, { id: eventId });
            if (event != null) {
                EventsService.toggleFavorite(event);
            }
        }
    }
})();
