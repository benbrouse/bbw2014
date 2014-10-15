(function() {
    'use strict';

    angular
        .module('core.app-settings', [])
        .factory('AppSettings', AppSettings);
    
    function AppSettings() {

        return {
            allowConfiguration: false,
            allowFavorites: true,
            cacheMaxAge: null,
            cacheFlushInterval: null,
            //url: 'http://localhost:54644/api/'
            url: 'http://bbw14.azurewebsites.net/api/',
            versionCode: 100
        };
    }
})();