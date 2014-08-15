(function() {
    'use strict';

    angular
        .module('bbw.about-controller', ['ionic', 'core-all'])
        .controller('AboutCtrl', AboutCtrl);

    AboutCtrl.$inject = ['$scope', '$log', '$ionicModal', 'AppSettings'];
    
    function AboutCtrl($scope, $log, $ionicModal, AppSettings) {
        var modals = {};
        var vm = $scope;

        vm.allowConfiguration = AppSettings.allowConfiguration;
        vm.initialized = false;

        vm.openSettingsModal = function () { modals.modalSettings.show(); };
        vm.closeSettingsModal = function () { modals.modalSettings.hide(); };

        activate();

        /////////////////////////////////
        function activate() {
            setupModals();
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