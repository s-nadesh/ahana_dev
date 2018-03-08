app.controller('RoomController', ['$rootScope', '$scope', '$timeout', '$http', '$state', 'toaster', function ($rootScope, $scope, $timeout, $http, $state, toaster) {

        //Index Page
        $scope.loadRoomsList = function () {
            $scope.isLoading = true;
            // pagination set up
            $scope.rowCollection = [];  // base collection

            // Get data's from service
            $http.get($rootScope.IRISOrgServiceUrl + '/room')
                    .success(function (room) {
                        $scope.isLoading = false;
                        $scope.rowCollection = room;
                        
                        //Avoid pagination problem, when come from other pages.
                        $scope.footable_redraw();
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading room!";
                    });
        };

        //For Form
        $scope.initForm = function () {
            $rootScope.commonService.GetWardList('', '1', false, function (response) {
                $scope.wards = response.wardList;
            });

            $rootScope.commonService.GetRoomMaintenanceList('', '1', false, function (response) {
                $scope.maintenances = response.maintenanceList;
            });
        }

        //Save Both Add & Update Data
        $scope.saveForm = function (mode) {
            _that = this;

            $scope.errorData = "";
            $scope.msg.successMessage = "";

            if (mode == 'add') {
                post_url = $rootScope.IRISOrgServiceUrl + '/rooms';
                method = 'POST';
                succ_msg = 'Room saved successfully';
            } else {
                post_url = $rootScope.IRISOrgServiceUrl + '/rooms/' + _that.data.room_id;
                method = 'PUT';
                succ_msg = 'Room updated successfully';
            }

            $scope.loadbar('show');
            $http({
                method: method,
                url: post_url,
                data: _that.data,
            }).success(
                    function (response) {
                        $scope.loadbar('hide');
                        $scope.msg.successMessage = succ_msg;
                        $scope.data = {};
                        $timeout(function () {
                            $state.go('configuration.room');
                        }, 1000)

                    }
            ).error(function (data, status) {
                $scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
        };

        //Get Data for update Form
        $scope.loadForm = function () {
            $scope.loadbar('show');
            _that = this;
            $scope.errorData = "";
            $http({
                url: $rootScope.IRISOrgServiceUrl + "/rooms/" + $state.params.id,
                method: "GET"
            }).success(
                    function (response) {
                        $scope.loadbar('hide');
                        $scope.data = response;
                    }
            ).error(function (data, status) {
                $scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
        };

        $scope.updateNotes = function (sts) {
            if (sts == 0)
                $scope.data.notes = '';
        }

        $scope.occupiedStatus = {
            '0': 'Vacant',
            '1': 'Occupied',
            '2': 'Maintenance'
        };

        $scope.predicates = ['bed_name', 'ward_name', 'roomstatus'];
        $scope.selectedPredicate = $scope.predicates[0];
    }]);

app.filter('myStrictFilter', function($filter){
    return function(input, predicate){
        return $filter('filter')(input, predicate, true);
    }
});

app.filter('unique', function() {
    return function (arr, field) {
        var o = {}, i, l = arr.length, r = [];
        for(i=0; i<l;i+=1) {
            o[arr[i][field]] = arr[i];
        }
        for(i in o) {
            r.push(o[i]);
        }
        return r;
    };
  })