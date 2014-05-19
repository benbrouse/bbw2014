angular.module('core-services', [
                            'core.address-service',
                            'core.loader-service',
                            'core.google-maps-service'
]);

angular.module('core-filters', [
                            'core.costFilter',
                            'core.matchesDateFilter',
                            'core.matchesStringFilter',
                            'core.excludeFilter',
                            'core.uniqueFilter'
]);

angular.module('core-all', [
                            'core-services',
                            'core-filters'
]);