(function () {
    'use strict';
    /*
        core service to work with dates
    */
    angular
        .module('core.date-utils', [])
        .factory('DateUtils', DateUtils);

    DateUtils.$inject = [];

    function DateUtils() {
        function isSameDate(date1, date2) {
            var convertDate1 = new Date(date1);
            convertDate1.setHours(0, 0, 0, 0);

            var convertDate2 = new Date(date2);
            convertDate2.setHours(0, 0, 0, 0);

            return angular.equals(convertDate1, convertDate2);
        }

        return {
            isSameDate: isSameDate
        };
    }
})();
