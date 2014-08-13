(function() {
    'use strict';

    angular.module('bbw.sponsor-index-controller', ['ionic', 'core-all'])

    // A simple controller that fetches a list of data from a service
    .controller('SponsorIndexCtrl', [
        '$scope', '$ionicModal', '$ionicLoading', '$timeout', 'LoaderService', 'SponsorsService', function($scope, $ionicModal, $ionicLoading, $timeout, LoaderService, SponsorsService) {
            $scope.initialized = false;
            $scope.sponsorInitialized = true;

            $scope.data = {
                isLoading: false
            };

            // Load the modal from the given template URL
            $ionicModal.fromTemplateUrl('templates/sponsor-detail-modal.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $scope.modalSponsor = modal;
            });

            $scope.openSponsorModal = function(sponsorId) {
                SponsorsService.get(sponsorId).then(function(sponsor) {
                    $scope.sponsor = sponsor;
                    $scope.modalSponsor.show();
                });
            };

            $scope.closeSponsorModal = function() {
                $scope.modalSponsor.hide();
            };

            $scope.refreshContent = function() {
                // update content
                getSponsorData(true);

                // Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
                $scope.$apply();
            };

            $scope.showLoading = function(text) {
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

                $scope.loadingText = text;
                $scope.data.isLoading = true;
            };

            $scope.hideLoading = function() {
                $ionicLoading.hide();
                $scope.data.isLoading = false;
            };

            var getSponsorData = function(force) {

                $scope.showLoading('Retrieving Sponsor List');

                SponsorsService.all(force).then(function(sponsors) {
                    $scope.sponsors = sponsors;
                    $scope.levels = SponsorsService.getLevels();

                    // Hide overlay when done
                    $scope.hideLoading();
                    $scope.initialized = true;
                });
            };

            $timeout(function() {
                getSponsorData(false);
            }, 100);
        }
    ]);
})();