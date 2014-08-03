'use strict';

/**
 * Intended to be chained after the currency filter.    If there is no cost,
   output the text whatever is passed
 */
angular.module('core.costFilter', []).filter('costnone', ['$injector', function ($injector) {

    return function (items, defaultText) {
        if (angular.isString(items)) {
            var $filter = $injector.get('$filter');
            var currencyFilter = $filter('currency');

            var nothing = currencyFilter(0);
            var fixPrice = currencyFilter(-1);

            if (angular.equals(items, nothing)) {
                if(angular.isUndefined(defaultText)) {
                    defaultText = "Free";
                }

                items = defaultText;
            }

            if (angular.equals(items, fixPrice)) {
                items = "Fixed Price";
            }

        } else {
            // we are forcing this to be an error
            items = undefined;
        }

        return items;
    };
}]);