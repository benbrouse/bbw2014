angular.module('about', [
                          'bbw.about-controller'
]);

angular.module('events', [
                          'bbw.event-service',
                          'bbw.event-index-controller',
                          'bbw.eventDateSelectedFilter',
                          'bbw.eventFavoriteFilter'
]);


angular.module('sponsors', [
                            'bbw.sponsor-service',
                            'bbw.sponsor-index-controller',
                            'bbw.sponsor-detail-controller',
                            'bbw.sponsor-level-filter'
]);

angular.module('bbw-depends', ['about', 'events', 'sponsors']);
