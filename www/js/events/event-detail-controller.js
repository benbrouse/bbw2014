angular.module('bbw.event-detail-controller', ['ionic'])

// A simple controller that shows a tapped item's data
.controller('EventDetailCtrl', ['$scope', '$stateParams', '$window', 'EventsService', 'AddressService', 'GoogleMapsService', function ($scope, $stateParams, $window, EventsService, AddressService, GoogleMapsService) {
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

    $scope.goBack = function() {
        $window.history.back();
    };
}]);
