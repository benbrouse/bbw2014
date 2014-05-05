angular.module('bbw.sponsor-index-controller', [])

// A simple controller that fetches a list of data from a service
.controller('SponsorIndexCtrl', ['$scope', 'LoaderService', 'SponsorsService', function($scope, LoaderService, SponsorsService) {
    $scope.initialized = false;

    LoaderService.show('Retrieving Sponsor List');

    SponsorsService.all().then(function(sponsors) {
        $scope.sponsors = sponsors;
        $scope.levels = SponsorsService.getLevels();

        // Hide overlay when done
        LoaderService.hide();
        $scope.initialized = true;
    });
}]);


