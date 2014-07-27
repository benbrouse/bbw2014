angular.module('core.app-settings', []).factory('AppSettings', [function () {

    return {
        useMockData: false,
        cacheMaxAge: null,                   
        cacheFlushInterval: null,           
        //  url: 'http://localhost:54644/api/'
        url: 'http://bbw14.azurewebsites.net/api/'
    };
}]);