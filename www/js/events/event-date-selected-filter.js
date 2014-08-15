(function () {
    'use strict';

    angular
        .module('bbw.eventDateSelectedFilter', [])
        .filter('eventDateSelected', EventDateSelected);

    EventDateSelected.$inject = ['$parse'];
    
    function EventDateSelected($parse) {

        return function (items, filterOn, selectedDates) {
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

                    angular.forEach(selectedDates, function(selectedDate) {
                        if (isSameDate(itemDate, selectedDate)) {
                            newItems.push(item);
                        }
                    });
                });

                items = newItems;
            }

            return items;
        };
    }
})();