﻿angular.module('core-services', [
                            'core.app-settings',
                            'core.address-service',
                            'core.loader-service',
                            'core.google-maps-service',
                            'core.distance-service',
                            'core.date-utils'
]);

angular.module('core-filters', [
                            'core.costFilter',
                            'core.matchesDateFilter',
                            'core.matchesStringFilter',
                            'core.telephoneFilter',
                            'core.excludeFilter',
                            'core.uniqueFilter'
]);

angular.module('core-ui', [
                            'core.resizeDirective',
                            'core.resizeWidthDirective',
                            'core.markdown-directive',
                            'core.toast-service'
]);


angular.module('core-all', [
                            'core-services',
                            'core-filters',
                            'core-ui'
]);