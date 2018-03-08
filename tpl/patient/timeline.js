app.controller('PatientTimelineController', ['$rootScope', '$scope', '$timeout', '$http', '$state', '$filter', '$localStorage', function ($rootScope, $scope, $timeout, $http, $state, $filter, $localStorage) {

        $scope.app.settings.patientTopBar = true;
        $scope.app.settings.patientSideMenu = true;
        $scope.app.settings.patientContentClass = 'app-content patient_content ';
        $scope.app.settings.patientFooterClass = 'app-footer';

        $scope.loadTimeline = function () {
            $scope.data = {};

            $http.get($rootScope.IRISOrgServiceUrl + '/organization/getpatientsharetenants?patient_id=' + $state.params.id)
                    .success(function (resp) {
                        $scope.tenants = resp.tenants;  
                        
                        if ($scope.tenants.length > 1)
                            $scope.tenants.push({tenant_id: 'all', branch_name: 'ALL', patient_global_guid: $scope.tenants[0].patient_global_guid});

                        $scope.data.tenant_id = resp.tenant_id;
                        $scope.data.pat_tenant_id = resp.tenant_id;

                        $scope.getTimeline($rootScope.IRISOrgServiceUrl + '/patient/getpatienttimeline', {guid: $state.params.id}, '');
                        
                        result = $filter('filter')($scope.tenants, {tenant_id: $scope.data.tenant_id});
                        
                        if (result.length > 0) {
                            $scope.data.tenant_name = result[0].branch_name;
                        }
                    })
                    .error(function () {
                        $scope.msg.errorMessage = "An Error has occured while loading patient!";
                    });
        }

        $scope.switchBranch = function () {
            result = $filter('filter')($scope.tenants, {tenant_id: $scope.data.tenant_id});

            if (result.length > 0) {
                $scope.data.tenant_name = result[0].branch_name;
                
                if ($scope.data.pat_tenant_id == $scope.data.tenant_id) {
                    $scope.getTimeline($rootScope.IRISOrgServiceUrl + '/patient/getpatienttimeline', {guid: $state.params.id}, '');
                } else {
                    $scope.getTimeline($rootScope.IRISOrgServiceUrl + '/patient/getpatienttimeline2', {guid: result[0].patient_global_guid, tenant_id: result[0].tenant_id, org_tenant_id: $localStorage.user.credentials.logged_tenant_id}, result[0].org_domain);
                }
            }
        }
        
//        $scope.encounter_colors = ["b-info", "b-success", "b-primary", "b-black", "b-danger", "b-warning", "b-white"];
        $scope.encounter_colors = ["b-primary", "b-dark"];

        $scope.getTimeline = function (url, data, domain_path) {
            $scope.loadbar('hide');
            $http.post(url, data, {headers: {'x-domain-path': domain_path}})
                    .success(function (resp) {
                        $scope.loadbar('hide');
                        
                        filtered = $filter('orderBy')(resp.timeline, 'encounter_id');
                        
                        timelines = [];
                        prevEnc = '';
                        colorKey = timeline_key = 0;
                        
                        angular.forEach(filtered, function(timeline){
                            timelines[timeline_key] = timeline;
                            encounter_ends = false;
                            item_class = 'tl-item';
                            
                            if(timeline_key == 0){
                                prevEnc = timeline.encounter_id;
                            }else{
                                if(timeline.encounter_id != null){
                                    if(prevEnc != timeline.encounter_id){
                                        prevEnc = timeline.encounter_id;
                                        encounter_ends = true;
                                        
                                        colorKey++;
                                    }
                                }
                            }
                            
                            if(colorKey > ($scope.encounter_colors.length - 1))
                                colorKey = 0;
                            
                            if(timeline.adminstrative_info){
                                timelines[timeline_key].box_class = "administrative_heading";
                            } else if(timeline.clinical_info){
                                timelines[timeline_key].box_class = "clinical_heading";
                            }
                            
                            timelines[timeline_key].encounter_ends = encounter_ends;
                            timelines[timeline_key].encounter_color = $scope.encounter_colors[colorKey];
                            timelines[timeline_key].item_class = item_class;
                            timeline_key++;
                        });
                        
                        filtered = $filter('orderBy')(timelines, '-encounter_id');
                        $scope.timeline = filtered;
                    })
                    .error(function () {
                        $scope.loadbar('hide');
                        $scope.msg.errorMessage = "An Error has occured while loading patient!";
                    });
        }

    }]);


//app.filter('moment', function () {
//    return function (dateString, format) {
//        return moment(dateString).format(format);
//    };
//});