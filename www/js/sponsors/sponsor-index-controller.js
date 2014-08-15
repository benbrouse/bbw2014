(function() {
    'use strict';

    angular
        .module('bbw.sponsor-index-controller', ['ionic', 'core-all'])
        .controller('SponsorIndexCtrl', SponsorIndexCtrl);

    SponsorIndexCtrl.$inject = ['$scope', '$ionicModal', '$ionicLoading', '$timeout', 'LoaderService', 'SponsorsService'];
    
    function SponsorIndexCtrl($scope, $ionicModal, $ionicLoading, $timeout, LoaderService, SponsorsService) {
        var vm = $scope;

        vm.initialized = false;
        vm.data = { isLoading: false };
        vm.refreshContent = refreshContent;
        vm.sponsorInitialized = true;

        initialize();
        activate();

        ///////////////////////////
        function activate() {
            $timeout(function () {
                getSponsorData(false);
            }, 100);
        }

        function initialize() {
            // Load the modal from the given template URL
            $ionicModal.fromTemplateUrl('templates/sponsor-detail-modal.html', {
                scope: vm,
                animation: 'slide-in-up'
            }).then(function (modal) {
                vm.modalSponsor = modal;
            });
        }

        ////////////////////////////

        //function closeSponsorModal() {
        //    vm.modalSponsor.hide();
        //};

        //function openSponsorModal(sponsorId) {
        //    SponsorsService.get(sponsorId).then(function(sponsor) {
        //        vm.sponsor = sponsor;
        //        vm.modalSponsor.show();
        //    });
        //};

        function getSponsorData(force) {

            showLoading('Retrieving Sponsor List');

            SponsorsService.all(force).then(function (sponsors) {
                vm.sponsors = sponsors;
                vm.levels = SponsorsService.getLevels();

                // Hide overlay when done
                hideLoading();
                vm.initialized = true;
            });
        };

        function hideLoading() {
            $ionicLoading.hide();
            vm.data.isLoading = false;
        };

        function refreshContent() {
            // update content
            getSponsorData(true);

            // Stop the ion-refresher from spinning
            vm.$broadcast('scroll.refreshComplete');
            vm.$apply();
        };

        function showLoading (text) {
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
    }
})();