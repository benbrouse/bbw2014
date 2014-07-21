angular.module('core-services', [
                            'core.app-settings',
                            'core.address-service',
                            'core.loader-service',
                            'core.google-maps-service',
                            'core.distance-service'
]);

angular.module('core-filters', [
                            'core.costFilter',
                            'core.matchesDateFilter',
                            'core.matchesStringFilter',
                            'core.telephoneFilter',
                            'core.excludeFilter',
                            'core.uniqueFilter'
]);

angular.module('core-all', [
                            'core-services',
                            'core-filters'
]);