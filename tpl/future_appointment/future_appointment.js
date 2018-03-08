app.controller('FutureAppointmentController', ['$rootScope', '$scope', '$timeout', '$http', '$state', '$filter', 'modalService', '$modal', '$log', function ($rootScope, $scope, $timeout, $http, $state, $filter, modalService, $modal, $log) {

        $scope.app.settings.patientTopBar = false;
        $scope.app.settings.patientSideMenu = false;
        $scope.app.settings.patientContentClass = 'app-content app-content3';
        $scope.app.settings.patientFooterClass = 'app-footer app-footer3';

        $scope.more_max = 4;

        $scope.ctrl = {};
        $scope.allExpanded = true;
        $scope.expanded = true;
        $scope.ctrl.expandAll = function (expanded) {
            $scope.$broadcast('onExpandAll', {expanded: expanded});
        };

        $scope.checkboxes = {'checked': false, items: {}};
        $scope.futureappointmentSelectedItems = [];
        $scope.futureappointmentSelected = 0;

        //Encounter Page
        $scope.loadFutureAppointmentsList = function () {
            $scope.errorData = '';
            $scope.isLoading = true;
            $scope.rowCollection = [];  // base collection
            $scope.displayedCollection = [].concat($scope.rowCollection);  // displayed collection

            $http.get($rootScope.IRISOrgServiceUrl + '/appointment/getfutureappointmentslist?consultant_id=' + $state.params.consultant_id + '&date=' + $state.params.date)
                    .success(function (response) {
                        if (response.success == true) {
                            $scope.isLoading = false;
                            $scope.rowCollection = response.result;
                            $scope.displayedCollection = [].concat($scope.rowCollection);

                            $scope.more_li = {};

                            $scope.checkboxes = {'checked': false, items: {}};
                            $scope.futureappointmentSelectedItems = [];
                            $scope.futureappointmentSelected = 0;
                        } else {
                            $scope.errorData = response.message;
                        }
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading encounter!";
                    });
        };

        // watch for data checkboxes
        $scope.$watch('checkboxes.items', function (values) {
            $scope.futureappointmentSelectedItems = [];
            if (!$scope.rowCollection) {
                return;
            }
            var checked = 0, unchecked = 0, total = 0;

            if ($scope.rowCollection.length > 0) {
                total = $scope.rowCollection[0].all.length;
                angular.forEach($scope.rowCollection[0].all, function (item) {
                    if ($scope.checkboxes.items[item.appt_id]) {
                        $scope.futureappointmentSelectedItems.push(item);
                    }
                    checked += ($scope.checkboxes.items[item.appt_id]) || 0;
                    unchecked += (!$scope.checkboxes.items[item.appt_id]) || 0;
                });
            }

            if ((unchecked == 0) || (checked == 0)) {
                $scope.checkboxes.checked = (checked == total);
            }

            $scope.futureappointmentSelected = checked;
        }, true);

        $scope.rescheduleAppointments = function () {
            var modalInstance = $modal.open({
                templateUrl: 'tpl/modal_form/modal.patient_appointment_reschedule.html',
                controller: "AppointmentRescheduleController",
                resolve: {
                    scope: function () {
                        return $scope;
                    },
                }
            });
            modalInstance.data = $scope.futureappointmentSelectedItems;

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                $scope.loadFutureAppointmentsList();
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        $scope.cancelAppointments = function () {
            var conf = confirm('Are you sure to cancel these appointments ?');
            if (conf) {
                $scope.loadbar('show');
                post_url = $rootScope.IRISOrgServiceUrl + '/appointment/bulkcancel';
                method = 'POST';
                succ_msg = 'Appointment cancelled successfully';
                $http({
                    method: method,
                    url: post_url,
                    data: $scope.futureappointmentSelectedItems,
                }).success(
                        function (response) {
                            $scope.msg.successMessage = succ_msg;
                            $scope.loadbar('hide');
                            $scope.encounterIDs = [];
                            $scope.selectedIDs = [];
                            $scope.loadFutureAppointmentsList();
                        }
                ).error(function (data, status) {
                    $scope.loadbar('hide');
                    if (status == 422)
                        $scope.errorData = $scope.errorSummary(data);
                    else
                        $scope.errorData = data.message;
                });
            } else {
                $scope.encounterIDs = [];
                $scope.selectedIDs = [];
            }
        }

    }]);