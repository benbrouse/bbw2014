(function() {
    'use strict';

    angular.module('core.resizeDirective', [])
        .directive('resizeToparent', function($timeout) {
            return {
                restrict: 'A',
                link: function(scope, element) {
                    console.log('nothing yet');
                }
            };
        });
})();