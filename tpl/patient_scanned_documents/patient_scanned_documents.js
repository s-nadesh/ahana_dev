app.controller('ScannedDocumentsController', ['$rootScope', '$scope', '$timeout', '$http', '$state', 'toaster', '$localStorage', 'FileUploader', function ($rootScope, $scope, $timeout, $http, $state, toaster, $localStorage, FileUploader) {

        $scope.app.settings.patientTopBar = true;
        $scope.app.settings.patientSideMenu = true;
        $scope.app.settings.patientContentClass = 'app-content patient_content';
        $scope.app.settings.patientFooterClass = 'app-footer';

        $scope.data = {};
        $scope.encounter = {};

        var uploader = $scope.uploader = new FileUploader({
            url: $rootScope.IRISOrgServiceUrl + "/patientscanneddocuments/savedocument?access-token=" + $localStorage.user.access_token,
        });

        // FILTERS
        uploader.filters.push({
            name: 'customFilter',
            fn: function (item /*{File|FileLikeObject}*/, options) {
                return this.queue.length < 10;
            }
        });

        // CALLBACKS
//        uploader.onWhenAddingFileFailed = function (item /*{File|FileLikeObject}*/, filter, options) {
//            console.info('onWhenAddingFileFailed', item, filter, options);
//        };
//        uploader.onAfterAddingFile = function (fileItem) {
//            console.info('onAfterAddingFile', fileItem);
//        };
//        uploader.onAfterAddingAll = function (addedFileItems) {
//            console.info('onAfterAddingAll', addedFileItems);
//        };
        uploader.onBeforeUploadItem = function (item) {
            item.headers = {
                'x-domain-path': $rootScope.clientUrl
            };
            item.formData.push({
                'encounter_id': $scope.encounter.encounter_id,
                'patient_id': $state.params.id,
                'scanned_doc_name': $scope.data.document_name,
                'day':$scope.day,
                'month':$scope.month,
                'year':$scope.year,
            });
        };
//        uploader.onProgressItem = function (fileItem, progress) {
//            console.info('onProgressItem', fileItem, progress);
//        };
//        uploader.onProgressAll = function (progress) {
//            console.info('onProgressAll', progress);
//        };
//        uploader.onSuccessItem = function (fileItem, response, status, headers) {
//            console.info('onSuccessItem', fileItem, response, status, headers);
//        };
//        uploader.onErrorItem = function (fileItem, response, status, headers) {
//            console.info('onErrorItem', fileItem, response, status, headers);
//        };
//        uploader.onCancelItem = function (fileItem, response, status, headers) {
//            console.info('onCancelItem', fileItem, response, status, headers);
//        };
//        uploader.onCompleteItem = function (fileItem, response, status, headers) {
//            console.info('onCompleteItem', fileItem, response, status, headers);
//        };
        uploader.onCompleteAll = function () {
            $scope.msg.successMessage = 'Scanned Document Uploaded Successfully';
            $timeout(function () {
                $state.go("patient.document", {id: $state.params.id});
            }, 3000)
        };

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
            $scope.data = {};
            $scope.data.document_name = '';
            $scope.day = '';
            $scope.month = '';
            $scope.year = '';
            //$scope.data.date_of_creation = moment().format('YYYY-MM-DD HH:mm:ss');
            $scope.isLoading = true;
            $scope.encounter = {encounter_id: $state.params.enc_id};
            $scope.isLoading = false;
            
            $rootScope.commonService.GetDay(function (response) {
                $scope.days = response;
            });
            $rootScope.commonService.GetMonth(function (response) {
                $scope.months = response;
            });
            $rootScope.commonService.GetYear(function (response) {
                $scope.years = response;
            });
//            $scope.isPatientHaveActiveEncounter(function (response) {
//                if (response.success == false) {
//                    $scope.isLoading = false;
//                    alert("Sorry, you can't upload a scanned document");
//                    $state.go("patient.document", {id: $state.params.id});
//                } else {
//                    $scope.encounter = response.model;
//                }
//            });
        }
    }]);