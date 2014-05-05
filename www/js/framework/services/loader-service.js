angular.module('core.loader-service', [])
.factory('LoaderService', ['$rootScope', '$ionicLoading', function ($rootScope, $ionicLoading) {

    // Trigger the loading indicator
    return {
        show: function(text) { //code from the ionic framework doc

            // Show the loading overlay and text
            $rootScope.loading = $ionicLoading.show({
                // The text to display in the loading indicator
                template: text
            });
        },
        hide: function() {
            $ionicLoading.hide();
        }
    };
}]);