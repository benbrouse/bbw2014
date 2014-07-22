angular.module('bbw.about-controller', ['ionic'])

// A simple controller that fetches a list of data from a service
.controller('AboutCtrl', ['$scope', '$log', '$ionicModal', function ($scope, $log, $ionicModal) {
    $scope.initialized = false;

    // Load the modal from the given template URL
    $ionicModal.fromTemplateUrl('templates/about-map-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.modalMap = modal;
    });

    // Load the modal from the given template URL
    $ionicModal.fromTemplateUrl('templates/about-settings-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.modalSettings = modal;
    });

    $scope.openMapModal = function () {
        $scope.modalMap.show();
    };

    $scope.closeMapModal = function () {
        $scope.modalMap.hide();
    };

    $scope.openSettingsModal = function () {
        $scope.modalSettings.show();
    };

    $scope.closeSettingsModal = function () {
        $scope.modalSettings.hide();
    };

    //Be sure to cleanup the modal
    $scope.$on('$destroy', function () {
        $scope.modalMap.remove();
    });


    $scope.getLocation = function() {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                $scope.latitude = position.coords.latitude;
                $scope.longitude = position.coords.longitude;

                $scope.$apply();
            },
            function () {
                $log.log('Error getting location');
            }
        );
    };
}]);
