(function() {
    'use strict';

    /**
     */
    angular
        .module('core.matchesStringFilter', [])
        .filter('matchesString', MatchesStringFilter);

    MatchesStringFilter.$inject = ['$parse'];
    
    function MatchesStringFilter($parse) {

        return function(items, filterOn, strToMatch) {

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
                    if (isSame(itemString, strToMatch)) {
                        newItems.push(item);
                    }
                });

                items = newItems;
            }
            return items;
        };
    }
})();