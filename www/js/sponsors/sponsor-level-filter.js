(function() {
    'use strict';

    /**
     * Converts sponsor level to a human readable version
     */
    angular.module('bbw.sponsor-level-filter', []).filter('sponsorLevel', [
        function() {

            return function(item) {
                if (!angular.isNumber(item)) {
                    return item;
                }

                switch (item) {
                case 0:
                    item = "Flagship Sponsor";
                    break;

                case 1:
                    item = "Gold Sponsor";
                    break;

                case 2:
                    item = "Silver Sponsor";
                    break;

                case 3:
                    item = "Bronze Sponsor";
                    break;

                case 4:
                    item = "Featured Sponsor";
                    break;

                default:
                    item = "Unknown Sponsor";
                    break;
                }

                return item;
            };
        }
    ]);
})();