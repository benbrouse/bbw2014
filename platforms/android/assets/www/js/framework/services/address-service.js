/*
    core service to perform address lookups
*/
angular.module('core.address-service', ['core.google-maps-service'])
.factory('AddressService', ['$q', function ($q) {
    var geocodeAddress = function(address) {
        var deferred = $q.defer();

        if (!angular.isUndefined(address)) {
            var geocoder = new google.maps.Geocoder();

            geocoder.geocode({ 'address': address }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    deferred.resolve(results[0].geometry.location);
                } else {
                    deferred.reject("Geocode was not successful for the following reason: " + status);
                }
            });
        } else {
            deferred.reject("The address was not in the correct format.");
        }

        return deferred.promise;
    };

    return {
        geocode: geocodeAddress
    };
}]);
