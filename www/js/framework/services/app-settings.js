angular.module('core.app-settings', []).factory('AppSettings', [function () {

    return {
        useMockData: true,
        cacheMaxAge: null,                   
        cacheFlushInterval: null,           
        url: 'http://localhost:54644/api/'
    };
}]);