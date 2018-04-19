'use strict';

angular.module('app').factory('CommonService', CommonService);

CommonService.$inject = ['$http', '$rootScope', '$window', '$q', '$filter', '$localStorage', 'AuthenticationService'];
function CommonService($http, $rootScope, $window, $q, $filter, $localStorage, AuthenticationService) {
    var service = {};

    service.ChangeStatus = ChangeStatus;
    service.UpdatePrintUser = UpdatePrintUser;
    service.GetCountryList = GetCountryList;
    service.GetStateList = GetStateList;
    service.GetCityList = GetCityList;
    service.GetTitleCodes = GetTitleCodes;
    service.GetMaritalStatus = GetMaritalStatus;
    service.GetPasswordResetAccess = GetPasswordResetAccess;
    service.GetTenantList = GetTenantList;
    service.GetFloorList = GetFloorList;
    service.GetRoomChargeCategoryList = GetRoomChargeCategoryList;
    service.GetRoomChargeSubCategoryList = GetRoomChargeSubCategoryList;
    service.GetRoomChargeItemList = GetRoomChargeItemList;
    service.GetRoomTypeList = GetRoomTypeList;
    service.GetWardList = GetWardList;
    service.GetRoomMaintenanceList = GetRoomMaintenanceList;
    service.GetPatientCateogryList = GetPatientCateogryList;
    service.GetChargePerSubCategoryList = GetChargePerSubCategoryList;
    service.GetSpecialityList = GetSpecialityList;
    service.GetInternalCodeList = GetInternalCodeList;
    service.GetDoctorList = GetDoctorList;
    service.GetDoctorListForPatient = GetDoctorListForPatient;
    service.GetDayList = GetDayList;
    service.GetDay = GetDay;
    service.GetMonth = GetMonth;
    service.GetYear = GetYear;
    service.CheckStateAccess = CheckStateAccess;
    service.GetGenderList = GetGenderList;
    service.GetPatientBillingList = GetPatientBillingList;
    service.GetPatientRegisterModelList = GetPatientRegisterModelList;
    service.GetPatientAppointmentStatus = GetPatientAppointmentStatus;
    service.GetRoomList = GetRoomList;
    service.GetChargeCategoryList = GetChargeCategoryList;
    service.GetEncounterListByPatient = GetEncounterListByPatient;
    service.GetEncounterListByTenantSamePatient = GetEncounterListByTenantSamePatient;
    service.GetEncounterListByPatientAndType = GetEncounterListByPatientAndType;
    service.GetPatientList = GetPatientList;
    service.GetAlertList = GetAlertList;
    service.GetBloodList = GetBloodList;
    service.GetDrugClassList = GetDrugClassList;
    service.GetGenericList = GetGenericList;
    service.GetPaymentType = GetPaymentType;
    service.GetSupplierList = GetSupplierList;
    service.GetProductList = GetProductList;
    service.GetProductListByName = GetProductListByName;
    service.GetPackageUnitList = GetPackageUnitList;
    service.GetBatchListByProduct = GetBatchListByProduct;
    service.GetDrugClassListByName = GetDrugClassListByName;
    service.GetPatientFrequency = GetPatientFrequency;
    service.GetPatientRoute = GetPatientRoute;
    service.GetPatientGroup = GetPatientGroup;
    service.GetHsnCode = GetHsnCode;
    service.GetGstCode = GetGstCode;

    service.GetLabelFromValue = GetLabelFromValue;
    service.FoundVlaue = FoundVlaue;
    service.GetRoomTypesRoomsList = GetRoomTypesRoomsList;

    service.GetBrandsList = GetBrandsList;
    service.GetDivisionsList = GetDivisionsList;

    service.GetProductUnitsList = GetProductUnitsList;
    service.GetProductDescriptionList = GetProductDescriptionList;
    service.GetVatList = GetVatList;
    service.GetPaymentModes = GetPaymentModes;
    service.GetCardTypes = GetCardTypes;

    service.GetDiagnosisList = GetDiagnosisList;
    service.GetDsmivList = GetDsmivList;

    service.GetCareTaker = GetCareTaker;

    service.GetDischargeTypes = GetDischargeTypes;
    service.CheckAdminAccess = CheckAdminAccess;
    service.GetSaleGroups = GetSaleGroups;
    service.GetIntervalList = GetIntervalList;
    service.GettoWords = GettoWords;

    return service;

    function GettoWords(s)
    {
        var th = ['', 'thousand', 'million', 'billion', 'trillion'];
        var dg = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
        var tn = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
        var tw = ['twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

        s = s.toString();
        s = s.replace(/[\, ]/g, '');
        if (s != parseFloat(s))
            return 'not a number';
        var x = s.indexOf('.');
        if (x == -1)
            x = s.length;
        if (x > 15)
            return 'too big';
        var n = s.split('');
        var str = '';
        var sk = 0;
        for (var i = 0; i < x; i++)
        {
            if ((x - i) % 3 == 2)
            {
                if (n[i] == '1')
                {
                    str += tn[Number(n[i + 1])] + ' ';
                    i++;
                    sk = 1;
                } else if (n[i] != 0)
                {
                    str += tw[n[i] - 2] + ' ';
                    sk = 1;
                }
            } else if (n[i] != 0)
            {
                str += dg[n[i]] + ' ';
                if ((x - i) % 3 == 0)
                    str += 'hundred ';
                sk = 1;
            }


            if ((x - i) % 3 == 1)
            {
                if (sk)
                    str += th[(x - i - 1) / 3] + ' ';
                sk = 0;
            }
        }
        if (x != s.length)
        {
            var y = s.length;
            str += 'point ';
            for (var i = x + 1; i < y; i++)
                str += dg[n[i]] + ' ';
        }
        return capitalise(str.replace(/\s+/g, ' '));
    }

    function capitalise(string) {
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    }

    function ChangeStatus(modelName, primaryKey, callback) {
        var response;
        $('.butterbar').removeClass('hide').addClass('active');
        $http.post($rootScope.IRISOrgServiceUrl + '/country/change-status', {model: modelName, id: primaryKey})
                .success(function (response) {
                    $('.butterbar').removeClass('active').addClass('hide');
                    callback(response);
                }, function (x) {
                    response = {success: false, message: 'Server Error'};
                    callback(response);
                });
    }
    
    function UpdatePrintUser(modelName, primaryKey, callback) {
        var response;
        $http.post($rootScope.IRISOrgServiceUrl + '/country/update-printoption', {model: modelName, id: primaryKey})
                .success(function (response) {
                    callback(response);
                }, function (x) {
                    response = {success: false, message: 'Server Error'};
                    callback(response);
                });
    }

    function GetDiagnosisList(callback) {
        var response;

        $http.get($rootScope.IRISOrgServiceUrl + '/default/get-diagnosis-list')
                .success(function (response) {
                    callback(response);
                }, function (x) {
                    response = {success: false, message: 'Server Error'};
                    callback(response);
                });
    }

    function GetDsmivList(axis, callback) {
        var response;

        $http.get($rootScope.IRISOrgServiceUrl + '/default/get-dsmiv?axis=' + axis)
                .success(function (response) {
                    callback(response);
                }, function (x) {
                    response = {success: false, message: 'Server Error'};
                    callback(response);
                });
    }

    function GetCountryList(callback) {
        var response;

        $http.get($rootScope.IRISOrgServiceUrl + '/default/get-country-list')
                .success(function (response) {
                    callback(response);
                }, function (x) {
                    response = {success: false, message: 'Server Error'};
                    callback(response);
                });
    }

    function GetStateList(callback,country) {
        var response;
        if(country==null){country=''}
        $http.get($rootScope.IRISOrgServiceUrl + '/default/get-state-list?country='+country)
                .success(function (response) {
                    callback(response);
                }, function (x) {
                    response = {success: false, message: 'Server Error'};
                    callback(response);
                });
    }

    function GetCityList(callback,state) {
        var response;
        if(state==null){state=''}
        $http.get($rootScope.IRISOrgServiceUrl + '/default/get-city-list?state='+state)
                .success(function (response) {
                    callback(response);
                }, function (x) {
                    response = {success: false, message: 'Server Error'};
                    callback(response);
                });
    }

    function GetPasswordResetAccess(token, callback) {
        var response;

        $http.post($rootScope.IRISOrgServiceUrl + '/user/check-reset-password', {'token': token})
                .success(function (response) {
                    callback(response);
                }, function (x) {
                    response = {success: false, message: 'Server Error'};
                    callback(response);
                });
    }

    function GetTitleCodes(callback) {
        var response = [{value: 'Mr.', label: 'Mr.'}, {value: 'Mrs.', label: 'Mrs.'}, {value: 'Miss.', label: 'Miss.'}, {value: 'Dr.', label: 'Dr.'}, {value: 'Master.', label: 'Master.'}];
        callback(response);
    }

    function GetDay(callback) {
        var response = [{value: '01', label: '01'}, {value: '02', label: '02'}, {value: '03', label: '03'}, {value: '04', label: '04'}, {value: '05', label: '05'},
            {value: '06', label: '06'}, {value: '07', label: '07'}, {value: '08', label: '08'}, {value: '09', label: '09'}, {value: '10', label: '10'},
            {value: '11', label: '11'}, {value: '12', label: '12'}, {value: '13', label: '13'}, {value: '14', label: '14'}, {value: '15', label: '15'},
            {value: '16', label: '16'}, {value: '17', label: '17'}, {value: '18', label: '18'}, {value: '19', label: '19'}, {value: '20', label: '20'},
            {value: '21', label: '21'}, {value: '22', label: '22'}, {value: '23', label: '23'}, {value: '24', label: '24'}, {value: '25', label: '25'},
            {value: '26', label: '26'}, {value: '27', label: '27'}, {value: '28', label: '28'}, {value: '29', label: '29'}, {value: '30', label: '30'}, {value: '31', label: '31'}];
        callback(response);
    }

    function GetMonth(callback) {
        var response = [{value: '01', label: '01'}, {value: '02', label: '02'}, {value: '03', label: '03'}, {value: '04', label: '04'}, {value: '05', label: '05'},
            {value: '06', label: '06'}, {value: '07', label: '07'}, {value: '08', label: '08'}, {value: '09', label: '09'}, {value: '10', label: '10'},
            {value: '11', label: '11'}, {value: '12', label: '12'}];
        callback(response);
    }

    function GetYear(callback) {
        var year = new Date().getFullYear();
        var new_year = year + 3;
        var range = [];
        for (var i = 0; i < 10; i++) {
            range.push({value: new_year - i, label: new_year - i});
        }
        callback(range);
    }

    function GetMaritalStatus(callback) {
        var response = [
            {value: 'C', label: 'Children'},
            {value: 'U', label: 'Un married'},
            {value: 'M', label: 'Married'},
            {value: 'S', label: 'Separated'},
            {value: 'D', label: 'Divorced'},
            {value: 'W', label: 'Widow'}
        ];
        callback(response);
    }

    function GetCareTaker(callback) {
        var response = [
            {value: 1, label: 'Father'},
            {value: 2, label: 'Mother'},
            {value: 3, label: 'Husband'},
            {value: 4, label: 'Wife'},
            {value: 5, label: 'Son'},
            {value: 6, label: 'Daughter'},
            {value: 7, label: 'Friend'},
            {value: 8, label: 'Other'},
        ];
        callback(response);
    }

    function GetTenantList(callback) {
        var response;

        $http.get($rootScope.IRISOrgServiceUrl + '/default/get-tenant-list')
                .success(function (response) {
                    callback(response);
                }, function (x) {
                    response = {success: false, message: 'Server Error'};
                    callback(response);
                });
    }

    function GetFloorList(tenant, sts, del_sts, callback) {
        var response;

        $http.get($rootScope.IRISOrgServiceUrl + '/floor/getfloorlist?tenant=' + tenant + '&status=' + sts + '&deleted=' + del_sts)
                .success(function (response) {
                    callback(response);
                }, function (x) {
                    response = {success: false, message: 'Server Error'};
                    callback(response);
                });
    }

    function GetRoomChargeCategoryList(tenant, sts, del_sts, callback) {
        var response;

        $http.get($rootScope.IRISOrgServiceUrl + '/roomchargecategory/getroomchargecategorylist?tenant=' + tenant + '&status=' + sts + '&deleted=' + del_sts)
                .success(function (response) {
                    callback(response);
                }, function (x) {
                    response = {success: false, message: 'Server Error'};
                    callback(response);
                });
    }

    function GetRoomChargeSubCategoryList(tenant, sts, del_sts, cat_id, callback) {
        var response;

        $http.get($rootScope.IRISOrgServiceUrl + '/roomchargesubcategory/getroomchargesubcategorylist?tenant=' + tenant + '&status=' + sts + '&deleted=' + del_sts + '&cat_id=' + cat_id)
                .success(function (response) {
                    callback(response);
                }, function (x) {
                    response = {success: false, message: 'Server Error'};
                    callback(response);
                });
    }

    function GetRoomChargeItemList(tenant, sts, del_sts, callback) {
        var response;

        $http.get($rootScope.IRISOrgServiceUrl + '/roomchargeitem/getroomchargeitemlist?tenant=' + tenant + '&status=' + sts + '&deleted=' + del_sts)
                .success(function (response) {
                    callback(response);
                }, function (x) {
                    response = {success: false, message: 'Server Error'};
                    callback(response);
                });
    }

    function GetRoomTypeList(tenant, sts, del_sts, callback) {
        var response;

        $http.get($rootScope.IRISOrgServiceUrl + '/roomtype/getroomtypelist?tenant=' + tenant + '&status=' + sts + '&deleted=' + del_sts)
                .success(function (response) {
                    callback(response);
                }, function (x) {
                    response = {success: false, message: 'Server Error'};
                    callback(response);
                });
    }

    function GetWardList(tenant, sts, del_sts, callback) {
        var response;

        $http.get($rootScope.IRISOrgServiceUrl + '/ward/getwardlist?tenant=' + tenant + '&status=' + sts + '&deleted=' + del_sts)
                .success(function (response) {
                    callback(response);
                }, function (x) {
                    response = {success: false, message: 'Server Error'};
                    callback(response);
                });
    }

    function GetRoomMaintenanceList(tenant, sts, del_sts, callback) {
        var response;

        $http.get($rootScope.IRISOrgServiceUrl + '/roommaintenance/getmaintenancelist?tenant=' + tenant + '&status=' + sts + '&deleted=' + del_sts)
                .success(function (response) {
                    callback(response);
                }, function (x) {
                    response = {success: false, message: 'Server Error'};
                    callback(response);
                });
    }

    function GetPatientCateogryList(sts, del_sts, callback) {
        var response;

        $http.get($rootScope.IRISOrgServiceUrl + '/patientcategory/getpatientcategorylist?status=' + sts + '&deleted=' + del_sts)
                .success(function (response) {
                    callback(response);
                }, function (x) {
                    response = {success: false, message: 'Server Error'};
                    callback(response);
                });
    }

    function GetChargePerSubCategoryList(del_sts, cat_id, callback) {
        var response;

        $http.get($rootScope.IRISOrgServiceUrl + '/chargepersubcategory/getchargepersubcategorylist?deleted=' + del_sts + '&cat_id=' + cat_id)
//        $http.get($rootScope.IRISOrgServiceUrl + '/chargepersubcategory/getroomchargesubcategorylist?deleted=' + del_sts + '&cat_id=' + cat_id)
                .success(function (response) {
                    callback(response);
                }, function (x) {
                    response = {success: false, message: 'Server Error'};
                    callback(response);
                });
    }

    function GetSpecialityList(tenant, sts, del_sts, callback) {
        var response;

        $http.get($rootScope.IRISOrgServiceUrl + '/speciality/getspecialitylist?tenant=' + tenant + '&status=' + sts + '&deleted=' + del_sts)
                .success(function (response) {
                    callback(response);
                }, function (x) {
                    response = {success: false, message: 'Server Error'};
                    callback(response);
                });
    }

    function GetInternalCodeList(tenant, code_type, sts, del_sts, callback) {
        var response;

        $http.get($rootScope.IRISOrgServiceUrl + '/internalcode/getinternalcode?tenant=' + tenant + '&code_type=' + code_type + '&status=' + sts + '&deleted=' + del_sts)
                .success(function (response) {
                    callback(response);
                }, function (x) {
                    response = {success: false, message: 'Server Error'};
                    callback(response);
                });
    }

    function GetDoctorList(tenant, sts, del_sts, care_provider, callback, addtfields) {
        var response;

        $http.get($rootScope.IRISOrgServiceUrl + '/user/getdoctorslist?tenant=' + tenant + '&status=' + sts + '&deleted=' + del_sts + '&care_provider=' + care_provider + '&addtfields=' + addtfields)
                .success(function (response) {
                    callback(response);
                }, function (x) {
                    response = {success: false, message: 'Server Error'};
                    callback(response);
                });
    }

    function GetDoctorListForPatient(tenant, sts, del_sts, care_provider, patient_guid, callback) {
        var response;

        $http.get($rootScope.IRISOrgServiceUrl + '/user/getdoctorslistforpatient?tenant=' + tenant + '&status=' + sts + '&deleted=' + del_sts + '&care_provider=' + care_provider + '&patient_guid=' + patient_guid)
                .success(function (response) {
                    callback(response);
                }, function (x) {
                    response = {success: false, message: 'Server Error'};
                    callback(response);
                });
    }

    function GetDayList(callback) {
        var response = [{value: '1', label: 'Monday'}, {value: '2', label: 'Tuesday'}, {value: '3', label: 'Wednesday'}, {value: '4', label: 'Thursday'}, {value: '5', label: 'Friday'}, {value: '6', label: 'Saturday'}, {value: '7', label: 'Sunday'}];
        callback(response);
    }

    function CheckStateAccess(url, callback) {
        var splittedStringArray = url.split("(");
        url = splittedStringArray[0];
        callback(AuthenticationService.getCurrentUser().resources.hasOwnProperty(url));
    }

    function GetGenderList(callback) {
        var response = [{value: 'M', label: 'Male'}, {value: 'F', label: 'Female'}, {value: 'O', label: 'Other'}];
        callback(response);
    }

    function GetPatientBillingList(callback) {
        var response = [{value: 'N', label: 'Normal'}, {value: 'F', label: 'Free'}];
        callback(response);
    }

    function GetPatientRegisterModelList(callback) {
        var response = [{value: 'OP', label: 'OP'}, {value: 'IP', label: 'IP'}, {value: 'NO', label: 'None'}];
        callback(response);
    }

    function GetPatientAppointmentStatus(callback) {
        var response = [{value: 'B', label: 'Booked'}, {value: 'A', label: 'Arrived'}];
        callback(response);
    }

    function GetRoomList(tenant, sts, del_sts, occupied_status, callback) {
        var response;

        $http.get($rootScope.IRISOrgServiceUrl + '/room/getroomlist?tenant=' + tenant + '&status=' + sts + '&deleted=' + del_sts + '&occupied_status=' + occupied_status)
                .success(function (response) {
                    callback(response);
                }, function (x) {
                    response = {success: false, message: 'Server Error'};
                    callback(response);
                });
    }

    function GetEncounterListByPatient(tenant, sts, del_sts, pat_id, callback, addtfields, only, old_encounter, limit) {
        var response;

        $http.get($rootScope.IRISOrgServiceUrl + '/encounter/getencounterlistbypatient?tenant=' + tenant + '&status=' + sts + '&deleted=' + del_sts + '&patient_id=' + pat_id + '&addtfields=' + addtfields + '&only=' + only + '&old_encounter=' + old_encounter + '&limit=' + limit)
                .success(function (response) {
                    callback(response);
                }, function (x) {
                    response = {success: false, message: 'Server Error'};
                    callback(response);
                });
    }

    function GetEncounterListByTenantSamePatient(tenant, sts, del_sts, pat_id, callback, addtfields, only, old_encounter) {
        var response;

        $http.get($rootScope.IRISOrgServiceUrl + '/encounter/getencounterlistbytenantsamepatient?tenant=' + tenant + '&status=' + sts + '&deleted=' + del_sts + '&patient_id=' + pat_id + '&addtfields=' + addtfields + '&only=' + only + '&old_encounter=' + old_encounter)
                .success(function (response) {
                    callback(response);
                }, function (x) {
                    response = {success: false, message: 'Server Error'};
                    callback(response);
                });
    }

    function GetEncounterListByPatientAndType(tenant, sts, del_sts, pat_id, pat_type, callback) {
        var response;

        $http.get($rootScope.IRISOrgServiceUrl + '/encounter/getencounterlistbypatient?tenant=' + tenant + '&status=' + sts + '&deleted=' + del_sts + '&patient_id=' + pat_id + '&encounter_type=' + pat_type)
                .success(function (response) {
                    callback(response);
                }, function (x) {
                    response = {success: false, message: 'Server Error'};
                    callback(response);
                });
    }

    function GetChargeCategoryList(tenant, sts, del_sts, code, callback) {
        var response;

        $http.get($rootScope.IRISOrgServiceUrl + '/roomchargecategory/getchargelist?tenant=' + tenant + '&status=' + sts + '&deleted=' + del_sts + '&code=' + code)
                .success(function (response) {
                    callback(response);
                }, function (x) {
                    response = {success: false, message: 'Server Error'};
                    callback(response);
                });
    }

    function GetPatientList(tenant, sts, del_sts, callback) {
        var response;

        $http.get($rootScope.IRISOrgServiceUrl + '/patient/getpatientlist?tenant=' + tenant + '&status=' + sts + '&deleted=' + del_sts)
                .success(function (response) {
                    callback(response);
                }, function (x) {
                    response = {success: false, message: 'Server Error'};
                    callback(response);
                });
    }

    function GetAlertList(tenant, sts, del_sts, callback) {
        var response;

        $http.get($rootScope.IRISOrgServiceUrl + '/alert/getalertlist?tenant=' + tenant + '&status=' + sts + '&deleted=' + del_sts)
                .success(function (response) {
                    callback(response);
                }, function (x) {
                    response = {success: false, message: 'Server Error'};
                    callback(response);
                });
    }

    function GetBloodList(callback) {
        var response = [{value: 'O−', label: 'O−'}, {value: 'O+', label: 'O+'}, {value: 'A−', label: 'A−'}, {value: 'A−', label: 'A−'}, {value: 'A+', label: 'A+'}, {value: 'B−', label: 'B−'}, {value: 'B+', label: 'B+'}, {value: 'AB−', label: 'AB−'}, {value: 'AB+', label: 'AB+'}];
        callback(response);
    }

    function GetIntervalList(callback) {
        var response = [];
        for (var i = 1; i <= 60; i++) {
            response.push({value: i, label: i + ' Min'});
        }
        callback(response);
    }

    function GetDrugClassList(tenant, sts, del_sts, notUsed, callback) {
        var response;

        $http.get($rootScope.IRISOrgServiceUrl + '/pharmacydrugclass/getdruglist?tenant=' + tenant + '&status=' + sts + '&deleted=' + del_sts + '&notUsed=' + notUsed)
                .success(function (response) {
                    callback(response);
                }, function (x) {
                    response = {success: false, message: 'Server Error'};
                    callback(response);
                });
    }

    function GetGenericList(tenant, sts, del_sts, notUsed, callback) {
        var response;

        $http.get($rootScope.IRISOrgServiceUrl + '/genericname/getgenericlist?tenant=' + tenant + '&status=' + sts + '&deleted=' + del_sts + '&notUsed=' + notUsed)
                .success(function (response) {
                    callback(response);
                }, function (x) {
                    response = {success: false, message: 'Server Error'};
                    callback(response);
                });
    }

    function GetPaymentType(callback) {
        var response = [{value: 'CA', label: 'Cash'}, {value: 'CR', label: 'Credit'}];
        callback(response);
    }

    function GetSupplierList(tenant, sts, del_sts, callback) {
        var response;

        $http.get($rootScope.IRISOrgServiceUrl + '/pharmacysupplier/getsupplierlist?tenant=' + tenant + '&status=' + sts + '&deleted=' + del_sts)
                .success(function (response) {
                    callback(response);
                }, function (x) {
                    response = {success: false, message: 'Server Error'};
                    callback(response);
                });
    }

    function GetProductList(tenant, sts, del_sts, callback) {
        var response;

        $http.get($rootScope.IRISOrgServiceUrl + '/pharmacyproduct/getproductlist?tenant=' + tenant + '&status=' + sts + '&deleted=' + del_sts)
                .success(function (response) {
                    callback(response);
                }, function (x) {
                    response = {success: false, message: 'Server Error'};
                    callback(response);
                });
    }

    function GetProductListByName(name, callback) {
        var response;

        $http.get($rootScope.IRISOrgServiceUrl + '/pharmacyproduct/getproductlistbyname?name=' + name)
                .success(function (response) {
                    callback(response);
                }, function (x) {
                    response = {success: false, message: 'Server Error'};
                    callback(response);
                });
    }

    function GetDrugClassListByName(name, callback) {
        var response;

        $http.get($rootScope.IRISOrgServiceUrl + '/pharmacyproduct/getdrugclasslistbyname?name=' + name)
                .success(function (response) {
                    callback(response);
                }, function (x) {
                    response = {success: false, message: 'Server Error'};
                    callback(response);
                });
    }

    function GetPackageUnitList(tenant, sts, del_sts, callback) {
        var response;

        $http.get($rootScope.IRISOrgServiceUrl + '/pharmacypacking/getpackinglist?tenant=' + tenant + '&status=' + sts + '&deleted=' + del_sts)
                .success(function (response) {
                    callback(response);
                }, function (x) {
                    response = {success: false, message: 'Server Error'};
                    callback(response);
                });
    }

    function GetBatchListByProduct(product_id, callback, addtfields, only) {
        var response;

        $http.get($rootScope.IRISOrgServiceUrl + '/pharmacyproductbatch/getbatchbyproduct?product_id=' + product_id + '&addtfields=' + addtfields + '&only=' + only)
                .success(function (response) {
                    callback(response);
                }, function (x) {
                    response = {success: false, message: 'Server Error'};
                    callback(response);
                });
    }

    function GetPatientRoute(tenant, sts, del_sts, callback) {
        var response;

        $http.get($rootScope.IRISOrgServiceUrl + '/patient/getpatientroutelist?tenant=' + tenant + '&status=' + sts + '&deleted=' + del_sts)
                .success(function (response) {
                    callback(response);
                }, function (x) {
                    response = {success: false, message: 'Server Error'};
                    callback(response);
                });
    }

    function GetPatientGroup(sts, del_sts, callback) {
        var response;

        $http.get($rootScope.IRISOrgServiceUrl + '/patientgroup/getpatientgrouplist?status=' + sts + '&deleted=' + del_sts)
                .success(function (response) {
                    callback(response);
                }, function (x) {
                    response = {success: false, message: 'Server Error'};
                    callback(response);
                });
    }
    function GetHsnCode(sts, del_sts, callback) {
        var response;

        $http.get($rootScope.IRISOrgServiceUrl + '/hsn/gethsncodelist?status=' + sts + '&deleted=' + del_sts)
                .success(function (response) {
                    callback(response);
                }, function (x) {
                    response = {success: false, message: 'Server Error'};
                    callback(response);
                });
    }

    function GetGstCode(tenant, sts, del_sts, callback) {
        var response;

        $http.get($rootScope.IRISOrgServiceUrl + '/pharmacygst/getgstlist?tenant=' + tenant + '&status=' + sts + '&deleted=' + del_sts)
                .success(function (response) {
                    callback(response);
                }, function (x) {
                    response = {success: false, message: 'Server Error'};
                    callback(response);
                });
    }

    function GetPatientFrequency(tenant, sts, del_sts, callback) {
        var response;

        $http.get($rootScope.IRISOrgServiceUrl + '/patient/getpatientfrequencylist?tenant=' + tenant + '&status=' + sts + '&deleted=' + del_sts)
                .success(function (response) {
                    callback(response);
                }, function (x) {
                    response = {success: false, message: 'Server Error'};
                    callback(response);
                });
    }

    function GetLabelFromValue(val, func, callback) {
        if (func == 'GetGenderList') {
            $rootScope.commonService.GetGenderList(function (response) {
                $rootScope.commonService.FoundVlaue(val, response, function (response2) {
                    callback(response2);
                });
            });
        }
        if (func == 'GetPatientBillingList') {
            $rootScope.commonService.GetPatientBillingList(function (response) {
                $rootScope.commonService.FoundVlaue(val, response, function (response2) {
                    callback(response2);
                });
            });
        }
        if (func == 'GetPatientRegisterModelList') {
            $rootScope.commonService.GetPatientRegisterModelList(function (response) {
                $rootScope.commonService.FoundVlaue(val, response, function (response2) {
                    callback(response2);
                });
            });
        }
        if (func == 'GetMaritalStatus') {
            $rootScope.commonService.GetMaritalStatus(function (response) {
                $rootScope.commonService.FoundVlaue(val, response, function (response2) {
                    callback(response2);
                });
            });
        }
        if (func == 'GetBloodList') {
            $rootScope.commonService.GetBloodList(function (response) {
                $rootScope.commonService.FoundVlaue(val, response, function (response2) {
                    callback(response2);
                });
            });
        }
        if (func == 'GetCareTaker') {
            $rootScope.commonService.GetCareTaker(function (response) {
                $rootScope.commonService.FoundVlaue(val, response, function (response2) {
                    callback(response2);
                });
            });
        }
    }

    function FoundVlaue(val, response, callback) {
        var result;
        var found = $filter('filter')(response, {value: val}, true);
        if (found.length) {
            result = found[0].label;
        }
        callback(result);
    }

    function GetRoomTypesRoomsList(tenant, callback) {
        var response;

        $http.get($rootScope.IRISOrgServiceUrl + '/roomtype/getroomtypesroomslist?tenant=' + tenant)
                .success(function (response) {
                    callback(response);
                }, function (x) {
                    response = {success: false, message: 'Server Error'};
                    callback(response);
                });
    }

    function GetBrandsList(tenant, sts, del_sts, callback) {
        var response;

        $http.get($rootScope.IRISOrgServiceUrl + '/pharmacybrandrep/getallbrands?tenant=' + tenant + '&status=' + sts + '&deleted=' + del_sts)
                .success(function (response) {
                    callback(response);
                }, function (x) {
                    response = {success: false, message: 'Server Error'};
                    callback(response);
                });
    }

    function GetDivisionsList(tenant, sts, del_sts, callback) {
        var response;

        $http.get($rootScope.IRISOrgServiceUrl + '/pharmacybrandrep/getalldivisions?tenant=' + tenant + '&status=' + sts + '&deleted=' + del_sts)
                .success(function (response) {
                    callback(response);
                }, function (x) {
                    response = {success: false, message: 'Server Error'};
                    callback(response);
                });
    }

    function GetProductUnitsList(sts, del_sts, callback) {
        var response;
//        var response = [
//            {value: 'MG', label: 'MG'},
//            {value: 'ML', label: 'ML'},
//            {value: 'G', label: 'G'}
//        ];
        $http.get($rootScope.IRISOrgServiceUrl + '/pharmacyproductunit/getproductunitlist?status=' + sts + '&deleted=' + del_sts)
                .success(function (response) {
                    callback(response);
                }, function (x) {
                    response = {success: false, message: 'Server Error'};
                    callback(response);
                });
        //callback(response);
    }

    function GetProductDescriptionList(tenant, sts, del_sts, callback) {
        var response;

        $http.get($rootScope.IRISOrgServiceUrl + '/pharmacyproduct/getproductdescriptionlist?tenant=' + tenant + '&status=' + sts + '&deleted=' + del_sts)
                .success(function (response) {
                    callback(response);
                }, function (x) {
                    response = {success: false, message: 'Server Error'};
                    callback(response);
                });
    }

    function GetVatList(tenant, sts, del_sts, callback) {
        var response;

        $http.get($rootScope.IRISOrgServiceUrl + '/pharmacyvat/getvatlist?tenant=' + tenant + '&status=' + sts + '&deleted=' + del_sts)
                .success(function (response) {
                    callback(response);
                }, function (x) {
                    response = {success: false, message: 'Server Error'};
                    callback(response);
                });
    }

    function GetPaymentModes(callback) {
        var response = [
            {value: 'CA', label: 'Cash'},
            {value: 'CD', label: 'Card'},
            {value: 'ON', label: 'Online'},
            {value: 'CH', label: 'Cheque'},
        ];
        callback(response);
    }

    function GetCardTypes(callback) {
        var response = [
            {value: 'Visa', label: 'Visa'},
            {value: 'MasterCard', label: 'MasterCard'},
            {value: 'Maestro', label: 'Maestro'},
            {value: 'Visa Debit', label: 'Visa Debit'},
            {value: 'MasterCard Debit', label: 'MasterCard Debit'},
            {value: 'Rupay', label: 'Rupay'},
        ];
        callback(response);
    }

    function GetDischargeTypes(callback) {
        var response = [
            {value: 'RE', label: 'Recovered'},
            {value: 'DT', label: 'Death'},
            {value: 'DA', label: 'DAMA-Discharge Against Medical Advice'},
            {value: 'AT', label: 'At Request'},
            {value: 'AB', label: 'Abscond'},
        ];
        callback(response);
    }

    function CheckAdminAccess(callback) {
        var ret = false;
        var currentUser = AuthenticationService.getCurrentUser();
        var loggedIn = Boolean(currentUser);

        if (loggedIn) {
            ret = currentUser.credentials.tenant_id == 0;
        }
        callback(ret);
    }

    function GetSaleGroups(tenant, sts, del_sts, callback) {
        var response;

        $http.get($rootScope.IRISOrgServiceUrl + '/pharmacyreport/getsalegrouplist?tenant=' + tenant + '&status=' + sts + '&deleted=' + del_sts)
                .success(function (response) {
                    callback(response);
                }, function (x) {
                    response = {success: false, message: 'Server Error'};
                    callback(response);
                });
    }
}