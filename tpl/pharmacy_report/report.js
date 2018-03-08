app.controller('reportController', ['$rootScope', '$scope', '$timeout', '$http', '$state', 'editableOptions', 'editableThemes', '$anchorScroll', '$filter', '$timeout', function ($rootScope, $scope, $timeout, $http, $state, editableOptions, editableThemes, $anchorScroll, $filter, $timeout) {

        editableThemes.bs3.inputClass = 'input-sm';
        editableThemes.bs3.buttonsClass = 'btn-sm';
        editableOptions.theme = 'bs3';

        $scope.showTable = false;

        $scope.data = {};

        $scope.exportAction = function (export_action) {
            switch (export_action) {
                case 'pdf':
                    $scope.$broadcast('export-pdf', {});
                    break;
                case 'excel':
                    $scope.$broadcast('export-excel', {});
                    break;
                case 'doc':
                    $scope.$broadcast('export-doc', {});
                    break;
                case 'png':
                    $scope.$broadcast('export-png', {});
                    break;
                case 'powerpoint':
                    $scope.$broadcast('export-powerpoint', {});
                    break;
                default:
                    console.log('no event caught');
            }

        }

        $scope.initReport = function () {
            $scope.mode = $state.params.mode;
            $scope.show_search = true;
            $scope.show_search_consultant = false;
            $scope.data.from = moment().subtract(1, 'months').format('YYYY-MM-DD');
            $scope.data.to = moment().format('YYYY-MM-DD');
            $scope.fromMaxDate = new Date($scope.data.to);
            $scope.toMinDate = new Date($scope.data.from);


            if ($scope.mode == 'purchase') {
                $scope.report_title = 'Purchase Report';
                $scope.url = '/pharmacyreport/purchasereport?addtfields=purchasereport';
            } else if ($scope.mode == 'sale') {
                $scope.show_search_consultant = true;
                $scope.report_title = 'Sale Report';
                $scope.url = '/pharmacyreport/salereport';

                $rootScope.commonService.GetDoctorList('', '1', false, '1', function (response) {
                    $scope.doctors = response.doctorsList;
                });
            } else if ($scope.mode == 'stock') {
                $scope.show_search = false;
                $scope.report_title = 'Stock Report';
                $scope.url = '/pharmacyreport/stockreport';
                $scope.loadReport();
            } else if ($scope.mode == 'purchasevat') {
                $scope.report_title = 'Purchase Vat Report';
                $scope.url = '/pharmacyreport/purchasereport?addtfields=purchasevatreport';
            }

        }

        $scope.parseFloat = function (row) {
            return parseFloat(row);
        }

        //Index Page
        $scope.loadReport = function () {
            $scope.loadbar('show');
            $scope.showTable = true;

            $scope.errorData = "";
            $scope.msg.successMessage = "";

            var data = {};
            $scope.purchase = {};

            if (typeof $scope.data.from !== 'undefined' && $scope.data.from != '')
                angular.extend(data, {from: moment($scope.data.from).format('YYYY-MM-DD')});

            if (typeof $scope.data.to !== 'undefined' && $scope.data.to != '')
                angular.extend(data, {to: moment($scope.data.to).format('YYYY-MM-DD')});

            if (typeof $scope.data.consultant_id !== 'undefined' && $scope.data.consultant_id != '')
                angular.extend(data, {consultant_id: $scope.data.consultant_id});

            // Get data's from service
            $http.post($rootScope.IRISOrgServiceUrl + $scope.url, data)
                    .success(function (response) {
                        $scope.loadbar('hide');
                        $scope.records = response.report;
                        $scope.date = moment().format('YYYY-MM-DD HH:MM:ss');
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading products!";
                    });
        };


        //For Datepicker
        $scope.open = function ($event, mode) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.opened1 = $scope.opened2 = false;

            switch (mode) {
                case 'opened1':
                    $scope.opened1 = true;
                    break;
                case 'opened2':
                    $scope.opened2 = true;
                    break;
            }
        };

        $scope.printReport = function () {
            var innerContents = document.getElementById("printThisElement").innerHTML;
            var popupWinindow = window.open('', '_blank', 'width=830,height=700,scrollbars=yes,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
            popupWinindow.document.open();
            popupWinindow.document.write('<html><head><link href="css/print.css" rel="stylesheet" type="text/css" /></head><body onload="window.print()">' + innerContents + '</html>');
            popupWinindow.document.close();
        }

        $scope.$watch('data.from', function (newValue, oldValue) {
            if (newValue != '' && typeof newValue != 'undefined') {
                $scope.toMinDate = new Date($scope.data.from);
            }
        }, true);

        $scope.$watch('data.to', function (newValue, oldValue) {
            if (newValue != '' && typeof newValue != 'undefined') {
                $scope.fromMaxDate = new Date($scope.data.to);
            }
        }, true);
    }]);