calendarModule.controller("CalendarController", [
  "$scope",
  "calendarService",
  function($scope, calendarService) {
    $scope.calendar = calendarService.calendar;

    $scope.navigateToNextMonth = function() {
      calendarService.navigateToNextMonth();
    };

    $scope.navigateToPrevMonth = function() {
      calendarService.navigateToPrevMonth();
    };

    $scope.reserve = function(e, dateObj) {
      $scope.$broadcast("DateSelected", dateObj);
    };
  }
]);
