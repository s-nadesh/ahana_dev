'use strict';

angular.module('app').factory('CommonService', CommonService);

CommonService.$inject = ['$http', '$rootScope', '$window', '$q'];
function CommonService($http, $rootScope, $window, $q) {
    var service = {};

    service.ChangeStatus = ChangeStatus;
    service.ChangePharmacy = ChangePharmacy;
    service.GetCountryList = GetCountryList;
    service.GetStateList = GetStateList;
    service.GetCityList = GetCityList;
    service.GetTitleCodes = GetTitleCodes;

    return service;

    function ChangeStatus(modelName, primaryKey, clientUrl, callback) {
        var response;
        $('.butterbar').removeClass('hide').addClass('active');
        $http.defaults.headers.common['x-domain-path'] = clientUrl;
        
        $http.post($rootScope.IRISAdminServiceUrl + '/default/change-status', {model: modelName, id: primaryKey})
                .success(function (response) {
                    $('.butterbar').removeClass('active').addClass('hide');
                    callback(response);
                }, function (x) {
                    response = {success: false, message: 'Server Error'};
                    callback(response);
                });
    }
    
    function ChangePharmacy(modelName, primaryKey, clientUrl, callback) {
        var response;
        $('.butterbar').removeClass('hide').addClass('active');
        $http.defaults.headers.common['x-domain-path'] = clientUrl;
        
        $http.post($rootScope.IRISAdminServiceUrl + '/default/change-pharmacy', {model: modelName, id: primaryKey})
                .success(function (response) {
                    $('.butterbar').removeClass('active').addClass('hide');
                    callback(response);
                }, function (x) {
                    response = {success: false, message: 'Server Error'};
                    callback(response);
                });
    }

    function GetCountryList(callback) {
        var response;

        $http.get($rootScope.IRISAdminServiceUrl + '/default/get-country-list')
                .success(function (response) {
                    callback(response);
                }, function (x) {
                    response = {success: false, message: 'Server Error'};
                    callback(response);
                });
    }

    function GetStateList(callback) {
        var response;

        $http.get($rootScope.IRISAdminServiceUrl + '/default/get-state-list')
                .success(function (response) {
                    callback(response);
                }, function (x) {
                    response = {success: false, message: 'Server Error'};
                    callback(response);
                });
    }

    function GetCityList(callback) {
        var response;

        $http.get($rootScope.IRISAdminServiceUrl + '/default/get-city-list')
                .success(function (response) {
                    callback(response);
                }, function (x) {
                    response = {success: false, message: 'Server Error'};
                    callback(response);
                });
    }

    function GetTitleCodes(callback) {
        var response = [{value: 'Mr.', label: 'Mr.'}, {value: 'Mrs.', label: 'Mrs.'}, {value: 'Miss.', label: 'Miss.'}, {value: 'Dr.', label: 'Dr.'}];
        callback(response);
    }
}