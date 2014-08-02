angular.module('bbw.sponsor-index-controller', [])

// A simple controller that fetches a list of data from a service
.controller('SponsorIndexCtrl', ['$scope', '$ionicModal', 'LoaderService', 'SponsorsService', function ($scope, $ionicModal, LoaderService, SponsorsService) {
    $scope.initialized = false;
    $scope.sponsorInitialized = true;

    // Load the modal from the given template URL
    $ionicModal.fromTemplateUrl('templates/sponsor-detail-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.modalSponsor = modal;
    });

    $scope.openSponsorModal = function (sponsorId) {
        SponsorsService.get(sponsorId).then(function(sponsor) {
            $scope.sponsor = sponsor;
            $scope.modalSponsor.show();
        });
    };

    $scope.closeSponsorModal = function () {
        $scope.modalSponsor.hide();
    };

    LoaderService.show('Retrieving Sponsor List');
     
    SponsorsService.all().then(function(sponsors) {
        $scope.sponsors = sponsors;
        $scope.levels = SponsorsService.getLevels();

        // Hide overlay when done
        LoaderService.hide();
        $scope.initialized = true;
    });
}]);


