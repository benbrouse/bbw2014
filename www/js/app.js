(function() {
    'use strict';

    // the main app definition
    var app = angular.module('bbw', ['ionic', 'google-maps', 'core-all', 'bbw-depends']);

    app.config(function($stateProvider, $urlRouterProvider) {


        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        $stateProvider
            // setup an abstract state for the tabs directive
            .state('tab', {
                url: "/tab",
                abstract: true,
                templateUrl: "templates/tabs.html"
            })
            .state('tab.event-index', {
                url: '/events',
                views: {
                    'events-tab': {
                        templateUrl: 'templates/event-index.html',
                        controller: 'EventIndexCtrl'
                    }
                }
            })
            .state('tab.event-detail', {
                url: '/event/:eventId',
                views: {
                    'events-tab': {
                        templateUrl: 'templates/event-detail.html',
                        controller: 'EventDetailCtrl'
                    }
                }
            })
            .state('tab.sponsor-index', {
                url: '/sponsors',
                views: {
                    'sponsors-tab': {
                        templateUrl: 'templates/sponsor-index.html',
                        controller: 'SponsorIndexCtrl'
                    }
                }
            })
            .state('tab.sponsor-detail', {
                url: '/sponsor/:sponsorId',
                views: {
                    'sponsors-tab': {
                        templateUrl: 'templates/sponsor-detail.html',
                        controller: 'SponsorDetailCtrl'
                    }
                }
            })
            .state('tab.contact', {
                url: '/contact',
                views: {
                    'contact-tab': {
                        templateUrl: 'templates/contact.html'
                    }
                }
            })
            .state('tab.about', {
                url: '/about',
                views: {
                    'about-tab': {
                        templateUrl: 'templates/about.html',
                        controller: 'AboutCtrl'
                    }
                }
            })
            .state('tab.openingtap', {
                url: '/opening-tap',
                views: {
                    'about-tab': {
                        templateUrl: 'templates/opening-tap.html'
                    }
                }
            });

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/tab/about');
    });

    app.run(function($rootScope) {
        $rootScope.applicationName = "Baltimore Beer Week 2014";
    });
})();
