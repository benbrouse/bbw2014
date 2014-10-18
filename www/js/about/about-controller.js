(function() {
    'use strict';

    angular
        .module('bbw.about-controller', ['ionic', 'core-all'])
        .controller('AboutCtrl', AboutCtrl);

    AboutCtrl.$inject = ['$scope', '$log', '$ionicModal', '$timeout', '$document', 'AboutService', 'AppSettings'];
    
    function AboutCtrl($scope, $log, $ionicModal, $timeout, $document, AboutService, AppSettings) {
        var modals = {};
        var vm = $scope;

        vm.allowConfiguration = AppSettings.allowConfiguration;
        vm.initialized = false;
        vm.summaryText = "";
        vm.summaryTitle = "The 6th Annual Baltimore Beer Week";
        vm.summaryDates = "October 10 - 19, 2014";

        vm.openSettingsModal = function () { modals.modalSettings.show(); };
        vm.closeSettingsModal = function () { modals.modalSettings.hide(); };

        activate();

        /////////////////////////////////
        function activate() {
            setupModals();

            AboutService.all(true).then(function() {
                $log.log('done');
            });

            AboutService.summary(true, 'about-summary').then(function (entity) {
                $log.log(entity);
                vm.summaryText = entity.data;
            });
        }

        function setupModals() {
            // Load the modal from the given template URL
            $ionicModal.fromTemplateUrl('templates/about-settings-modal.html', {
                scope: vm,
                animation: 'slide-in-up'
            }).then(function (modal) {
                modals.modalSettings = modal;
            });

            //Be sure to cleanup the modal
            vm.$on('$destroy', function () {
                modals.modalSettings.remove();
            });
        }
    }
})();