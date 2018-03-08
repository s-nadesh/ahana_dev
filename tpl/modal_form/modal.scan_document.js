app.controller('ScandocumentModalInstanceCtrl', ['scope', '$scope', '$modalInstance', '$rootScope', '$timeout', '$http', function (scope, $scope, $modalInstance, $rootScope, $timeout, $http) {

        $scope.scan_document = scope.scan_document;

        $scope.singleFileDownload = function (value) {
            var link = document.createElement('a');
            link.href = 'data:' + value.data.file_type + ';base64,' + value.file;
            link.download = value.data.file_org_name;
            document.body.appendChild(link);
            link.click();
            $timeout(function () {
                document.body.removeChild(link);
            }, 1000);
        };

        $scope.MultipleFileDownload = function () {
            var zip = new JSZip();
            angular.forEach($scope.scan_document, function (resp) {
                zip.add(resp.data.file_org_name, resp.file, {base64: true})
            });
            content = zip.generate();
            location.href = "data:application/zip;base64," + content;
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);
  