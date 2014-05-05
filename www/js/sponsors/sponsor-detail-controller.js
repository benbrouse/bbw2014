angular.module('bbw.sponsor-detail-controller', [])

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
}]);