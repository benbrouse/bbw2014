'use strict';

describe('mocking the event index controller', function () {

    beforeEach(module('bbw.event-index-controller'));

    var scope, events, filter, log, mockEventsService, mockLoaderService, mockIonicModal, controller, q, deferred, timeout;

    // setup mocks to test the controller
    beforeEach(function () {
        mockLoaderService = {
            show: function() {
               // noop; 
            },

            hide: function() {
                // noop;
            }
        };

        spyOn(mockLoaderService, "show").andCallThrough();
        spyOn(mockLoaderService, "hide").andCallThrough();

        mockEventsService = {
            all: function () {
                deferred = q.defer();

                events = [
                   { id: 0, title: 'Event 0', date: '2014-10-10T20:44:55', cost: 9.99, description: 'Description 1.', location: { name: 'Metropolitan', address: '902 S Charles St, Baltimore, MD 21230', image: 'img/temp/HS_logo_sl.png' } },
                   { id: 15, title: 'Event 15', date: '2014-10-10T21:44:55', cost: 20, description: 'Description 1.', location: { name: 'Max\'s Taphouse', address: '737 S Broadway, Baltimore, MD 21231', image: 'img/temp/Maxs_New_sl.png' } },
                   { id: 1, title: 'Event 1', date: '2014-10-10T20:44:55', cost: 0, description: 'Description 2', location: { name: 'Metropolitan', address: '902 S Charles St, Baltimore, MD 21230', image: 'img/temp/metro_logo_sl.png' } },
                   { id: 2, title: 'Event 2', date: '2014-10-11T20:44:55', cost: 0, description: 'Description 3', location: { name: 'Metropolitan', address: '902 S Charles St, Baltimore, MD 21230', image: 'img/temp/metro_logo_sl.png' } },
                   { id: 3, title: 'Event 3', date: '2014-10-11T20:44:55', cost: 0, description: 'Description 3', location: { name: 'Metropolitan', address: '902 S Charles St, Baltimore, MD 21230', image: 'img/temp/metro_logo_sl.png' } },
                   { id: 5, title: 'Event 5', date: '2014-10-14T20:44:55', cost: 0, description: 'Description 3', location: { name: 'Metropolitan', address: '902 S Charles St, Baltimore, MD 21230', image: 'img/temp/metro_logo_sl.png' } },
                   { id: 6, title: 'Event 6', date: '2014-10-14T20:44:55', cost: 0, description: 'Description 3', location: { name: 'Metropolitan', address: '902 S Charles St, Baltimore, MD 21230', image: 'img/temp/metro_logo_sl.png' } },
                   { id: 7, title: 'Event 7', date: '2014-10-15T20:44:55', cost: 0, description: 'Description 3', location: { name: 'Metropolitan', address: '902 S Charles St, Baltimore, MD 21230', image: 'img/temp/metro_logo_sl.png' } },
                   { id: 8, title: 'Event 8', date: '2014-10-17T20:44:55', cost: 0, description: 'Description 3', location: { name: 'Metropolitan', address: '902 S Charles St, Baltimore, MD 21230', image: 'img/temp/metro_logo_sl.png' } },
                   { id: 9, title: 'Event 9', date: '2014-10-17T20:44:55', cost: 0, description: 'Description 3', location: { name: 'Metropolitan', address: '902 S Charles St, Baltimore, MD 21230', image: 'img/temp/metro_logo_sl.png' } },
                   { id: 10, title: 'Event 10', date: '2014-10-19T20:44:55', cost: 0, description: 'Description 3', location: { name: 'Metropolitan', address: '902 S Charles St, Baltimore, MD 21230', image: 'img/temp/metro_logo_sl.png' } },
                   { id: 11, title: 'Event 11', date: '2014-10-19T20:44:55', cost: 0, description: 'Description 3', location: { name: 'Metropolitan', address: '902 S Charles St, Baltimore, MD 21230', image: 'img/temp/metro_logo_sl.png' } },
                   { id: 12, title: 'Event 12', date: '2014-10-20T20:44:55', cost: 0, description: 'Description 3', location: { name: 'Metropolitan', address: '902 S Charles St, Baltimore, MD 21230', image: 'img/temp/metro_logo_sl.png' } },
                   { id: 13, title: 'Event 13', date: '2014-10-20T20:44:55', cost: 0, description: 'Description 3', location: { name: 'Metropolitan', address: '902 S Charles St, Baltimore, MD 21230', image: 'img/temp/metro_logo_sl.png' } },
                   { id: 14, title: 'Event 14', date: '2014-10-20T20:44:55', cost: 0, description: 'Description 4', location: { name: 'Metropolitan', address: '902 S Charles St, Baltimore, MD 21230', image: 'img/temp/metro_logo_sl.png' } },
                   { id: 4, title: 'Event 4', date: '2014-10-12T20:44:55', cost: 0, description: 'Description 3', location: { name: 'Metropolitan', address: '902 S Charles St, Baltimore, MD 21230', image: 'img/temp/metro_logo_sl.png' } }
                ];

                // Place the fake return object here
                deferred.resolve(events);
                return deferred.promise;
            },

            getEventDates: function(events) {
                deferred = q.defer();

                deferred.resolve(['2014-10-10T20:44:55']);
                return deferred.promise;
            }
        };

        spyOn(mockEventsService, 'all').andCallThrough();
        spyOn(mockEventsService, 'getEventDates').andCallThrough();

        mockIonicModal = {
            fromTemplateUrl: function(url, func) {
                // do nothing
            }
        };
    });

    //Inject fake factory into controller
    beforeEach(inject(function ($rootScope, $controller, $q, $timeout, $filter, $log) {
        scope = $rootScope.$new();
        q = $q;
        log = $log;
        filter = $filter;
        timeout = $timeout;
        controller = $controller('EventIndexCtrl', { $scope: scope, $log: log, $filter: filter, $ionicModal: mockIonicModal, LoaderService: mockLoaderService, EventsService: mockEventsService });
    }));

    it('Ensure that the initialized flag is not set by default', function () {
        expect(scope.initialized).toBe(false);
    });

    it('The events object is not defined yet', function () {
        // Before $apply is called the promise hasn't resolved
        expect(scope.events).not.toBeDefined();
    });

    it('Applying the scope causes the events service to be invoked', function () {
        // This propagates the changes to the models
        // This happens itself when you're on a web page, but not in a unit test framework
        scope.$apply();
        expect(mockEventsService.all).toHaveBeenCalled();
        expect(mockEventsService.getEventDates).toHaveBeenCalled();
        expect(mockEventsService.getEventDates).toHaveBeenCalledWith(events);

        expect(scope.eventDates).toBeDefined();

        // based on the mock data, this would be the expected result
        expect(scope.eventDates.length).toBe(1);
    });

    it('Applying the scope causes the events object to be defined', function () {
        // This propagates the changes to the models
        // This happens itself when you're on a web page, but not in a unit test framework
        scope.$apply();
        expect(scope.events).toBeDefined();
    });

    it('Ensure that the loader service show was invoked', function () {
        scope.$apply();
        expect(mockLoaderService.show).toHaveBeenCalled();
    });

    it('Ensure that the loader service hide was invoked', function () {
        scope.$apply();
        expect(mockLoaderService.hide).toHaveBeenCalled();
    });

    it('Ensure that the initialized flag was set', function () {
        scope.$apply();
        expect(scope.initialized).toBe(true);
    });

    it('Ensure that nothing is selected initially.', function () {
        scope.$apply();
        expect(scope.selection).toBeDefined();
    });
});