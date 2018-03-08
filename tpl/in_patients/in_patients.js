app.controller('InPatientsController', ['$rootScope', '$scope', '$timeout', '$http', '$state', '$filter', '$modal', '$log', function ($rootScope, $scope, $timeout, $http, $state, $filter, $modal, $log) {

        $scope.app.settings.patientTopBar = false;
        $scope.app.settings.patientSideMenu = false;
        $scope.app.settings.patientContentClass = 'app-content app-content3';
        $scope.app.settings.patientFooterClass = 'app-footer app-footer3';

        //Checkbox initialize
        $scope.checkboxes = {'checked': false, items: []};
        $scope.currentAdmissionSelectedItems = [];
        $scope.currentAdmissionSelected = 0;

        //Index page height
        $scope.css = {'style': ''};

        //Index Page
        $scope.itemsByPage = 20; // No.of records per page
        $scope.loadInPatientsList = function () {
            $scope.scrollStatus = true;
            $scope.isLoading = true;
            // pagination set up
            $scope.rowCollection = [];  // base collection
            $scope.pageIndex = 1;
            $scope.displayedCollection = [].concat($scope.rowCollection);  // displayed collection

            var pageURL = $rootScope.IRISOrgServiceUrl + '/encounter/inpatients?p=' + $scope.pageIndex + '&l=' + $scope.itemsByPage;

            // Get data's from service
            $http.get(pageURL)
                    .success(function (inpatients) {
                        $scope.isLoading = false;
                        $scope.rowCollection = inpatients;

                        $scope.updateCollection();

                        //Checkbox initialize
                        $scope.checkboxes = {'checked': false, items: []};
                        $scope.currentAdmissionSelectedItems = [];
                        $scope.currentAdmissionSelected = 0;
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading!";
                    });
        };
        $scope.scrollStatus = true;
        $scope.loadInPatientsListMore = function () {
            if ($scope.isLoading)
                return;

            if (!$scope.scrollStatus)
                return;

            $scope.pageIndex++;
            $scope.isLoading = true;

            var pageURL = $rootScope.IRISOrgServiceUrl + '/encounter/inpatients?p=' + $scope.pageIndex + '&l=' + $scope.itemsByPage;

            // Get data's from service
            $http.get(pageURL)
                    .success(function (inpatients) {
                        if (inpatients.length == 0) {
                            $scope.scrollStatus = false;
                        }
                        $scope.isLoading = false;
                        $scope.rowCollection = $scope.rowCollection.concat(inpatients);

                        $scope.updateCollection();
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading!";
                    });
        };

        $scope.updateCollection = function () {
            $scope.selectall = '0';
            $scope.isLoading = true;
            $timeout(function () {
                angular.forEach($scope.rowCollection, function (row) {
                    if (typeof row.selected == 'undefined')
                        row.selected = '0';
                });

                $scope.displayedCollection = [].concat($scope.rowCollection);
                $scope.isLoading = false;

                if ($scope.displayedCollection.length > 6) {
                    $scope.css = {
                        'style': 'height:68vh; overflow-y: auto; overflow-x: hidden;',
                    };
                }
            }, 200);
        };

        $scope.orderDir = 0;
        $scope.orderCollection = function (order, orderDir) {
            $scope.orderDir = 1 - orderDir;
            if ($scope.orderDir) {
                orderSign = '+';
            } else {
                orderSign = '-';
            }
            $scope.displayedCollection = $filter('orderBy')($scope.displayedCollection, orderSign + order);
        }

        $scope.updateCheckbox = function () {
            angular.forEach($scope.displayedCollection, function (row) {
                row.selected = $scope.selectall;
            });

            $timeout(function () {
                angular.forEach($scope.displayedCollection, function (row, ip_key) {
                    $scope.moreOptions(ip_key, row);
                });
            }, 800);
        };

        $scope.moreOptions = function (ip_key, row) {
            admission_exists = $filter('filter')($scope.checkboxes.items, {admission_id: row.currentAdmission.admn_id});
            if ($("#iplist_" + ip_key).is(':checked')) {
                $("#iplist_" + ip_key).closest("tr").addClass("selected_row");
                if (admission_exists.length == 0) {
                    $scope.checkboxes.items.push({
                        admission_id: row.currentAdmission.admn_id,
                        row: row
                    });
                }
            } else {
                $("#iplist_" + ip_key).closest("tr").removeClass("selected_row");
                if (admission_exists.length > 0) {
                    $scope.checkboxes.items.splice($scope.checkboxes.items.indexOf(admission_exists[0]), 1);
                }
            }

            $scope.prepareMoreOptions();
        }

        $scope.prepareMoreOptions = function () {
            $scope.currentAdmissionSelectedItems = [];
            angular.forEach($scope.checkboxes.items, function (item) {
                $scope.currentAdmissionSelectedItems.push(item.row);
            });

            $scope.currentAdmissionSelected = $scope.currentAdmissionSelectedItems.length;
        }

        //
        $scope.addConsultantVisit = function () {
            var modalInstance = $modal.open({
                templateUrl: 'tpl/modal_form/modal.patient_consultant_visit.html',
                controller: 'ConsultantVisitController',
                resolve: {
                    scope: function () {
                        return $scope;
                    }
                }
            });
            modalInstance.data = $scope.currentAdmissionSelectedItems;

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                $scope.loadInPatientsList();
                $log.info('Modal dismissed at: ' + new Date());
            });
        }

        //
        $scope.addProcedures = function () {
            var modalInstance = $modal.open({
                templateUrl: 'tpl/modal_form/modal.patient_procedures.html',
                controller: 'PatientProcedureController',
                resolve: {
                    scope: function () {
                        return $scope;
                    }
                }
            });
            modalInstance.data = $scope.currentAdmissionSelectedItems;

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                $scope.loadInPatientsList();
                $log.info('Modal dismissed at: ' + new Date());
            });
        }


    }]);