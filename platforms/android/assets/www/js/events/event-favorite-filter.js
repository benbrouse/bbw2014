﻿'use strict';

/**

 */
angular.module('bbw.eventFavoriteFilter', []).filter('eventIsFavorite', ['$parse', 'EventsService', function ($parse, EventsService) {

    return function (items, favoritesOnly) {
        if (angular.isArray(items)) {
            var newItems = [];

            angular.forEach(items, function (item) {
                if (!favoritesOnly) {
                    newItems.push(item);
                } else {
                    var isFavorite = EventsService.isFavorite(item.id);
                    if (isFavorite) {
                        newItems.push(item);
                    }
                }
            });

            items = newItems;
        }

        return items;
    };
}]);