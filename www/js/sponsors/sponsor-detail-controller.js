(function() {
    'use strict';

    angular
        .module('bbw.sponsor-detail-controller', ['ionic', 'core-all'])
        .controller('SponsorDetailCtrl', SponsorDetailCtrl);

    SponsorDetailCtrl.$inject = ['$scope', '$stateParams', '$window', 'SponsorsService'];
    
    function SponsorDetailCtrl($scope, $stateParams, $window, SponsorsService) {
        $scope.sponsor = SponsorsService.get($stateParams.sponsorId);

        $scope.leftButtons = [
            {
                type: 'button-icon icon ion-arrow-left-c',
                tap: function() {
                    $window.history.back();
                }
            }
        ];
    }
})();