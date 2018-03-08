app.controller('DescriptionModalInstanceCtrl', ['$scope', '$modalInstance', 'items', function ($scope, $modalInstance, items) {
        $scope.items = items;

        console.log($scope.productDescriptions);
        $scope.selected = {
            item: $scope.items[0]
        };

        $scope.ok = function () {
            $modalInstance.close($scope.selected.item);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);

app.factory('ModalData', function () {
    return {productDescriptions: ''};
});
  