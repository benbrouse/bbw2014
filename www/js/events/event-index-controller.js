angular.module('bbw.event-index-controller', ['ionic'])

// A simple controller that fetches a list of data from a service
.controller('EventIndexCtrl', ['$scope', '$log', '$filter', '$ionicModal', 'LoaderService', 'EventsService', function($scope, $log, $filter, $ionicModal, LoaderService, EventsService) {
    $scope.initialized = false;

    // Load the modal from the given template URL
    $ionicModal.fromTemplateUrl('templates/event-filter.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });

    $scope.toggle = function() {
        //alert('Test');
    };

    $scope.openModal = function() {
        $scope.modal.show();
    };

    $scope.closeModal = function() {
        $scope.modal.hide();
    };

    //Be sure to cleanup the modal
    $scope.$on('$destroy', function() {
        $scope.modal.remove();
    });

    // Show loader from service
    LoaderService.show('Retrieving Event List');

    EventsService.all().then(function(events) {
        $scope.events = events;

        // retrieve the list of unique dates for the events,    NOTE: these should be sorted at this point also
        EventsService.getEventDates($scope.events).then(function(eventDates) {
            $scope.eventDates = _.map(eventDates, function(date) {
                return { date: date, selected: true };
            });

            $scope.selection = [];

            $scope.$watch('eventDates|filter:{selected:true}', function(nv) {
                $scope.selection = nv.map(function(date) {
                    return date.date;
                });
            }, true);

            // Hide overlay when done
            LoaderService.hide();
            $scope.initialized = true;
        }, function (reason) {
            // could not get the list of event dates
            $log.write(reason);
        });
    }, function (reason) {
        // could not get the list of events
        $log.write(reason);
    });

}]);
