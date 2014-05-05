angular.module('events', [
                          'bbw.event-service',
                          'bbw.event-index-controller',
                          'bbw.event-detail-controller',
                          'bbw.eventDateSelectedFilter'
]);


angular.module('sponsors', [
                            'bbw.sponsor-service',
                            'bbw.sponsor-index-controller',
                            'bbw.sponsor-detail-controller',
                            'bbw.sponsor-level-filter'
]);

angular.module('bbw-depends', ['events', 'sponsors']);
