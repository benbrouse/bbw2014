(function () {
    'use strict';

    angular
        .module('core.toast-service', [])
        .factory('ToastService', ToastService);

    ToastService.$inject = [];

    function ToastService() {

        return {
            show: function (text) {
                if (!angular.isUndefined(window.plugins) && !angular.isUndefined(window.plugins.toast)) {

//                    window.plugins.toast.showShortTop('Hello there!', function (a) { console.log('toast success: ' + a) }, function (b) { alert('toast error: ' + b) })
                    window.plugins.toast.showShortCenter(text);
                }
            }
        };
    }
})();