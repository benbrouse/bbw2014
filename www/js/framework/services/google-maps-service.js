(function() {
    'use strict';

    /*
        core service to wrap the google.maps global object
    */

    angular.module('core.google-maps-service', [])
        .service('GoogleMapsService', function() {
            return {
                gmaps: google.maps
            };
        });
})();