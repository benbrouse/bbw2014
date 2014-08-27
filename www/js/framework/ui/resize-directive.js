(function() {
    'use strict';

    angular
        .module('core.resizeDirective', [])
        .directive('resizetoparent', function($timeout) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    var height = 0;

                    // the 1st element is the total size, subsequent elements will be subtracted from this size
                    //
                    //  NOTE: usage:  
                    // <leaflet ng-if="showEventMap" 
                    //     resizetoparent resize-parameters="event-detail-modal;event-detail-modal-header" 
                    //     markers="markers" center="center" layers="layers">
                    // </leaflet>

                    var elements = attrs.resizeParameters.split(';');
                    _.forEach(elements, function (elementId, i) {
                        var elementSize = angular.element(document.getElementById(elementId))[0].clientHeight;

                        if (i === 0) {
                            height = elementSize;
                        } else {
                            height -= elementSize;
                        }
                    });

                    element.css('height', height + 'px');
                }
            };
        });
})();