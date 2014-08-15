(function() {
    'use strict';

    /**
     * This was taken from the project: http://angular-ui.github.io/ui-utils
     *
     * Filters out all duplicate items from an array by checking the specified key
     * @param [key] {string} the name of the attribute of each object to compare for uniqueness
     if the key is empty, the entire object will be compared
     if the key === false then no filtering will be performed
     * @return {array}
     */
    angular
        .module('core.excludeFilter', [])
        .filter('exclude', ExcludeFilter);

    ExcludeFilter.$inject = ['$parse'];
    
    function ExcludeFilter($parse) {

        return function(items, filterOn, valueToMatch) {

            if (filterOn === false) {
                return items;
            }

            if ((filterOn || angular.isUndefined(filterOn)) && angular.isArray(items)) {
                var newItems = [],
                    get = angular.isString(filterOn) ? $parse(filterOn) : function(item) { return item; };

                var extractValueToCompare = function(item) {
                    return angular.isObject(item) ? get(item) : item;
                };

                var isSame = function(s1, s2) {
                    return angular.equals(s1, s2);
                };

                angular.forEach(items, function(item) {
                    var itemString = extractValueToCompare(item);
                    if (!isSame(itemString, valueToMatch)) {
                        newItems.push(item);
                    }
                });

                items = newItems;
            }
            return items;
        };
    }
})();