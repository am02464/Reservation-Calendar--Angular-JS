calendarModule.controller("ReservationController", [
  "$scope",
  "calendarService",
  function($scope, calendarService) {
    $scope.isModalShow = false;
    $scope.selectedDate = null;
    $scope.tennantName = "";
    $scope.error;

    function resetScope() {
      console.log("reset");
      $scope.selectedDate = null;
      $scope.tennantName = "";
      $scope.error = "";
    }

    $scope.$on("DateSelected", function(e, selectedDate) {
      $scope.selectedDate = selectedDate;
      $scope.showModal();
    });

    $scope.showModal = function() {
      $scope.isModalShow = true;
    };

    $scope.closeModal = function() {
      resetScope();
      $scope.isModalShow = false;
    };

    $scope.createTennant = function() {
      console.log($scope.selectedDate.timeStamp);
      calendarService.updateTennant(
        {
          tennantName: $scope.tennantName,
          time: $scope.selectedDate.timeStamp,
          reserved: true
        },
        () => {
          $scope.closeModal();
        },
        err => {
          $scope.error = err;
        }
      );
    };

    $scope.removeTennant = function() {
      console.log($scope.selectedDate.timeStamp);
      calendarService.updateTennant(
        {
          tennantName: $scope.tennantName,
          time: $scope.selectedDate.timeStamp,
          reserved: false
        },
        () => {
          $scope.closeModal();
        },
        err => {
          $scope.error = err;
        }
      );
    };
  }
]);
