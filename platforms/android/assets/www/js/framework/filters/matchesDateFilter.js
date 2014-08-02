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
angular.module('core.matchesDateFilter', []).filter('matchesDate', ['$parse', function ($parse) {

    return function (items, filterOn, dateToMatch) {

        if (filterOn === false) {
            return items;
        }

        if ((filterOn || angular.isUndefined(filterOn)) && angular.isArray(items)) {
            var newItems = [],
              get = angular.isString(filterOn) ? $parse(filterOn) : function (item) { return item; };

            var extractValueToCompare = function (item) {
                return angular.isObject(item) ? get(item) : item;
            };

            var isSameDate = function (date1, date2) {
                var convertDate1 = new Date(date1);
                convertDate1.setHours(0, 0, 0, 0);

                var convertDate2 = new Date(date2);
                convertDate2.setHours(0, 0, 0, 0);

                return angular.equals(convertDate1, convertDate2);
            };

            angular.forEach(items, function (item) {
                var itemDate = extractValueToCompare(item);
                if (isSameDate(itemDate, dateToMatch)) {
                    newItems.push(item);
                }
            });

            items = newItems;
        }
        return items;
    };
}]);