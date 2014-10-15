(function () {
    'use strict';

    angular
        .module('core.resizeWidthDirective', [])
        .directive('resizewidth', function ($timeout) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    //var width = 0;

                    //// the 1st element is the total size, subsequent elements will be subtracted from this size
                    ////
                    ////  NOTE: usage:  
                    //// <leaflet ng-if="showEventMap" 
                    ////     resizetoparent resize-parameters="event-detail-modal;event-detail-modal-header" 
                    ////     markers="markers" center="center" layers="layers">
                    //// </leaflet>

                    //var elements = attrs.resizeParameters.split(';');

                    //_.forEach(elements, function (elementId, i) {
                    //    if (i == 0) {
                    //        width = angular.element(document.getElementById(elementId))[0].clientWidth;
                    //    } else {
                    //        var targetElement = angular.element(document.getElementById(elementId))[1];
                    //        element.css('width', width + 'px');

                    //    }
                    //});

                }
            };
        });
})();