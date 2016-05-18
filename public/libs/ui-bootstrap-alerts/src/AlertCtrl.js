angular.module('ui.bootstrap.alerts')
.controller('alertCtrl', ['$scope', '$attrs', 'alertService', function($scope, $attrs, alertService){

  $scope.alertContext = $attrs.context || 'general';

  $scope.alertClassFor = function(alert){
    var classes = [];
    switch (alert.type) {
      case 'warning':
        // no special class
        break;
      case 'success':
        classes.push('alert-success');
        break;
      case 'info':
        classes.push('alert-info');
        break;
      case 'error':
        classes.push('alert-danger');
        break;
      case 'danger':
        classes.push('alert-danger');
        break;
    }
    return classes.join(" ");
  };

  $scope.remove = function(alert){
    alertService.context($scope.alertContext).remove(alert);
  };

  $scope.$watch( function () { return alertService.context($scope.alertContext).getAllalerts(); }, function (alerts) {
    $scope.alerts = alerts;
    $scope.anyalerts = $scope.alerts.length > 0;
  }, true);
}]);
