app.controller('VitalmanagementController', ['$rootScope', '$scope', '$timeout', '$http', '$state', 'editableOptions', 'editableThemes', 'transformRequestAsFormPost', 'fileUpload', 'AuthenticationService', '$modal', function ($rootScope, $scope, $timeout, $http, $state, editableOptions, editableThemes, transformRequestAsFormPost, fileUpload, AuthenticationService, $modal) {

        editableThemes.bs3.inputClass = 'input-sm';
        editableThemes.bs3.buttonsClass = 'btn-sm';
        editableOptions.theme = 'bs3';
        $scope.current_type = '';

        $scope.data = {};

        $scope.initSettings = function () {
            $scope.isLoading = true;
            $http.get($rootScope.IRISOrgServiceUrl + '/appconfigurations')
                    .success(function (configurations) {
                        $scope.config_inpatient = [];
                        $scope.config_outpatient = [];

                        angular.forEach(configurations, function (conf) {
                            var string = conf.key;
                            var code = conf.code;
                            op_substring = "OP_V_";
                            ip_substring = "IP_V_";

                            if (string.indexOf(op_substring) > -1 == true) {
                                $scope.config_outpatient.push(conf);
                            }
                            if (string.indexOf(ip_substring) > -1 == true) {
                                $scope.config_inpatient.push(conf);
                            }
                        });
                        if(!$scope.current_type) {
                            $scope.loadIpVitals('IP');
                        }
                        $scope.isLoading = false;
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading settings!";
                    });
        }

        $scope.loadIpVitals = function (type) {
            $('.op-btn-group button, .op-btn-group a').removeClass('active');
            $('.op-btn-group button.' + type + '-op-patient').addClass('active');
            $scope.current_type = type;
        }

        $scope.updateVitalByKey = function (value,a, b) {
            var vitalvalue = value;
            var vitalkey = [];
            vitalkey.push(a);
            if (b)
                vitalkey.push(b);
            $http({
                method: 'post',
                url: $rootScope.IRISOrgServiceUrl + '/appconfiguration/updatebykey',
                data: {vitalkey:vitalkey,vitalvalue:vitalvalue},
            }).success(
                    function (response) {
                        $scope.initSettings();
                    }
            ).error(function (data, status) {
                $scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
        }

        $scope.updateVital = function ($data, config_id, key) {
            $scope.errorData = "";
            $scope.msg.successMessage = "";

            if (($data == 1) && (key == 'IP_V_BMI')) {
                $scope.updateVitalByKey(1,'IP_V_H', 'IP_V_W');
            }
            if (($data == 1) && (key == 'OP_V_BMI')) {
                $scope.updateVitalByKey(1,'OP_V_H', 'OP_V_W');
            }
            if (($data == 0) && ((key == 'IP_V_H') || (key == 'IP_V_W'))) {
                $scope.updateVitalByKey(0,'IP_V_BMI');
            }
            if (($data == 0) && ((key == 'OP_V_H') || (key == 'OP_V_W'))) {
                $scope.updateVitalByKey(0,'OP_V_BMI');
            }

            $scope.loadbar('show');
            if (($data == 1) || ($data == 0)) {
                $data = {value: $data}
            }


            $http({
                method: 'PUT',
                url: $rootScope.IRISOrgServiceUrl + '/appconfigurations/' + config_id,
                data: $data,
            }).success(
                    function (response) {
                        $scope.loadbar('hide');
                        $scope.msg.successMessage = 'Updated successfully';
                        $scope.initSettings();
                    }
            ).error(function (data, status) {
                $scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
        }


    }]);
// I provide a request-transformation method that is used to prepare the outgoing
// request as a FORM post instead of a JSON packet.
app.factory(
        "transformRequestAsFormPost",
        function () {
            // I prepare the request data for the form post.
            function transformRequest(data, getHeaders) {
                var headers = getHeaders();
                headers[ "Content-type" ] = "application/x-www-form-urlencoded; charset=utf-8";
                return(serializeData(data));
            }
            // Return the factory value.
            return(transformRequest);
            // ---
            // PRVIATE METHODS.
            // ---
            // I serialize the given Object into a key-value pair string. This
            // method expects an object and will default to the toString() method.
            // --
            // NOTE: This is an atered version of the jQuery.param() method which
            // will serialize a data collection for Form posting.
            // --
            // https://github.com/jquery/jquery/blob/master/src/serialize.js#L45
            function serializeData(data) {
                // If this is not an object, defer to native stringification.
                if (!angular.isObject(data)) {
                    return((data == null) ? "" : data.toString());
                }
                var buffer = [];
                // Serialize each key in the object.
                for (var name in data) {
                    if (!data.hasOwnProperty(name)) {
                        continue;
                    }
                    var value = data[ name ];
                    buffer.push(
                            encodeURIComponent(name) +
                            "=" +
                            encodeURIComponent((value == null) ? "" : value)
                            );
                }
                // Serialize the buffer and clean it up for transportation.
                var source = buffer
                        .join("&")
                        .replace(/%20/g, "+")
                        ;
                return(source);
            }
        }
);