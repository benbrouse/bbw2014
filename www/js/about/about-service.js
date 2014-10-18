(function () {
    'use strict';

    angular
        .module('bbw.about-service', ['ngResource', 'core-services', 'jmdobry.angular-cache'])
        .factory('AboutService', AboutService);

    AboutService.$inject = ['$q', '$timeout', '$log', '$resource', 'CachingDataService', 'AppSettings'];

    function AboutService($q, $timeout, $log, $resource, CachingDataService, AppSettings) {
        var cacheNameData = 'aboutDataCache';
        var dataUrl = AppSettings.url + 'content/:id';

        setup();

        function setup() {
            CachingDataService.setup(cacheNameData);
        }

        // returns a promise for the specified cachekey
        var retrieveAll = function (force) {
            var deferred = $q.defer();

            var cacheKey = 'about';
            var updateifOlderThanHours = 4;

            CachingDataService.all(cacheKey, dataUrl, force, updateifOlderThanHours).then(function(data) {
                deferred.resolve(data);
            }, function(errResponse) {
                deferred.reject(errResponse);
            });

            return deferred.promise;
        };

        var retrieveSummary = function () {
            var deferred = $q.defer();

            CachingDataService.retrieveById(dataUrl, 'about-summary', false).then(function (data) {
                deferred.resolve(data);
            }, function (errResponse) {
                deferred.reject(errResponse);
            });

            return deferred.promise;
        };

        return {
            all: retrieveAll,
            summary: retrieveSummary
        };
    }
})();
