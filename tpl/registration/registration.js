app.controller('UsersController', ['$rootScope', '$scope', '$timeout', '$http', '$state', '$modal', '$log', '$localStorage', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', function ($rootScope, $scope, $timeout, $http, $state, $modal, $log,$localStorage, DTOptionsBuilder, DTColumnBuilder, $compile) {

        //Index Page
        $scope.loadList = function () {
            $scope.isLoading = true;
            $scope.rowCollection = [];
            var cp = $state.params.mode;

            // Get data's from service
            $http.get($rootScope.IRISOrgServiceUrl + '/user/getuserdata?cp='+cp)
                    .success(function (users) {
                        $scope.isLoading = false;
                        $scope.rowCollection = users;

                        //Avoid pagination problem, when come from other pages.
                        $scope.footable_redraw();
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading users!";
                    });
        };
        
        var vm = this;
        var token = $localStorage.user.access_token;
        var cp = $state.params.mode;
        vm.dtOptions = DTOptionsBuilder.newOptions()
                .withOption('ajax', {
                    // Either you specify the AjaxDataProp here
                    // dataSrc: 'data',
                    url: $rootScope.IRISOrgServiceUrl + '/user/getuserdata?cp='+cp+'&access-token=' + token,
                    type: 'POST',
                    beforeSend: function (request) {
                        request.setRequestHeader("x-domain-path", $rootScope.clientUrl);
                    }
                })
                // or here
                .withDataProp('data')
                .withOption('processing', true)
                .withOption('serverSide', true)
                .withOption('stateSave', true)
                .withOption('bLengthChange', true)
                .withOption('order', [0, 'asc'])
                .withPaginationType('full_numbers')
                .withOption('createdRow', createdRow);
        vm.dtColumns = [
            DTColumnBuilder.newColumn('name').withTitle('Employee Name'),
            DTColumnBuilder.newColumn('designation').withTitle('Designation').renderWith(designationHtml),
            DTColumnBuilder.newColumn('mobile').withTitle('Mobile').renderWith(mobileHtml),
            DTColumnBuilder.newColumn('email').withTitle('Email'),
            DTColumnBuilder.newColumn('user_id').withTitle('User ID').notVisible(),
            DTColumnBuilder.newColumn(null).withTitle('Login Credentials').notSortable().renderWith(loginHtml).withClass('logindeatils'),
            DTColumnBuilder.newColumn(null).withTitle('Create / Update').notSortable().renderWith(createHtml),
            DTColumnBuilder.newColumn(null).withTitle('Actions').notSortable().renderWith(actionsHtml)
        ];

        function createdRow(row, data, dataIndex) {
            // Recompiling so we can bind Angular directive to the DT
            $compile(angular.element(row).contents())($scope);
        }
        function designationHtml(data, type, full, meta) {
            return '<span class="label bg-success"> '+data+' </span>';
        }
        function mobileHtml(data, type, full, meta) {
            return '<span class="label bg-info"> '+data+' </span>';
        }
        function loginHtml(data, type, full, meta) {
                
            return '<p> <b> Username : </b>'+data.username+'</p>'+
                   '<p> <b>Activation Date : </b>'+data.activation_date+'</p>'+
                   '<p> <b>Inactivation Date : </b>'+data.Inactivation_date+'</p>';
        }
        function createHtml(data, type, full, meta) {
            return  '<a title="'+data.login_link_text+'" class="'+data.login_link_btn+'" ui-sref="configuration.login_update({id: '+data.user_id+'})">'+
                    '<i class="fa '+data.login_link_icon_class+'"></i> &nbsp;'+data.login_link_text+''+
                    '</a>';
        }
        
        function actionsHtml(data, type, full, meta) {
            return '<a class="btn btn-dark" title="Edit" check-access  ui-sref="configuration.user_update({id: '+data.user_id+'})">'+
                   '<i class="fa fa-pencil"></i>'+
                   '</a>';
        }

        //For User Form
        $scope.initForm = function () {
            $scope.loadbar('show');
            $rootScope.commonService.GetTitleCodes(function (response) {
                $scope.title_codes = response;

                $rootScope.commonService.GetCountryList(function (response) {
                    $scope.countries = response.countryList;

                    $rootScope.commonService.GetStateList(function (response) {
                        $scope.states = response.stateList;

                        $rootScope.commonService.GetCityList(function (response) {
                            $scope.cities = response.cityList;

                            $rootScope.commonService.GetSpecialityList('', '1', false, function (response) {
                                $scope.specialities = response.specialityList;

                                $scope.loadbar('hide');
                                if ($scope.data.formrole == 'update') {
                                    $scope.loadForm();
                                }
                            });
                        });
                    });
                });
            });

        }
        
        $scope.updateState2 = function () {
            $scope.availableStates2 = [];
            $scope.availableCities2 = [];

            _that = this;
            angular.forEach($scope.states, function (value) {
                if (value.countryId == _that.data.country_id) {
                    var obj = {
                        value: value.value,
                        label: value.label
                    };
                    $scope.availableStates2.push(obj);
                }
            });
        }

        $scope.updateCity2 = function () {
            $scope.availableCities2 = [];

            _that = this;
            angular.forEach($scope.cities, function (value) {
                if (value.stateId == _that.data.state_id) {
                    var obj = {
                        value: value.value,
                        label: value.label
                    };
                    $scope.availableCities2.push(obj);
                }
            });
        }

        //Save Both Add & Update Data
        $scope.saveForm = function (mode) {
            _that = this;

            $scope.errorData = "";
            $scope.msg.successMessage = "";

            if (mode == 'add') {
                post_url = $rootScope.IRISOrgServiceUrl + '/users/createuser';
            } else {
                post_url = $rootScope.IRISOrgServiceUrl + '/user/updateuser';
            }

            $scope.loadbar('show');
            $http({
                method: "POST",
                url: post_url,
                data: _that.data,
            }).then(
                    function (response) {
                        $scope.loadbar('hide');
                        if (response.data.success === true) {

                            if (mode !== 'add') {
                                $scope.msg.successMessage = " User updated successfully";
                                $timeout(function () {
                                    $state.go('configuration.registration');
                                }, 1000)
                            }
                            else {
                                $scope.msg.successMessage = "User saved successfully";
                                $scope.data = {};
                                $timeout(function () {
                                    $state.go('configuration.registration');
                                }, 1000)
                            }
                        }
                        else {
                            $scope.errorData = response.data.message;
                        }
                    }
            )
        };

        //Get Data for update Form
        $scope.loadForm = function () {
            $scope.loadbar('show');
            _that = this;
            $scope.errorData = "";
            $http({
                url: $rootScope.IRISOrgServiceUrl + "/user/getuser?id=" + $state.params.id,
                method: "GET"
            }).then(
                    function (response) {
                        $scope.loadbar('hide');
                        if (response.data.success === true) {
                            $scope.data = response.data.return;
                            $scope.updateState2();
                            $scope.updateCity2();
                        }
                        else {
                            $scope.errorData = response.data.message;
                        }
                    }
            )
        };

        //Get Data for Login update Form
        $scope.loadLoginForm = function () {
            _that = this;
            $scope.errorData = "";
            $http({
                url: $rootScope.IRISOrgServiceUrl + "/user/getlogin?id=" + $state.params.id,
                method: "GET"
            }).then(
                    function (response) {
                        if (response.data.success === true) {
                            $scope.data = response.data.return;
                            if (!jQuery.isEmptyObject(response.data.return.username)) {
                                $scope.data.password = '';
                                $scope.data.form_type = 'update';
                            } else {
                                $scope.data.form_type = 'add';
                                $scope.data.activation_date = moment($scope.data.activation_date).format('YYYY-MM-DD');
                            }
                        }
                        else {
                            $scope.errorData = response.data.message;
                        }
                    }
            )
        };

        //Save Both Add & Update Login Data
        $scope.saveLogin = function () {
            _that = this;

            _that.data.user_id = {};
            _that.data.user_id = $state.params.id;

            if(typeof _that.data.activation_date != 'undefined' && _that.data.activation_date != '' && _that.data.activation_date != null)
                _that.data.activation_date = moment(_that.data.activation_date).format('YYYY-MM-DD');
//            _that.data.Inactivation_date = moment(_that.data.Inactivation_date).format('YYYY-MM-DD');

            $scope.errorData = "";
            $scope.msg.successMessage = "";

            $scope.loadbar('show');
            $http({
                method: "POST",
                url: $rootScope.IRISOrgServiceUrl + '/users/updatelogin',
                data: sanitizeVariable(_that.data),
            }).then(
                    function (response) {
                        $scope.loadbar('hide');
                        if (response.data.success === true) {
                            $scope.msg.successMessage = "Login saved successfully";
//                            $scope.data = {};
                            $timeout(function () {
                                $state.go('configuration.registration');
                            }, 1000)
                        }
                        else {
                            $scope.errorData = response.data.message;
                        }
                    }
            )
        };

        sanitizeVariable = function (data) {
            var result = {};
            angular.forEach(data, function (value, key) {
                if (typeof value == "undefined") {
                    result[key] = '';
                } else {
                    result[key] = value;
                }
            }, result);
            return result;
        }

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

        $scope.toggleMin = function () {
            $scope.minDate = $scope.minDate ? null : new Date();
        };
        $scope.toggleMin();

        $scope.disabled = function (date, mode) {
            return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
        };
        
        $scope.openModal = function (size, ctrlr, tmpl, update_col) {
            var modalInstance = $modal.open({
                templateUrl: tmpl,
                controller: ctrlr,
                size: size,
                resolve: {
                    scope: function () {
                        return $scope;
                    },
                    column: function () {
                        return update_col;
                    },
                    country_id: function () {
                        return $scope.data.country_id;
                    },
                    state_id: function () {
                        return $scope.data.state_id;
                    },
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };
        
        $scope.afterCountryAdded = function(country_id){
            $scope.data.country_id = country_id;
            $scope.updateState2();
        }
        
        $scope.afterStateAdded = function(state_id){
            $scope.data.state_id = state_id;
            $scope.updateState2();
        }

        $scope.afterCityAdded = function(city_id){
            $scope.data.city_id = city_id;
            $scope.updateCity2();
        }
    }]);