angular.module('core.app-settings', []).factory('AppSettings', [function () {

    return {
        cacheMaxAge: 900000,                    // Items added will expire after 15 minutes.
        cacheFlushInterval: 3600000,            // clear after every hour.
        url: 'http://localhost:54644/api/'
    };
}]);