app.controller('OtherDocumentsController', ['$rootScope', '$scope', '$timeout', '$http', '$state', 'toaster', '$localStorage', function ($rootScope, $scope, $timeout, $http, $state, toaster, $localStorage) {

        $scope.app.settings.patientTopBar = true;
        $scope.app.settings.patientSideMenu = true;
        $scope.app.settings.patientContentClass = 'app-content patient_content';
        $scope.app.settings.patientFooterClass = 'app-footer';

        $scope.data = {};
        $scope.encounter = {};

        // Check patient have active encounter
        $scope.isPatientHaveActiveEncounter = function (callback) {
            $http.post($rootScope.IRISOrgServiceUrl + '/encounter/patienthaveactiveencounter', {patient_id: $state.params.id})
                    .success(function (response) {
                        callback(response);
                    }, function (x) {
                        response = {success: false, message: 'Server Error'};
                        callback(response);
                    });
        }

        // Initialize Create Form
        $scope.initForm = function () {
            $scope.isLoading = true;
//            $scope.isPatientHaveActiveEncounter(function (response) {
//                if (response.success == false) {
//                    $scope.isLoading = false;
//                    alert("Sorry, you can't create other document");
//                    $state.go("patient.document", {id: $state.params.id});
//                } else {
            $scope.data = {};
            $scope.data.formtype = 'add';
            $scope.data.status = '1';
            $scope.doc_type = $state.params.document;
            $scope.formHeading($scope.doc_type);
            $scope.encounter = {encounter_id: $state.params.enc_id};
            $scope.isLoading = false;
            $timeout(function () {
                $scope.editorReplace();
            }, 500);
//                }
//            });
        }

        //Get Data for update Form
        $scope.loadForm = function () {
            $scope.data = {};
            $scope.loadbar('show');
            _that = this;
            $scope.errorData = "";
            $http({
                url: $rootScope.IRISOrgServiceUrl + "/patientotherdocuments/" + $state.params.other_doc_id,
                method: "GET"
            }).success(
                    function (response) {
                        $scope.loadbar('hide');
                        $scope.data = response;
                        $scope.formHeading(response.doc_type);
                        $scope.encounter = {encounter_id: response.encounter_id};
                        $timeout(function () {
                            $scope.editorReplace(response);
                        }, 500);
                    }
            ).error(function (data, status) {
                $scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
            $scope.data.formtype = 'update';
        };
        
        $scope.formHeading = function (type) {
            if(type=='OD') {
                $scope.form_name = 'Other Document';
            } else if(type=='PA') {
                $scope.form_name = 'Psychological Assessment';
            } else {
                $scope.form_name = 'Psychological Therapy';
            }
        };

        //Save Both Add & Update Data
        $scope.saveForm = function (mode) {
            $scope.editorupdate();
            _data = $('#other_document_form').serializeArray();
            _that = this;
            $(_data).each(function (i, field) {
                _that.data[field.name] = field.value;
            });
            $scope.errorData = "";
            $scope.msg.successMessage = "";

            if (mode == 'add') {
                post_url = $rootScope.IRISOrgServiceUrl + '/patientotherdocuments';
                method = 'POST';
                succ_msg = 'Added successfully';

                angular.extend(_that.data, {
                    patient_id: $scope.patientObj.patient_id,
                    encounter_id: $scope.encounter.encounter_id,
                    doc_type: $scope.doc_type,
                });
            } else {
                post_url = $rootScope.IRISOrgServiceUrl + '/patientotherdocuments/' + $state.params.other_doc_id;
                method = 'PUT';
                succ_msg = 'Updated successfully';
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
                            $state.go('patient.document', {id: $state.params.id});
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

        $scope.editorupdate = function () {
            $('.other_doc_content').val($('#txtEditor').Editor("getText"));
        };

        $scope.editorReplace = function (response) {
            $("#txtEditor").Editor();
            if (response) {
                $('#txtEditor').Editor('setText', (response.other_doc_content));
            }
        };

        $scope.loadView = function () {
            $http.get($rootScope.IRISOrgServiceUrl + '/patientotherdocuments/' + $state.params.other_doc_id)
                    .success(function (other_document) {
                        $scope.other_document = other_document;
                        $scope.formHeading(other_document.doc_type);
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading patient other documents!";
                    });
        }

        $scope.printDocument = function () {
            $('#printThis').printThis({
                pageTitle: $scope.app.org_name,
                debug: false,
                importCSS: false,
                importStyle: false,
                loadCSS: [$rootScope.IRISOrgUrl + "/css/print.css"],
            });
        }
    }]);

app.filter("sanitize", ['$sce', function ($sce) {
        return function (htmlCode) {
            return $sce.trustAsHtml(htmlCode);
        }
    }]);