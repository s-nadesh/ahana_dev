'use strict';
/**
 * Config for the router
 */

angular.module('app')
        .run(run)
        .config(config);
config.$inject = ['$stateProvider', '$urlRouterProvider', '$httpProvider', 'ivhTreeviewOptionsProvider', 'JQ_CONFIG', 'hotkeysProvider', '$compileProvider', 'KeepaliveProvider', 'IdleProvider'];
function config($stateProvider, $urlRouterProvider, $httpProvider, ivhTreeviewOptionsProvider, JQ_CONFIG, hotkeysProvider, $compileProvider, KeepaliveProvider, IdleProvider) {

//    hotkeysProvider.template = '<div class="my-own-cheatsheet">Hai</div>';
    $compileProvider.debugInfoEnabled(false);
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
    ivhTreeviewOptionsProvider.set({
        twistieExpandedTpl: '<i class="fa fa-caret-right"></i>',
        twistieCollapsedTpl: '<i class="fa fa-caret-down"></i>',
        twistieLeafTpl: '',
    });
    IdleProvider.idle(300);
    IdleProvider.timeout(10);
    KeepaliveProvider.interval(10);
//    var newBaseUrl = "";
//
//    if (window.location.hostname == "localhost") {
//        newBaseUrl = "http://hms.ark/api/IRISORG/web/v1";
//    } else {
////        var deployedAt = window.location.href.substring(0, window.location.href);
//        newBaseUrl = "http://demo.arkinfotec.in/ahana/demo/api/IRISORG/web/v1";
//    }
//    RestangularProvider.setBaseUrl(newBaseUrl);

    $urlRouterProvider
            .otherwise('/access/signin');
    $stateProvider
            .state('access', {
                url: '/access',
                template: '<div ui-view class="fade-in-right-big smooth"></div>'
            })
            //SIGNIN
            .state('access.signin', {
                url: '/signin',
                templateUrl: 'tpl/page_signin.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['js/controllers/signin.js?v=' + APP_VERSION]);
                        }]
                }
            })
            //FORGOT PASSWORD
            .state('access.forgotpwd', {
                url: '/forgotpwd',
                templateUrl: 'tpl/page_forgotpwd.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['js/controllers/signin.js?v=' + APP_VERSION]);
                        }]
                }
            })
            //RESET PASSWORD
            .state('access.resetpwd', {
                url: '/resetpwd?token=',
                templateUrl: 'tpl/page_resetpwd.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['js/controllers/signin.js?v=' + APP_VERSION]);
                        }]
                }
            })
            //LOGOUT
            .state('access.logout', {
                url: '/forgotpwd',
                templateUrl: 'tpl/page_forgotpwd.html'
            })
            //404 PAGE
            .state('access.404', {
                url: '/404',
                templateUrl: 'tpl/page_404.html'
            })

            .state('configuration', {
                abstract: true,
                url: '/configuration',
                templateUrl: 'tpl/configuration.html',
            })
            //401 PAGE
            .state('configuration.401', {
                url: '/401',
                templateUrl: 'tpl/page_401.html'
            })

            //Pharmacy hsn
            .state('configuration.hsn', {
                url: '/hsn',
                templateUrl: 'tpl/hsn/index.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('tpl/hsn/hsn.js?v=' + APP_VERSION);
                        }]
                }
            })
            .state('configuration.hsn_create', {
                url: '/hsn_create',
                templateUrl: 'tpl/hsn/create.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/hsn/hsn.js?v=' + APP_VERSION]);
                        }]
                }
            })
            .state('configuration.hsn_update', {
                url: '/hsn_update/{id}',
                templateUrl: 'tpl/hsn/update.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/hsn/hsn.js?v=' + APP_VERSION]);
                        }]
                }
            })
            .state('configuration.roles', {
                url: '/roles',
                templateUrl: 'tpl/roles/index.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('tpl/roles/roles.js?v=' + APP_VERSION);
                        }]
                }
            })
            .state('configuration.role_create', {
                url: '/role_create',
                templateUrl: 'tpl/roles/create.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/roles/roles.js?v=' + APP_VERSION]);
                        }]
                }
            })
            .state('configuration.role_update', {
                url: '/role_update/{id}',
                templateUrl: 'tpl/roles/update.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/roles/roles.js?v=' + APP_VERSION]);
                        }]
                }
            })
            //ORGANIZATION VIEW
            .state('configuration.organization', {
                url: '/organization',
                templateUrl: 'tpl/organization/index.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['xeditable', 'smart-table']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/organization/org.js?v=' + APP_VERSION);
                                    }
                            );
                        }]

                }
            })
            //CONFIGURATION USER REGISTRATION
            .state('configuration.registration', {
                url: '/registration/{mode}',
                templateUrl: 'tpl/registration/index.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('tpl/registration/registration.js?v=' + APP_VERSION);
                        }]
                }
            })
            .state('configuration.user_create', {
                url: '/user_create',
                templateUrl: 'tpl/registration/create.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load([
                                'tpl/registration/registration.js?v=' + APP_VERSION,
                                'tpl/modal_form/modal.country.js?v=' + APP_VERSION,
                                'tpl/modal_form/modal.state.js?v=' + APP_VERSION,
                                'tpl/modal_form/modal.city.js?v=' + APP_VERSION
                            ]);
                        }]
                }
            })
            .state('configuration.user_update', {
                url: '/user_update/{id}',
                templateUrl: 'tpl/registration/update.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load([
                                'tpl/registration/registration.js?v=' + APP_VERSION,
                                'tpl/modal_form/modal.country.js?v=' + APP_VERSION,
                                'tpl/modal_form/modal.state.js?v=' + APP_VERSION,
                                'tpl/modal_form/modal.city.js?v=' + APP_VERSION
                            ]);
                        }]
                }
            })
            //CONFIGURATION LOGIN UPDATE
            .state('configuration.login_update', {
                url: '/login_update/{id}',
                templateUrl: 'tpl/registration/login_update.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/registration/registration.js?v=' + APP_VERSION]);
                        }]
                }
            })
            //CONFIGURATION MODULES
            .state('configuration.organizationModule', {
                url: '/organizationModule',
                templateUrl: 'tpl/organization_module/index.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('smart-table').then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/organization_module/org_module.js?v=' + APP_VERSION);
                                    }
                            );
                        }]

                }
            })
            //CONFIGURATION ROLES MODULES ASSIGN
            .state('configuration.roleRights', {
                url: '/roleRights',
                templateUrl: 'tpl/role_rights/index.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/role_rights/role_rights.js?v=' + APP_VERSION]);
                        }]
                }
            })
            //CONFIGURATION USERS ROLES ASSIGN
            .state('configuration.userRoles', {
                url: '/userRoles',
                templateUrl: 'tpl/user_roles/index.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/user_roles/user_roles.js?v=' + APP_VERSION]);
                        }]
                }
            })
            //CONFIGURATION USER BRANCHES ASSIGN
            .state('configuration.userBranches', {
                url: '/userBranches',
                templateUrl: 'tpl/user_branches/index.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/user_branches/user_branches.js?v=' + APP_VERSION]);
                        }]
                }
            })
            //CONFIGURATION FLOOR
            .state('configuration.floors', {
                url: '/floors',
                templateUrl: 'tpl/floors/index.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('tpl/floors/floors.js?v=' + APP_VERSION);
                        }]
                }
            })
            .state('configuration.floor_create', {
                url: '/floor_create',
                templateUrl: 'tpl/floors/create.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/floors/floors.js?v=' + APP_VERSION]);
                        }]
                }
            })
            .state('configuration.floor_update', {
                url: '/floor_update/{id}',
                templateUrl: 'tpl/floors/update.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/floors/floors.js?v=' + APP_VERSION]);
                        }]
                }
            })

            //Room Maintenance
            .state('configuration.roomMaintenance', {
                url: '/roomMaintenance',
                templateUrl: 'tpl/room_maintenance/index.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('smart-table').then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/room_maintenance/room_maintenance.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })
            .state('configuration.roomMaintenanceCreate', {
                url: '/roomMaintenanceCreate',
                templateUrl: 'tpl/room_maintenance/create.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/room_maintenance/room_maintenance.js?v=' + APP_VERSION]);
                        }]
                }
            })
            .state('configuration.roomMaintenanceUpdate', {
                url: '/roomMaintenanceUpdate/{id}',
                templateUrl: 'tpl/room_maintenance/update.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/room_maintenance/room_maintenance.js?v=' + APP_VERSION]);
                        }]
                }
            })
            //CONFIGURATION WARD
            .state('configuration.wards', {
                url: '/wards',
                templateUrl: 'tpl/wards/index.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('tpl/wards/wards.js?v=' + APP_VERSION);
                        }]
                }
            })
            .state('configuration.ward_create', {
                url: '/ward_create',
                templateUrl: 'tpl/wards/create.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/wards/wards.js?v=' + APP_VERSION]);
                        }]
                }
            })
            .state('configuration.ward_update', {
                url: '/ward_update/{id}',
                templateUrl: 'tpl/wards/update.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/wards/wards.js?v=' + APP_VERSION]);
                        }]
                }
            })
            //CONFIGURATION ROOM CHARGE CATEGORY
            .state('configuration.roomChargeCategory', {
                url: '/roomChargeCategory',
                templateUrl: 'tpl/room_charge_category/index.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('xeditable').then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/room_charge_category/room_charge_category.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })
            .state('configuration.roomChargeCategoryCreate', {
                url: '/roomChargeCategoryCreate',
                templateUrl: 'tpl/room_charge_category/create.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('xeditable').then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/room_charge_category/room_charge_category.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })
            .state('configuration.roomChargeCategoryUpdate', {
                url: '/roomChargeCategoryUpdate/{id}',
                templateUrl: 'tpl/room_charge_category/update.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('xeditable').then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/room_charge_category/room_charge_category.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })
            //CONFIGURATION ALLIED CHARGE
            .state('configuration.alliedCharge', {
                url: '/alliedCharge',
                params: {
                    code: 'ALC',
                },
                templateUrl: 'tpl/room_charge_category_custom/index.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('xeditable').then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/room_charge_category_custom/room_charge_category_custom.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })
            .state('configuration.alliedChargeCreate', {
                url: '/alliedChargeCreate/{cat_id}',
                templateUrl: 'tpl/room_charge_category_custom/create.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('xeditable').then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/room_charge_category_custom/room_charge_category_custom.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })
            .state('configuration.alliedChargeUpdate', {
                url: '/alliedChargeUpdate/{cat_id}/{id}',
                templateUrl: 'tpl/room_charge_category_custom/update.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('xeditable').then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/room_charge_category_custom/room_charge_category_custom.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

            //Shortcut for myworks other charges
            .state('myworks.addother_charges', {
                url: '/addother_charges',
                templateUrl: 'tpl/myshortcut/otherCharges.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('xeditable').then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/myshortcut/otherCharges.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })
            //Shortcut for myworks consultation visit
            .state('myworks.addconsultation_visit', {
                url: '/addconsultation_visit',
                templateUrl: 'tpl/myshortcut/addConsultation_visit.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('xeditable').then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/myshortcut/addConsultation_visit.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })
            //Shortcut for myworks procedure
            .state('myworks.addprocedure', {
                url: '/addprocedure',
                templateUrl: 'tpl/myshortcut/addProcedure.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['smart-table', 'ui.select']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/myshortcut/addProcedure.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })
            //Shortcut for myworks notes
            .state('myworks.addnotes', {
                url: '/addnotes',
                templateUrl: 'tpl/myshortcut/addNote.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('xeditable').then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/myshortcut/addNote.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })
            //Shortcut for myworks notes
            .state('myworks.addvitals', {
                url: '/addvitals',
                templateUrl: 'tpl/myshortcut/addVital.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('xeditable').then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/myshortcut/addVital.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

            //CONFIGURATION PROCEDURE CHARGE
            .state('configuration.procedure', {
                url: '/procedure',
                params: {
                    code: 'PRC',
                },
                templateUrl: 'tpl/room_charge_category_custom/index.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('xeditable').then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/room_charge_category_custom/room_charge_category_custom.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })
            .state('configuration.procedureChargeCreate', {
                url: '/procedureChargeCreate/{cat_id}',
                templateUrl: 'tpl/room_charge_category_custom/create.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('xeditable').then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/room_charge_category_custom/room_charge_category_custom.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })
            .state('configuration.procedureChargeUpdate', {
                url: '/procedureChargeUpdate/{cat_id}/{id}',
                templateUrl: 'tpl/room_charge_category_custom/update.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('xeditable').then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/room_charge_category_custom/room_charge_category_custom.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

            //CONFIGURATION ROOM CHARGE CATEGORY ITEM
            .state('configuration.roomChargeCategoryItem', {
                url: '/roomChargeCategoryItem',
                templateUrl: 'tpl/room_charge_category_item/index.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('tpl/room_charge_category_item/room_charge_category_item.js?v=' + APP_VERSION);
                        }]
                }
            })
            .state('configuration.roomChargeCategoryItemCreate', {
                url: '/roomChargeCategoryItemCreate',
                templateUrl: 'tpl/room_charge_category_item/create.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/room_charge_category_item/room_charge_category_item.js?v=' + APP_VERSION]);
                        }]
                }
            })
            .state('configuration.roomChargeCategoryItemUpdate', {
                url: '/roomChargeCategoryItemUpdate/{id}',
                templateUrl: 'tpl/room_charge_category_item/update.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/room_charge_category_item/room_charge_category_item.js?v=' + APP_VERSION]);
                        }]
                }
            })
            //Room Types
            .state('configuration.roomType', {
                url: '/roomType',
                templateUrl: 'tpl/room_type/index.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('smart-table').then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/room_type/room_type.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })
            .state('configuration.roomTypeCreate', {
                url: '/roomTypeCreate',
                templateUrl: 'tpl/room_type/create.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/room_type/room_type.js?v=' + APP_VERSION]);
                        }]
                }
            })
            .state('configuration.roomTypeUpdate', {
                url: '/roomTypeUpdate/{id}',
                templateUrl: 'tpl/room_type/update.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/room_type/room_type.js?v=' + APP_VERSION]);
                        }]
                }
            })

            //Room
            .state('configuration.room', {
                url: '/room',
                templateUrl: 'tpl/room/index.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('tpl/room/room.js?v=' + APP_VERSION);
                        }]
                }
            })
            .state('configuration.roomCreate', {
                url: '/roomCreate',
                templateUrl: 'tpl/room/create.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/room/room.js?v=' + APP_VERSION]);
                        }]
                }
            })
            .state('configuration.roomUpdate', {
                url: '/roomUpdate/{id}',
                templateUrl: 'tpl/room/update.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/room/room.js?v=' + APP_VERSION]);
                        }]
                }
            })
            .state('configuration.updateMaintenance', {
                url: '/updateMaintenance/{id}',
                templateUrl: 'tpl/room/update_maintenance.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/room/room.js?v=' + APP_VERSION]);
                        }]
                }
            })
            //Room Charge
            .state('configuration.roomCharge', {
                url: '/roomCharge',
                templateUrl: 'tpl/room_charge/index.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('smart-table').then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/room_charge/room_charge.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })
            .state('configuration.roomChargeCreate', {
                url: '/roomChargeCreate',
                templateUrl: 'tpl/room_charge/create.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/room_charge/room_charge.js?v=' + APP_VERSION]);
                        }]
                }
            })
            .state('configuration.roomChargeUpdate', {
                url: '/roomChargeUpdate/{id}',
                templateUrl: 'tpl/room_charge/update.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/room_charge/room_charge.js?v=' + APP_VERSION]);
                        }]
                }
            })
            //Room and Room Type
            .state('configuration.roomTypeRoom', {
                url: '/roomTypeRoom',
                templateUrl: 'tpl/room_types_rooms/index.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['smart-table']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/room_types_rooms/room_types_rooms.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })
            .state('configuration.roomTypeRoomUpdate', {
                url: '/roomTypeRoomUpdate/{room_id}',
                templateUrl: 'tpl/room_types_rooms/update.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/room_types_rooms/room_types_rooms.js?v=' + APP_VERSION]);
                        }]
                }
            })

            //Speciality
            .state('configuration.specialities', {
                url: '/specialities',
                templateUrl: 'tpl/specialities/index.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('tpl/specialities/speciality.js?v=' + APP_VERSION);
                        }]
                }
            })
            .state('configuration.specialityCreate', {
                url: '/specialityCreate',
                templateUrl: 'tpl/specialities/create.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/specialities/speciality.js?v=' + APP_VERSION]);
                        }]
                }
            })
            .state('configuration.specialityUpdate', {
                url: '/specialityUpdate/{id}',
                templateUrl: 'tpl/specialities/update.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/specialities/speciality.js?v=' + APP_VERSION]);
                        }]
                }
            })
            //CONFIGURATION MASTER COUNTRY
            .state('configuration.countries', {
                url: '/countries',
                templateUrl: 'tpl/countries/index.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('tpl/countries/countries.js?v=' + APP_VERSION);
                        }]
                }
            })
            .state('configuration.countryCreate', {
                url: '/countryCreate',
                templateUrl: 'tpl/countries/create.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/countries/countries.js?v=' + APP_VERSION]);
                        }]
                }
            })
            .state('configuration.countryUpdate', {
                url: '/countryUpdate/{id}',
                templateUrl: 'tpl/countries/update.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/countries/countries.js?v=' + APP_VERSION]);
                        }]
                }
            })
            //CONFIGURATION MASTER STATE
            .state('configuration.states', {
                url: '/states',
                templateUrl: 'tpl/states/index.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('tpl/states/states.js?v=' + APP_VERSION);
                        }]
                }
            })
            .state('configuration.stateCreate', {
                url: '/stateCreate',
                templateUrl: 'tpl/states/create.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/states/states.js?v=' + APP_VERSION]);
                        }]
                }
            })
            .state('configuration.stateUpdate', {
                url: '/stateUpdate/{id}',
                templateUrl: 'tpl/states/update.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/states/states.js?v=' + APP_VERSION]);
                        }]
                }
            })
            //CONFIGURATION MASTER CITY
            .state('configuration.cities', {
                url: '/cities',
                templateUrl: 'tpl/cities/index.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('tpl/cities/cities.js?v=' + APP_VERSION);
                        }]
                }
            })
            .state('configuration.cityCreate', {
                url: '/cityCreate',
                templateUrl: 'tpl/cities/create.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/cities/cities.js?v=' + APP_VERSION]);
                        }]

                }
            })
            .state('configuration.cityUpdate', {
                url: '/cityUpdate/{id}',
                templateUrl: 'tpl/cities/update.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/cities/cities.js?v=' + APP_VERSION]);
                        }]
                }
            })
            //CONFIGURATION ALERTS
            .state('configuration.alerts', {
                url: '/alerts',
                templateUrl: 'tpl/alerts/index.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('tpl/alerts/alerts.js?v=' + APP_VERSION);
                        }]
                }
            })
            .state('configuration.alertCreate', {
                url: '/alertCreate',
                templateUrl: 'tpl/alerts/create.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/alerts/alerts.js?v=' + APP_VERSION]);
                        }]

                }
            })
            .state('configuration.alertUpdate', {
                url: '/alertUpdate/{id}',
                templateUrl: 'tpl/alerts/update.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/alerts/alerts.js?v=' + APP_VERSION]);
                        }]
                }
            })

            //Patient Category
            .state('configuration.patientCategories', {
                url: '/patientCategories',
                templateUrl: 'tpl/patient_categories/index.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('tpl/patient_categories/patient_category.js?v=' + APP_VERSION);
                        }]
                }
            })
            .state('configuration.patientCategoryCreate', {
                url: '/patientCategoryCreate',
                templateUrl: 'tpl/patient_categories/create.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('smart-table').then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/patient_categories/patient_category.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })
            .state('configuration.patientCategoryUpdate', {
                url: '/patientCategoryUpdate/{id}',
                templateUrl: 'tpl/patient_categories/update.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/patient_categories/patient_category.js?v=' + APP_VERSION]);
                        }]
                }
            })
            //CONFIGURATION CHARGES FOR CATEGORY
            .state('configuration.chargePerCategory', {
                url: '/charge_per_category',
                templateUrl: 'tpl/charge_per_category/index.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['xeditable']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/charge_per_category/charge_per_category.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })
            .state('configuration.chargePerCategoryCreate', {
                url: '/chargePerCategoryCreate',
                templateUrl: 'tpl/charge_per_category/create.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['xeditable', 'smart-table']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/charge_per_category/charge_per_category.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })
            .state('configuration.chargePerCategoryUpdate', {
                url: '/chargePerCategoryUpdate/{id}',
                templateUrl: 'tpl/charge_per_category/update.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['xeditable', 'smart-table']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/charge_per_category/charge_per_category.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

            //Bill-No Prefix
            .state('configuration.internalCode', {
                url: '/internalCode',
                templateUrl: 'tpl/internal_code/index.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/internal_code/internal_code.js?v=' + APP_VERSION]);
                        }]
                }
            })

            //CONFIGURATION DOCTOR SCHEDULE
            .state('configuration.docSchedule', {
                url: '/docSchedule',
                templateUrl: 'tpl/doctor_schedule/index.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['xeditable']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/doctor_schedule/doctor_schedule.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })
            .state('configuration.docScheduleCreate', {
                url: '/docScheduleCreate',
                templateUrl: 'tpl/doctor_schedule/create.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('xeditable').then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/doctor_schedule/doctor_schedule.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

            //CONFIGURATION PATIENT GROUPING
            .state('configuration.patientgroup', {
                url: '/patientgroup',
                templateUrl: 'tpl/patient_groups/index.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['xeditable']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/patient_groups/patient_groups.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })
            .state('configuration.patientgroupCreate', {
                url: '/patientgroupCreate',
                templateUrl: 'tpl/patient_groups/create.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['xeditable']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/patient_groups/patient_groups.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })
            .state('configuration.patientgroupUpdate', {
                url: '/patientgroupUpdate/{id}',
                templateUrl: 'tpl/patient_groups/update.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['xeditable']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/patient_groups/patient_groups.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

            //PATIENT
            .state('patient', {
                abstract: true,
                url: '/patient',
                templateUrl: 'tpl/patient.html',
            })
            .state('patient.registration', {
                url: '/registration',
                templateUrl: 'tpl/patient_registration/create.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load([
                                'tpl/patient_registration/patient_registration.js?v=' + APP_VERSION,
                                'tpl/modal_form/modal.country.js?v=' + APP_VERSION,
                                'tpl/modal_form/modal.state.js?v=' + APP_VERSION,
                                'tpl/modal_form/modal.city.js?v=' + APP_VERSION
                            ]);
                        }]
                }
            })
            .state('patient.view', {
                url: '/view/{id}',
                templateUrl: 'tpl/patient/view.html',
                controller: 'PatientLeftSideNotificationCtrl',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load([
                                'tpl/patient/patient.js?v=' + APP_VERSION,
                                'tpl/modal_form/modal.patient_label.js?v=' + APP_VERSION
                            ]);
                        }]
                }
            })
            //PATIENT UPDATE
            .state('patient.update', {
                url: '/update/{id}',
                templateUrl: 'tpl/patient/update_patient.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/patient/patient_update.js?v=' + APP_VERSION]);
                        }]
                }
            })
            //PATIENT MODIFY CASESHEET NO
            .state('patient.modifyCaseSheetNo', {
                url: '/modifyCaseSheetNo/{id}',
                templateUrl: 'tpl/patient/modify_case_sheet.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/patient/patient_casesheet.js?v=' + APP_VERSION]);
                        }]
                }
            })

            //PATIENT ENCOUNTER
            .state('patient.encounter', {
                url: '/encounter/{id}',
                templateUrl: 'tpl/patient_encounter/encounters.html',
                controller: 'PatientLeftSideNotificationCtrl',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['smart-table', 'xeditable']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/patient_encounter/encounter.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })
            //PATIENT APPOINTMENT
            .state('patient.appointment', {
                url: '/appointment/{id}',
                templateUrl: 'tpl/patient_appointment/create.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('smart-table').then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/patient_appointment/patient_appointment.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

            //PATIENT TRANSFER
            .state('patient.transfer', {
                url: '/transfer/{id}/{enc_id}',
                templateUrl: 'tpl/patient_admission/transfer.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('smart-table').then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/patient_admission/patient_admission.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

            //PATIENT DISCHARGE
            .state('patient.discharge', {
                url: '/discharge/{id}/{enc_id}',
                templateUrl: 'tpl/patient_admission/discharge.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('smart-table').then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/patient_admission/patient_admission.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

            //PATIENT SWAPPING
            .state('patient.swapping', {
                url: '/swapping/{id}/{enc_id}',
                templateUrl: 'tpl/patient_admission/swapping.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('smart-table').then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/patient_admission/patient_admission.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

            //ADMISSION UPDATE
            .state('patient.update_admission', {
                url: '/update_admission/{id}/{enc_id}',
                templateUrl: 'tpl/patient_admission/update.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('smart-table').then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/patient_admission/patient_admission.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

            // In-Patient
            .state('patient.inPatients', {
                url: '/inPatients',
                templateUrl: 'tpl/in_patients/index.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['smart-table', 'ui.select']).then(
                                    function () {
                                        return $ocLazyLoad.load([
                                            'tpl/in_patients/in_patients.js?v=' + APP_VERSION,
                                            'tpl/modal_form/modal.patient_consultant_visit.js?v=' + APP_VERSION,
                                            'tpl/modal_form/modal.patient_procedures.js?v=' + APP_VERSION
                                        ]);
                                    }
                            );
                        }]
                }
            })

            // Out-Patient
            .state('patient.outPatients', {
                url: '/outPatients/:type',
                params: {
                    type: {value: 'current', squash: false}
                },
                templateUrl: 'tpl/out_patients/index.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['smart-table', 'xeditable']).then(
                                    function () {
                                        return $ocLazyLoad.load([
                                            'tpl/out_patients/out_patients.js?v=' + APP_VERSION,
                                            'tpl/modal_form/modal.patient_appointment_reschedule.js?v=' + APP_VERSION
                                        ]);
                                    }
                            );
                        }]
                }
            })

            // In-Patient - Admission
            .state('patient.admission', {
                url: '/admission/{id}',
                templateUrl: 'tpl/patient_admission/create.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/patient_admission/patient_admission.js?v=' + APP_VERSION]);
                        }]
                }
            })
            //PATIENT PROCEDURE
            .state('patient.procedure', {
                url: '/procedure/{id}',
                templateUrl: 'tpl/patient_procedure/procedures.html',
                controller: 'PatientLeftSideNotificationCtrl',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['smart-table', 'ui.select']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/patient_procedure/procedure.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })
            //PATIENT ADD PROCEDURE
            .state('patient.add_procedure', {
                url: '/add_procedure/{id}/{enc_id}',
                templateUrl: 'tpl/patient_procedure/create.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['smart-table', 'ui.select']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/patient_procedure/procedure.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })
            //PATIENT Edit PROCEDURE
            .state('patient.edit_procedure', {
                url: '/edit_procedure/{id}/{proc_id}',
                templateUrl: 'tpl/patient_procedure/update.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['smart-table', 'ui.select']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/patient_procedure/procedure.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

            //Encounter change appointment status - OP
            .state('patient.changeStatus', {
                url: '/changeStatus/{id}/{enc_id}',
                templateUrl: 'tpl/patient_appointment/change_status.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['smart-table']).then(
                                    function () {
                                        return $ocLazyLoad.load([
                                            'tpl/patient_appointment/patient_appointment.js?v=' + APP_VERSION,
                                            'tpl/modal_form/modal.patient_future_appointment.js?v=' + APP_VERSION
                                        ]);
                                    }
                            );
                        }]
                }
            })

            //Encounter Edit Doctor Fee - OP
            .state('patient.editDoctorFee', {
                url: '/editDoctorFee/{id}/{enc_id}',
                templateUrl: 'tpl/patient_appointment/edit_doctor_fee.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['smart-table', 'ui.select']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/patient_appointment/patient_appointment.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

            //Patient Alert
            .state('patient.alert', {
                url: '/alert/{id}/:type',
                templateUrl: 'tpl/patient_alert/index.html',
                controller: 'PatientLeftSideNotificationCtrl',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['xeditable', 'smart-table']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/patient_alert/patient_alert.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

            //Patient Alert Create
            .state('patient.alertCreate', {
                url: '/alertCreate/{id}',
                templateUrl: 'tpl/patient_alert/create.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/patient_alert/patient_alert.js?v=' + APP_VERSION]);
                        }]
                }
            })

            //Patient Alert Create
            .state('patient.alertUpdate', {
                url: '/alertUpdate/{id}/{alert_id}',
                templateUrl: 'tpl/patient_alert/update.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/patient_alert/patient_alert.js?v=' + APP_VERSION]);
                        }]
                }
            })

            //Patient Notes
            .state('patient.notes', {
                url: '/notes/{id}',
                templateUrl: 'tpl/patient_notes/index.html',
                controller: 'PatientLeftSideNotificationCtrl',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['smart-table']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/patient_notes/patient_notes.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

            //Patient Note Create
            .state('patient.noteCreate', {
                url: '/noteCreate/{id}',
                templateUrl: 'tpl/patient_notes/create.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/patient_notes/patient_notes.js?v=' + APP_VERSION]);
                        }]
                }
            })

            //Patient Note Update
            .state('patient.noteUpdate', {
                url: '/noteUpdate/{id}/{note_id}',
                templateUrl: 'tpl/patient_notes/update.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/patient_notes/patient_notes.js?v=' + APP_VERSION]);
                        }]
                }
            })

            //Patient Note View
            .state('patient.noteView', {
                url: '/noteView/{id}/{note_id}',
                templateUrl: 'tpl/patient_notes/view.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/patient_notes/patient_notes.js?v=' + APP_VERSION]);
                        }]
                }
            })

            //Patient Consultant
            .state('patient.consultant', {
                url: '/consultant/{id}',
                templateUrl: 'tpl/patient_consultant/index.html',
                controller: 'PatientLeftSideNotificationCtrl',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['smart-table', 'ui.select']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/patient_consultant/patient_consultant.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

            //Patient Note Create
            .state('patient.consultantCreate', {
                url: '/consultantCreate/{id}/{enc_id}',
                templateUrl: 'tpl/patient_consultant/create.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/patient_consultant/patient_consultant.js?v=' + APP_VERSION]);
                        }]
                }
            })

            //Patient Note Update
            .state('patient.consultantUpdate', {
                url: '/consultantUpdate/{id}/{cons_id}',
                templateUrl: 'tpl/patient_consultant/update.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/patient_consultant/patient_consultant.js?v=' + APP_VERSION]);
                        }]
                }
            })

            //PHARMACY
            .state('pharmacy', {
                abstract: true,
                url: '/pharmacy',
                templateUrl: 'tpl/pharmacy.html'
            })
            //PHARMACY BRAND
            .state('configuration.brand', {
                url: '/brand',
                templateUrl: 'tpl/pharmacy_brand/index.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['smart-table']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/pharmacy_brand/pharmacy_brand.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })
            //PHARMACY BRAND CREATE
            .state('configuration.brandCreate', {
                url: '/brandCreate',
                templateUrl: 'tpl/pharmacy_brand/create.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/pharmacy_brand/pharmacy_brand.js?v=' + APP_VERSION]);
                        }]
                }
            })

            //PHARMACY BRAND UPDATE
            .state('configuration.brandUpdate', {
                url: '/brandUpdate/{id}',
                templateUrl: 'tpl/pharmacy_brand/update.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/pharmacy_brand/pharmacy_brand.js?v=' + APP_VERSION]);
                        }]
                }
            })

            //PHARMACY BRAND REP
            .state('configuration.brandrep', {
                url: '/brandrep',
                templateUrl: 'tpl/pharmacy_brandrep/index.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['smart-table']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/pharmacy_brandrep/pharmacy_brandrep.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

            //PHARMACY BRAND REP CREATE
            .state('configuration.brandrepCreate', {
                url: '/brandrepCreate',
                templateUrl: 'tpl/pharmacy_brandrep/create.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/pharmacy_brandrep/pharmacy_brandrep.js?v=' + APP_VERSION]);
                        }]
                }
            })

            //PHARMACY BRAND REP UPDATE
            .state('configuration.brandrepUpdate', {
                url: '/brandrepUpdate/{id}',
                templateUrl: 'tpl/pharmacy_brandrep/update.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/pharmacy_brandrep/pharmacy_brandrep.js?v=' + APP_VERSION]);
                        }]
                }
            })
            //PHARMACY BRAND Division
            .state('configuration.brandDivision', {
                url: '/brandDivision',
                templateUrl: 'tpl/pharmacy_brand_division/index.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['smart-table']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/pharmacy_brand_division/pharmacy_brand_division.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })
            //PHARMACY BRAND Division CREATE
            .state('configuration.brandDivisionCreate', {
                url: '/brandDivisionCreate',
                templateUrl: 'tpl/pharmacy_brand_division/create.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/pharmacy_brand_division/pharmacy_brand_division.js?v=' + APP_VERSION]);
                        }]
                }
            })

            //PHARMACY BRAND Division UPDATE
            .state('configuration.brandDivisionUpdate', {
                url: '/brandDivisionUpdate/{id}',
                templateUrl: 'tpl/pharmacy_brand_division/update.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/pharmacy_brand_division/pharmacy_brand_division.js?v=' + APP_VERSION]);
                        }]
                }
            })

            //PHARMACY DRUG CLASS
            .state('configuration.drugclass', {
                url: '/drugclass',
                templateUrl: 'tpl/pharmacy_drugclass/index.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['smart-table']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/pharmacy_drugclass/pharmacy_drugclass.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })
            //PHARMACY DRUG CLASS CREATE
            .state('configuration.drugclassCreate', {
                url: '/drugclassCreate',
                templateUrl: 'tpl/pharmacy_drugclass/create.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/pharmacy_drugclass/pharmacy_drugclass.js?v=' + APP_VERSION]);
                        }]
                }
            })

            //PHARMACY DRUG CLASS UPDATE
            .state('configuration.drugclassUpdate', {
                url: '/drugclassUpdate/{id}',
                templateUrl: 'tpl/pharmacy_drugclass/update.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/pharmacy_drugclass/pharmacy_drugclass.js?v=' + APP_VERSION]);
                        }]
                }
            })

            //PHARMACY GENERICNAME
            .state('configuration.genericName', {
                url: '/genericName',
                templateUrl: 'tpl/pharmacy_generic_name/index.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['smart-table']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/pharmacy_generic_name/pharmacy_generic_name.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

            //PHARMACY GENERICNAME CREATE
            .state('configuration.genericNameCreate', {
                url: '/genericNameCreate',
                templateUrl: 'tpl/pharmacy_generic_name/create.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/pharmacy_generic_name/pharmacy_generic_name.js?v=' + APP_VERSION]);
                        }]
                }
            })

            //PHARMACY GENERICNAME UPDATE
            .state('configuration.genericNameUpdate', {
                url: '/genericNameUpdate/{id}',
                templateUrl: 'tpl/pharmacy_generic_name/update.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/pharmacy_generic_name/pharmacy_generic_name.js?v=' + APP_VERSION]);
                        }]
                }
            })

            //PHARMACY Routes
            .state('configuration.routes', {
                url: '/routes',
                templateUrl: 'tpl/pharmacy_routes/index.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['smart-table']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/pharmacy_routes/pharmacy_routes.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })
            //PHARMACY Routes CREATE
            .state('configuration.routesCreate', {
                url: '/routesCreate',
                templateUrl: 'tpl/pharmacy_routes/create.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/pharmacy_routes/pharmacy_routes.js?v=' + APP_VERSION]);
                        }]
                }
            })
            //PHARMACY Routes UPDATE
            .state('configuration.routesUpdate', {
                url: '/routesUpdate/{id}',
                templateUrl: 'tpl/pharmacy_routes/update.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/pharmacy_routes/pharmacy_routes.js?v=' + APP_VERSION]);
                        }]
                }
            })

            //PHARMACY Product Description
            .state('configuration.prodesc', {
                url: '/prodesc',
                templateUrl: 'tpl/pharmacy_prodesc/index.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['smart-table']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/pharmacy_prodesc/pharmacy_prodesc.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })
            //PHARMACY Product Description CREATE
            .state('configuration.prodescCreate', {
                url: '/prodescCreate',
                templateUrl: 'tpl/pharmacy_prodesc/create.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/pharmacy_prodesc/pharmacy_prodesc.js?v=' + APP_VERSION]);
                        }]
                }
            })

            //PHARMACY Product Description UPDATE
            .state('configuration.prodescUpdate', {
                url: '/prodescUpdate/{id}',
                templateUrl: 'tpl/pharmacy_prodesc/update.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/pharmacy_prodesc/pharmacy_prodesc.js?v=' + APP_VERSION]);
                        }]
                }
            })
            //PHARMACY PACKING UNIT
            .state('configuration.packingUnit', {
                url: '/packingUnit',
                templateUrl: 'tpl/pharmacy_packing_unit/index.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['smart-table']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/pharmacy_packing_unit/pharmacy_packing_unit.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

            //PHARMACY PACKING UNIT CREATE
            .state('configuration.packingUnitCreate', {
                url: '/packingUnitCreate',
                templateUrl: 'tpl/pharmacy_packing_unit/create.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/pharmacy_packing_unit/pharmacy_packing_unit.js?v=' + APP_VERSION]);
                        }]
                }
            })

            //PHARMACY PACKING UNIT UPDATE
            .state('configuration.packingUnitUpdate', {
                url: '/packingUnitUpdate/{id}',
                templateUrl: 'tpl/pharmacy_packing_unit/update.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/pharmacy_packing_unit/pharmacy_packing_unit.js?v=' + APP_VERSION]);
                        }]
                }
            })

            //PHARMACY SUPPLIER
            .state('configuration.supplier', {
                url: '/supplier',
                templateUrl: 'tpl/pharmacy_supplier/index.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['smart-table']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/pharmacy_supplier/pharmacy_supplier.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

            //PHARMACY SUPPLIER CREATE
            .state('configuration.supplierCreate', {
                url: '/supplierCreate',
                templateUrl: 'tpl/pharmacy_supplier/create.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/pharmacy_supplier/pharmacy_supplier.js?v=' + APP_VERSION]);
                        }]
                }
            })

            //PHARMACY SUPPLIER UPDATE
            .state('configuration.supplierUpdate', {
                url: '/supplierUpdate/{id}',
                templateUrl: 'tpl/pharmacy_supplier/update.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/pharmacy_supplier/pharmacy_supplier.js?v=' + APP_VERSION]);
                        }]
                }
            })

            //PHARMACY VAT
            .state('configuration.vat', {
                url: '/vat',
                templateUrl: 'tpl/pharmacy_vat/index.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['smart-table']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/pharmacy_vat/pharmacy_vat.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })
            //PHARMACY BRAND CREATE
            .state('configuration.vatCreate', {
                url: '/vatCreate',
                templateUrl: 'tpl/pharmacy_vat/create.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/pharmacy_vat/pharmacy_vat.js?v=' + APP_VERSION]);
                        }]
                }
            })

            //PHARMACY BRAND UPDATE
            .state('configuration.vatUpdate', {
                url: '/vatUpdate/{id}',
                templateUrl: 'tpl/pharmacy_vat/update.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/pharmacy_vat/pharmacy_vat.js?v=' + APP_VERSION]);
                        }]
                }
            })

            //PHARMACY GST
            .state('configuration.gst', {
                url: '/gst',
                templateUrl: 'tpl/pharmacy_gst/index.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['smart-table']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/pharmacy_gst/pharmacy_gst.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })
            //PHARMACY GST CREATE
            .state('configuration.gstCreate', {
                url: '/gstCreate',
                templateUrl: 'tpl/pharmacy_gst/create.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/pharmacy_gst/pharmacy_gst.js?v=' + APP_VERSION]);
                        }]
                }
            })

            //PHARMACY GST UPDATE
            .state('configuration.gstUpdate', {
                url: '/gstUpdate/{id}',
                templateUrl: 'tpl/pharmacy_gst/update.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/pharmacy_gst/pharmacy_gst.js?v=' + APP_VERSION]);
                        }]
                }
            })

            //PHARMACY DRUG & GENERIC
            .state('configuration.drugGeneric', {
                url: '/drugGeneric',
                templateUrl: 'tpl/pharmacy_drug_generic/index.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('xeditable').then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/pharmacy_drug_generic/pharmacy_drug_generic.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })
            //PHARMACY DRUG & GENERIC CREATE
            .state('configuration.drugGenericCreate', {
                url: '/drugGenericCreate',
                templateUrl: 'tpl/pharmacy_drug_generic/create.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('xeditable').then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/pharmacy_drug_generic/pharmacy_drug_generic.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

            //PHARMACY DRUG & GENERIC UPDATE
            .state('configuration.drugGenericUpdate', {
                url: '/drugGenericUpdate/{id}',
                templateUrl: 'tpl/pharmacy_drug_generic/update.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('xeditable').then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/pharmacy_drug_generic/pharmacy_drug_generic.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

            //PHARMACY NEW PURCHASE
            .state('pharmacy.purchaseCreate', {
                url: '/purchaseCreate',
                templateUrl: 'tpl/pharmacy_purchase/create.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('xeditable').then(
                                    function () {
                                        return $ocLazyLoad.load([
                                            'tpl/pharmacy_purchase/pharmacy_purchase.js?v=' + APP_VERSION,
                                            'tpl/modal_form/modal.supplier.js?v=' + APP_VERSION
                                        ]);
                                    }
                            );
                        }]
                }
            })

            //PHARMACY EDIT PURCHASE
            .state('pharmacy.purchaseUpdate', {
                url: '/purchaseUpdate/{id}',
                templateUrl: 'tpl/pharmacy_purchase/update.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('xeditable').then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/pharmacy_purchase/pharmacy_purchase.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

            //PHARMACY PURCHASE LIST
            .state('pharmacy.purchase', {
                url: '/purchase',
                templateUrl: 'tpl/pharmacy_purchase/index.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('xeditable').then(
                                    function () {
                                        return $ocLazyLoad.load([
                                            'tpl/pharmacy_purchase/pharmacy_purchase.js?v=' + APP_VERSION,
                                            'tpl/pharmacy_purchase/purchase_make_payment.js?v=' + APP_VERSION,
                                        ]);
                                    }
                            );
                        }]
                }
            })

            //PHARMACY NEW PURCHASE RETURN
            .state('pharmacy.purchaseReturnCreate', {
                url: '/purchaseReturnCreate',
                templateUrl: 'tpl/pharmacy_purchase_return/create.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('xeditable').then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/pharmacy_purchase_return/pharmacy_purchase_return.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

            //PHARMACY EDIT PURCHASE RETURN
            .state('pharmacy.purchaseReturnUpdate', {
                url: '/purchaseReturnUpdate/{id}',
                templateUrl: 'tpl/pharmacy_purchase_return/update.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('xeditable').then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/pharmacy_purchase_return/pharmacy_purchase_return.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

            //PHARMACY PURCHASE RETURN LIST
            .state('pharmacy.purchaseReturn', {
                url: '/purchaseReturn',
                templateUrl: 'tpl/pharmacy_purchase_return/index.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('xeditable').then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/pharmacy_purchase_return/pharmacy_purchase_return.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

            //PHARMACY PRODUCTS
            .state('configuration.products', {
                url: '/products',
                templateUrl: 'tpl/pharmacy_products/index.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['tpl/pharmacy_products/pharmacy_products.js?v=' + APP_VERSION]);
                        }]
                }
            })
            //PHARMACY PRODUCT ADD
            .state('configuration.productAdd', {
                url: '/productAdd',
                templateUrl: 'tpl/pharmacy_products/create.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load([
                                'tpl/pharmacy_products/pharmacy_products.js?v=' + APP_VERSION,
                                'tpl/modal_form/modal.description.js?v=' + APP_VERSION,
                                'tpl/modal_form/modal.brand.js?v=' + APP_VERSION,
                                'tpl/modal_form/modal.division.js?v=' + APP_VERSION,
                                'tpl/modal_form/modal.generic.js?v=' + APP_VERSION,
                                'tpl/modal_form/modal.vat.js?v=' + APP_VERSION,
                                'tpl/modal_form/modal.package.js?v=' + APP_VERSION,
                                'tpl/modal_form/modal.supplier.js?v=' + APP_VERSION,
                                'tpl/modal_form/modal.hsn.js?v=' + APP_VERSION,
                                'tpl/modal_form/modal.productunit.js?v=' + APP_VERSION,
                            ]);
                        }]
                }
            })
            //PHARMACY PRODUCT EDIT
            .state('configuration.productEdit', {
                url: '/productEdit/{id}',
                templateUrl: 'tpl/pharmacy_products/update.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/pharmacy_products/pharmacy_products.js?v=' + APP_VERSION,
                                'tpl/modal_form/modal.description.js?v=' + APP_VERSION,
                                'tpl/modal_form/modal.brand.js?v=' + APP_VERSION,
                                'tpl/modal_form/modal.division.js?v=' + APP_VERSION,
                                'tpl/modal_form/modal.generic.js?v=' + APP_VERSION,
                                'tpl/modal_form/modal.vat.js?v=' + APP_VERSION,
                                'tpl/modal_form/modal.package.js?v=' + APP_VERSION,
                                'tpl/modal_form/modal.supplier.js?v=' + APP_VERSION,
                                'tpl/modal_form/modal.hsn.js?v=' + APP_VERSION,
                                'tpl/modal_form/modal.productunit.js?v=' + APP_VERSION,
                            ]);
                        }]
                }
            })

            //PHARMACY SALE LIST
            .state('pharmacy.sales', {
                url: '/sales',
                templateUrl: 'tpl/pharmacy_sale/index.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('xeditable').then(
                                    function () {
                                        return $ocLazyLoad.load([
                                            'tpl/pharmacy_sale/pharmacy_sale.js?v=' + APP_VERSION,
                                            'tpl/pharmacy_sale/sale_make_payment.js?v=' + APP_VERSION,
                                        ]);
                                    }
                            );
                        }]
                }
            })

            //SALE CREATE
            .state('pharmacy.saleCreate', {
                url: '/saleCreate',
                templateUrl: 'tpl/pharmacy_sale/create.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('xeditable').then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/pharmacy_sale/pharmacy_sale.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

            //PHARMACY EDIT SALE
            .state('pharmacy.saleUpdate', {
                url: '/saleUpdate/{id}',
                templateUrl: 'tpl/pharmacy_sale/update.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('xeditable').then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/pharmacy_sale/pharmacy_sale.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

            //PHARMACY PRODUCT ADD
            .state('pharmacy.stockAdjust', {
                url: '/stockAdjust',
                templateUrl: 'tpl/pharmacy_stock/adjust.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['xeditable', 'smart-table']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/pharmacy_stock/pharmacy_stock.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

            //PHARMACY SALE RETURN LIST
            .state('pharmacy.saleReturn', {
                url: '/saleReturn',
                templateUrl: 'tpl/pharmacy_sale_return/index.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('xeditable').then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/pharmacy_sale_return/pharmacy_sale_return.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

            //SALE RETURN CREATE
            .state('pharmacy.saleReturnCreate', {
                url: '/saleReturnCreate',
                templateUrl: 'tpl/pharmacy_sale_return/create.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('xeditable').then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/pharmacy_sale_return/pharmacy_sale_return.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

            //PHARMACY EDIT SALE RETURN
            .state('pharmacy.saleReturnUpdate', {
                url: '/saleReturnUpdate/{id}',
                templateUrl: 'tpl/pharmacy_sale_return/update.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('xeditable').then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/pharmacy_sale_return/pharmacy_sale_return.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

            //PHARMACY PRODUCT ADD
            .state('pharmacy.batchDetails', {
                url: '/batchDetails',
                templateUrl: 'tpl/pharmacy_stock/batch_details.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['xeditable', 'smart-table']).then(
                                    function () {
                                        return $ocLazyLoad.load([
                                            'tpl/pharmacy_stock/pharmacy_stock.js?v=' + APP_VERSION,
                                            'tpl/modal_form/modal.batch.js?v=' + APP_VERSION
                                        ]);
                                    }
                            );
                        }]
                }
            })

            //PHARMACY PURCHASE REPORT
            .state('pharmacy.purchaseReport', {
                url: '/purchaseReport',
                templateUrl: 'tpl/pharmacy_report/purchaseReport.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['smart-table']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/pharmacy_report/purchaseReport.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })
            
            //PHARMACY NEW PURCHASE REPORT
            .state('pharmacy.newPurchaseReport', {
                url: '/newPurchaseReport',
                templateUrl: 'tpl/pharmacy_report/newPurchaseReport.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['smart-table']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/pharmacy_report/newPurchaseReport.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

            //Patient Pending REPORT
            .state('pharmacy.patientoutstandingReport', {
                url: '/patientoutstandingReport',
                templateUrl: 'tpl/pharmacy_report/patientoutstandingReport.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['smart-table']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/pharmacy_report/patientoutstandingReport.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

            //Short Expire Drug
            .state('pharmacy.shortexpiryDrug', {
                url: '/shortexpiryDrug',
                templateUrl: 'tpl/pharmacy_report/shortexpiryDrug.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['smart-table']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/pharmacy_report/shortexpiryDrug.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

            //PHARMACY PURCHASE VAT REPORT
            .state('pharmacy.purchaseVatReport', {
                url: '/purchaseVatReport',
                templateUrl: 'tpl/pharmacy_report/purchaseVatReport.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['smart-table']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/pharmacy_report/purchaseVatReport.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

            //PHARMACY SALE REPORT
            .state('pharmacy.saleReport', {
                url: '/saleReport',
                templateUrl: 'tpl/pharmacy_report/saleReport.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['smart-table']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/pharmacy_report/saleReport.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

            //PHARMACY SALE RETURN REPORT
            .state('pharmacy.saleReturnReport', {
                url: '/saleReturnReport',
                templateUrl: 'tpl/pharmacy_report/saleReturnReport.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['smart-table']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/pharmacy_report/saleReturnReport.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

            //PHARMACY SALE VAT REPORT
            .state('pharmacy.saleVatReport', {
                url: '/saleVatReport',
                templateUrl: 'tpl/pharmacy_report/saleVatReport.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['smart-table']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/pharmacy_report/saleVatReport.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

            //PHARMACY PRESCRIPTION REGISTER
            .state('pharmacy.prescriptionRegister', {
                url: '/prescriptionRegister',
                templateUrl: 'tpl/pharmacy_report/prescriptionRegister.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['smart-table']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/pharmacy_report/prescriptionRegister.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

            //PHARMACY MAKE PAYMENT REPORT
            .state('pharmacy.makepaymentReport', {
                url: '/makepaymentReport',
                templateUrl: 'tpl/pharmacy_report/makepaymetReport.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['smart-table']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/pharmacy_report/makepaymetReport.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

            //Patient Overall Report
            .state('pharmacy.overallincome', {
                url: '/overallincome',
                templateUrl: 'tpl/pharmacy_report/overallincomeReport.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['smart-table']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/pharmacy_report/overallincomeReport.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

            //PHARMACY PATIENT GROUP
            .state('configuration.patientgroupassign', {
                url: '/patientgroupassign',
                templateUrl: 'tpl/patient_groups/pharmacy_patient_list.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['xeditable']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/patient_groups/patient_groups.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

            //Patient Billing
            .state('patient.allbilling', {
                url: '/allbilling/{id}',
                templateUrl: 'tpl/patient_billing/allbilling.html',
                controller: 'PatientLeftSideNotificationCtrl',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['smart-table']).then(
                                    function () {
                                        return $ocLazyLoad.load([
                                            'tpl/patient_billing/patient_billing.js?v=' + APP_VERSION,
                                        ]);
                                    }
                            );
                        }]
                }
            })

            //Patient Billing
            .state('patient.billing', {
                url: '/billing/{id}?enc_id',
                templateUrl: 'tpl/patient_billing/index.html',
                controller: 'PatientLeftSideNotificationCtrl',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['smart-table', 'ui.select']).then(
                                    function () {
                                        return $ocLazyLoad.load([
                                            'tpl/patient_billing/patient_billing.js?v=' + APP_VERSION,
                                            'tpl/modal_form/modal.password_auth.js?v=' + APP_VERSION,
                                            'tpl/modal_form/modal.print_bill.js?v=' + APP_VERSION,
                                            'tpl/modal_form/modal.refund_amount.js?v=' + APP_VERSION,
                                        ]);
                                    }
                            );
                        }]
                }
            })

            //Patient Billing Add Payment
            .state('patient.addPayment', {
                url: '/addPayment/{id}/{enc_id}',
                templateUrl: 'tpl/patient_payment/create.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('tpl/patient_payment/patient_payment.js?v=' + APP_VERSION);
                        }]
                }
            })

            //Patient Billing Edit Payment
            .state('patient.editPayment', {
                url: '/editPayment/{id}/{payment_id}/{enc_id}',
                templateUrl: 'tpl/patient_payment/update.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/patient_payment/patient_payment.js?v=' + APP_VERSION]);
                        }]
                }
            })

            //Patient Billing Add Other Charges
            .state('patient.addOtherCharge', {
                url: '/addOtherCharge/{id}/{enc_id}',
                templateUrl: 'tpl/patient_other_charges/create.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/patient_other_charges/patient_other_charges.js?v=' + APP_VERSION]);
                        }]
                }
            })
            //Patient Billing Edit Other Charges
            .state('patient.editOtherCharge', {
                url: '/editOtherCharge/{id}/{other_charge_id}/{enc_id}',
                templateUrl: 'tpl/patient_other_charges/update.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/patient_other_charges/patient_other_charges.js?v=' + APP_VERSION]);
                        }]
                }
            })

            //Patient Billing Add Extra Amount
            .state('patient.addExtraAmount', {
                url: '/addExtraAmount/{id}/{ec_type}/{link_id}/{enc_id}/{tenant}',
                params: {
                    mode: 'E',
                },
                templateUrl: 'tpl/patient_extra_concession/create.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/patient_extra_concession/patient_extra_concession.js?v=' + APP_VERSION]);
                        }]
                }
            })
            //Patient Billing Edit Extra Amount
            .state('patient.editExtraAmount', {
                url: '/editExtraAmount/{id}/{ec_id}/{enc_id}/{tenant}',
                params: {
                    mode: 'E',
                },
                templateUrl: 'tpl/patient_extra_concession/update.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/patient_extra_concession/patient_extra_concession.js?v=' + APP_VERSION]);
                        }]
                }
            })

            //Patient Billing Add Concession Amount
            .state('patient.addConcessionAmount', {
                url: '/addConcessionAmount/{id}/{ec_type}/{link_id}/{enc_id}/{tenant}',
                params: {
                    mode: 'C',
                },
                templateUrl: 'tpl/patient_extra_concession/create.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/patient_extra_concession/patient_extra_concession.js?v=' + APP_VERSION]);
                        }]
                }
            })
            //Patient Billing Edit Concession Amount
            .state('patient.editConcessionAmount', {
                url: '/editConcessionAmount/{id}/{ec_id}/{enc_id}/{tenant}',
                params: {
                    mode: 'C',
                },
                templateUrl: 'tpl/patient_extra_concession/update.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/patient_extra_concession/patient_extra_concession.js?v=' + APP_VERSION]);
                        }]
                }
            })

            //Patient Billing Room Concession
            .state('patient.roomConcession', {
                url: '/roomConcession/{id}/{encounter_id}',
                templateUrl: 'tpl/patient_billing/room_concession.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/patient_billing/patient_billing.js?v=' + APP_VERSION]);
                        }]
                }
            })

            //Patient Billing Room Concession
            .state('patient.pharmacyConcession', {
                url: '/pharmacyConcession/{id}/{enc_id}',
                templateUrl: 'tpl/patient_billing/pharmacy_concession.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/patient_billing/pharmacy_concession.js?v=' + APP_VERSION]);
                        }]
                }
            })

            //Patient Billing Room Concession
            .state('patient.timeLine', {
                url: '/timeLine/{id}',
                templateUrl: 'tpl/patient/timeline.html',
                controller: 'PatientLeftSideNotificationCtrl',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/patient/timeline.js?v=' + APP_VERSION]);
                        }]
                }
            })

            //Patient Prescription
            .state('patient.prescription', {
                url: '/prescription/{id}',
                templateUrl: 'tpl/patient_prescription/index.html',
                controller: 'PatientLeftSideNotificationCtrl',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['smart-table', 'xeditable']).then(
                                    function () {
                                        return $ocLazyLoad.load([
                                            'ckeditor/ckeditor.js?v=' + APP_VERSION,
                                            'tpl/patient_prescription/patient_prescription.js?v=' + APP_VERSION,
                                            'tpl/modal_form/modal.product.js?v=' + APP_VERSION,
                                            'tpl/modal_form/modal.prescription_tab_setting.js?v=' + APP_VERSION,
                                        ]);
                                    }
                            );
                        }]
                }
            })

            //Patient New Prescription Design
            .state('patient.newprescription', {
                url: '/newprescription/{id}',
                templateUrl: 'tpl/patient_prescription/prescription_new.html',
                controller: 'PatientLeftSideNotificationCtrl',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['smart-table', 'ui.select', 'xeditable']).then(
                                    function () {
                                        return $ocLazyLoad.load([
                                            'tpl/patient_prescription/prescription_new.js?v=' + APP_VERSION,
                                        ]);
                                    }
                            );
                        }]
                }
            })

            //Patient Vitals
            .state('patient.vitals', {
                url: '/vitals/{id}',
                templateUrl: 'tpl/patient_vitals/index.html',
                controller: 'PatientLeftSideNotificationCtrl',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['smart-table']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/patient_vitals/patient_vitals.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

            //Patient Vital Create
            .state('patient.vitalCreate', {
                url: '/vitalCreate/{id}',
                templateUrl: 'tpl/patient_vitals/create.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/patient_vitals/patient_vitals.js?v=' + APP_VERSION]);
                        }]
                }
            })

            //Patient Vital Update
            .state('patient.vitalUpdate', {
                url: '/vitalUpdate/{id}/{vital_id}',
                templateUrl: 'tpl/patient_vitals/update.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/patient_vitals/patient_vitals.js?v=' + APP_VERSION]);
                        }]
                }
            })

            //ChangePassword
            .state('configuration.changePassword', {
                url: '/changePassword',
                templateUrl: 'tpl/organization/change_password.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['xeditable', 'smart-table']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/organization/org.js?v=' + APP_VERSION);
                                    }
                            );
                        }]

                }
            })

            //App Configuration
            .state('configuration.settings', {
                url: '/settings',
                templateUrl: 'tpl/organization/settings.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['xeditable', 'smart-table']).then(
                                    function () {
                                        return $ocLazyLoad.load([
                                            'tpl/organization/org.js?v=' + APP_VERSION,
                                            'tpl/modal_form/modal.pharmacy_purchase_import_errorlog.js?v=' + APP_VERSION
                                        ]);
                                    }
                            );
                        }]
                }
            })

            //App Configuration
            .state('configuration.appsetting', {
                url: '/appsetting',
                templateUrl: 'tpl/organization/app_settings.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['xeditable', 'smart-table']).then(
                                    function () {
                                        return $ocLazyLoad.load([
                                            'tpl/organization/app_setting.js?v=' + APP_VERSION,
                                            'tpl/modal_form/modal.pharmacy_purchase_import_errorlog.js?v=' + APP_VERSION
                                        ]);
                                    }
                            );
                        }]
                }
            })
            //Check Inpatient & Outpatient vitals menu
            .state('configuration.vital_management', {
                url: '/vital_management',
                templateUrl: 'tpl/patient_vitals/vital_management.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['xeditable', 'smart-table']).then(
                                    function () {
                                        return $ocLazyLoad.load([
                                            'tpl/patient_vitals/vital_management.js?v=' + APP_VERSION,
                                        ]);
                                    }
                            );
                        }]
                }
            })

            // fullCalendar - Future Appointments
            .state('patient.futureAppointment', {
                url: '/futureAppointment',
                templateUrl: 'tpl/future_appointment/index.html',
                // use resolve to load other dependences
                resolve: {
                    deps: ['$ocLazyLoad', 'uiLoad',
                        function ($ocLazyLoad, uiLoad) {
                            return uiLoad.load(
                                    JQ_CONFIG.fullcalendar.concat('tpl/future_appointment/future_appointment_calender.js?v=' + APP_VERSION)
                                    ).then(
                                    function () {
                                        return $ocLazyLoad.load([
                                            'xeditable',
                                            'ui.calendar',
                                            'tpl/modal_form/modal.patient_appointment.js?v=' + APP_VERSION,
                                            'tpl/modal_form/modal.patient_appointment_reschedule.js?v=' + APP_VERSION,
                                            'tpl/out_patients/out_patients.js?v=' + APP_VERSION
                                        ]);
                                    }
                            )
                        }]
                }
            })

            //Future appointments list
            .state('patient.futureAppointmentList', {
                url: '/futureAppointmentList/{consultant_id}/{date}',
                templateUrl: 'tpl/future_appointment/list.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['smart-table']).then(
                                    function () {
                                        return $ocLazyLoad.load([
                                            'tpl/future_appointment/future_appointment.js?v=' + APP_VERSION,
                                            'tpl/modal_form/modal.patient_appointment_reschedule.js?v=' + APP_VERSION
                                        ]);
                                    }
                            );
                        }]
                }
            })

            //Patient Document - Index
            .state('patient.document', {
                url: '/document/{id}',
                templateUrl: 'tpl/patient_documents/index.html',
                controller: 'PatientLeftSideNotificationCtrl',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load([
                                'tpl/patient_documents/patient_documents.js?v=' + APP_VERSION,
                                'tpl/modal_form/modal.scan_document.js?v=' + APP_VERSION,
                            ]);
                        }]
                }
            })

            //Patient Document - Create
            .state('patient.addDocument', {
                url: '/addDocument/{id}/{enc_id}/{document}',
                templateUrl: 'tpl/patient_documents/create.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load([
                                'ckeditor/ckeditor.js?v=' + APP_VERSION,
                                'tpl/patient_documents/patient_documents.js?v=' + APP_VERSION
                            ]);
                        }]
                }
            })
            //Patient Document - Update
            .state('patient.editDocument', {
                url: '/editDocument/{id}/{doc_id}/{document}',
                templateUrl: 'tpl/patient_documents/update.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['xeditable', 'smart-table']).then(
                                    function () {
                                        return $ocLazyLoad.load([
                                            'ckeditor/ckeditor.js?v=' + APP_VERSION,
                                            'tpl/patient_documents/patient_documents.js?v=' + APP_VERSION]);
                                    }
                            );
                        }]
                }
            })
            //Patient Document - View
            .state('patient.viewDocument', {
                url: '/viewDocument/{id}/{doc_id}/{document}',
                templateUrl: 'tpl/patient_documents/view.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/patient_documents/patient_documents.js?v=' + APP_VERSION]);
                        }]
                }
            })

            //Patient Scanned Document - Create
            .state('patient.addScannedDocument', {
                url: '/addScannedDocument/{id}/{enc_id}',
                templateUrl: 'tpl/patient_scanned_documents/create.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('angularFileUpload').then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/patient_scanned_documents/patient_scanned_documents.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

            //Patient Other Document - Create
            .state('patient.addOtherDocument', {
                url: '/addOtherDocument/{id}/{enc_id}/{document}',
                templateUrl: 'tpl/patient_other_documents/create.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load([
                                'js/editor.js?v=' + APP_VERSION,
                                'tpl/patient_other_documents/patient_other_documents.js?v=' + APP_VERSION
                            ]);
                        }]
                }
            })
            //Patient Other Document - Update
            .state('patient.editOtherDocument', {
                url: '/editOtherDocument/{id}/{other_doc_id}',
                templateUrl: 'tpl/patient_other_documents/update.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load([
                                'js/editor.js?v=' + APP_VERSION,
                                'tpl/patient_other_documents/patient_other_documents.js?v=' + APP_VERSION
                            ]);
                        }]
                }
            })
            //Patient Other Document - View
            .state('patient.viewOtherDocument', {
                url: '/viewOtherDocument/{id}/{other_doc_id}',
                templateUrl: 'tpl/patient_other_documents/view.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/patient_other_documents/patient_other_documents.js?v=' + APP_VERSION]);
                        }]
                }
            })

            //Assisgn Patient Sharing
            .state('patient.assignShare', {
                url: '/assignShare/{id}',
                templateUrl: 'tpl/patient_share/assign.html',
                controller: 'PatientLeftSideNotificationCtrl',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['tpl/patient_share/patient_share.js?v=' + APP_VERSION]);
                        }]
                }
            })

            //Pharmacy Reorder
            .state('pharmacy.reorder', {
                url: '/reorder',
                templateUrl: 'tpl/pharmacy_reorder/index.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('xeditable').then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/pharmacy_reorder/pharmacy_reorder.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

            //PHARMACY ReOrder History Update
            .state('pharmacy.reorderHistoryUpdate', {
                url: '/reorderHistoryUpdate/{id}',
                templateUrl: 'tpl/pharmacy_reorder/create.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load('xeditable').then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/pharmacy_reorder/pharmacy_reorder.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

            //Myworks
            .state('myworks', {
                abstract: true,
                url: '/myworks',
                templateUrl: 'tpl/myworks.html'
            })
            //Myworks Dashboard
            .state('myworks.dashboard', {
                url: '/dashboard',
                templateUrl: 'tpl/myworks/dashboard.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['xeditable', 'smart-table']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/myworks/myworks.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })
            //Myworks OPDoctorPay
            .state('myworks.opDoctorPay', {
                url: '/opDoctorPay',
                templateUrl: 'tpl/myworks_report/opdoctorpay.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['smart-table']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/myworks_report/opdoctorpay.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })
            //Myworks OPSummaryReport
            .state('myworks.opSummaryReport', {
                url: '/opSummaryReport',
                templateUrl: 'tpl/myworks_report/opsummaryreport.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['smart-table']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/myworks_report/opsummaryreport.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

            //Myworks OPSummaryReport
            .state('myworks.opNonRecurringChargeReport', {
                url: '/opNonRecurringChargeReport',
                templateUrl: 'tpl/myworks_report/opnonrecurringReport.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['smart-table']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/myworks_report/opnonrecurringReport.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

            //Myworks ipBillStatus
            .state('myworks.ipBillStatus', {
                url: '/ipBillStatus',
                templateUrl: 'tpl/myworks_report/ipBillStatus.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['smart-table']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/myworks_report/ipBillStatus.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })
            //Myworks Discharged Patient Bills
            .state('myworks.dischargedPatientBills', {
                url: '/dischargedPatientBills',
                templateUrl: 'tpl/myworks_report/dischargedPatientBills.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['smart-table']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/myworks_report/dischargedPatientBills.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })
            //Myworks Discharged Patient Dues
            .state('myworks.dischargedPatientDues', {
                url: '/dischargedPatientDues',
                templateUrl: 'tpl/myworks_report/dischargedPatientDues.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['smart-table']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/myworks_report/dischargedPatientDues.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })
            //Myworks IP Doctors Pay
            .state('myworks.ipDoctorsPay', {
                url: '/ipDoctorsPay',
                templateUrl: 'tpl/myworks_report/ipDoctorsPay.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['smart-table']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/myworks_report/ipDoctorsPay.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

            //Myworks IP Income Report
            .state('myworks.ipincomereport', {
                url: '/ipIncomeReport',
                templateUrl: 'tpl/myworks_report/ipIncomeReport.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['smart-table']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/myworks_report/ipIncomeReport.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

            //Myworks Non Recurring Report
            .state('myworks.nonrecurringChargeReport', {
                url: '/Non-RecurringChargeReport',
                templateUrl: 'tpl/myworks_report/nonrecurringChargeReport.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['smart-table']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/myworks_report/nonrecurringChargeReport.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

            //Myworks Recurring Report
            .state('myworks.recurringChargeReport', {
                url: '/RecurringChargeReport',
                templateUrl: 'tpl/myworks_report/recurringChargeReport.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['smart-table']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/myworks_report/recurringChargeReport.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

            //Myworks Patient Merge
            .state('myworks.patientMerge', {
                url: '/patientMerge',
                templateUrl: 'tpl/myworks/patient_merge.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['smart-table']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/myworks/patient_merge.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

            //MyWorks Audit log report
            .state('myworks.audit_log', {
                url: '/audit_log',
                templateUrl: 'tpl/myworks/audit_log.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['smart-table']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/myworks/audit_log.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

            //Patient Billing History
            .state('patient.viewBillingHistory', {
                url: '/viewBillingHistory/{id}/{enc_id}',
                templateUrl: 'tpl/patient_billing/view_billing_history.html',
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load([
                                'tpl/patient_billing/patient_billing.js?v=' + APP_VERSION,
                            ]);
                        }]
                }
            })

            //PHARMACY Stock Report
            .state('pharmacy.stockReport', {
                url: '/stockReport',
                templateUrl: 'tpl/pharmacy_report/stockReport.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['smart-table']).then(
                                    function () {
                                        return $ocLazyLoad.load('tpl/pharmacy_report/stockReport.js?v=' + APP_VERSION);
                                    }
                            );
                        }]
                }
            })

    $httpProvider.interceptors.push('APIInterceptor');
}
run.$inject = ['$rootScope', '$state', '$stateParams', '$location', '$cookieStore', '$http', '$window', 'CommonService', 'AuthenticationService', '$timeout', '$templateCache'];
function run($rootScope, $state, $stateParams, $location, $cookieStore, $http, $window, CommonService, AuthenticationService, $timeout) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    var serviceUrl = '';
    var orgUrl = '';
    var clientURL = '';
    if ($location.host() == 'hms.ark') {
        serviceUrl = 'http://hms.ark/api/IRISORG/web/v1'
        orgUrl = 'http://hms.ark/client';
        clientURL = 'http://hms.ark';
    } else if ($location.host() == 'apollo.local') {
        serviceUrl = 'http://apollo.local/api/IRISORG/web/v1'
        orgUrl = 'http://apollo.local/client';
        clientURL = 'http://apollo.local';
    } else if ($location.host() == 'medclinic.ark') {
        serviceUrl = 'http://medclinic.ark/api/IRISORG/web/v1'
        orgUrl = 'http://medclinic.ark/client';
        clientURL = 'http://medclinic.ark';
    } else if ($location.host() == 'msctrf.ark') {
        serviceUrl = 'http://msctrf.ark/api/IRISORG/web/v1'
        orgUrl = 'http://msctrf.ark/client';
        clientURL = 'http://msctrf.ark';
    } else {
        clientURL = orgUrl = $location.absUrl().split('#')[0].slice(0, -1);
//        clientURL = orgUrl = $location.protocol() + '://' + $location.host();
        serviceUrl = clientURL + '/api/IRISORG/web/v1'
    }

    $rootScope.IRISOrgServiceUrl = serviceUrl;
    $rootScope.commonService = CommonService;
    $rootScope.authenticationService = AuthenticationService;
    $rootScope.IRISOrgUrl = orgUrl;
    $rootScope.clientUrl = clientURL;
//    var currentUser = AuthenticationService.getCurrentUser();

    $rootScope.globals = $cookieStore.get('globals') || {};
    $rootScope.$on('$locationChangeStart', function (event, next, current) {
        if ($location.path() == '/access/resetpwd') {
            var token = $location.search().token;
            $rootScope.commonService.GetPasswordResetAccess(token, function (response) {
                if (response.success === false) {
//                    $scope.authError = response.message;
                    $location.path('/access/signin');
                }
            });
        } else {
            var restrictedPage = $.inArray($location.path(), ['/access/signin', '/access/forgotpwd', '/access/resetpwd']) === -1;
            var currentUser = AuthenticationService.getCurrentUser();
            var loggedIn = Boolean(currentUser);
            var stay_date = AuthenticationService.getCurrent();
            var today_date = moment().format("YYYY-MM-DD hh:mm:ss");
            if (restrictedPage && !loggedIn) {
                $location.path('/access/signin');
            } else if (!restrictedPage && loggedIn) {
                $location.path('/configuration/organization');
            } else if (restrictedPage && loggedIn) {
                $http.post($rootScope.IRISOrgServiceUrl + '/user/welcome',
                        {
                            user_id: currentUser.credentials.user_id,
                            today_date: today_date,
                            stay_date: stay_date,
                        })
                        .success(function (response) {
                            event.preventDefault();
                            if (!response) {
                                if (AuthenticationService.ClearCredentials()) {
                                    $timeout(function () {
                                        $window.location.reload();
                                    }, 1000);
                                }
                            }
                        });
            }
        }
    });
    //Check Access
    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        $rootScope.currentPage = ' ';
        var restrictedPage = $.inArray($location.path(), ['/configuration/changePassword']) === -1;
        var currentUser = AuthenticationService.getCurrentUser();
        var loggedIn = Boolean(currentUser);
        var page = toState.name.split('.');
        $rootScope.currentPage = page[0];
        if (toState.name == 'patient.inPatients') {
            $rootScope.currentPage = 'IP';
        } else if (toState.name == 'patient.outPatients') {
            $rootScope.currentPage = 'OP';
        }

        //In patients page remove double scrollbar.
        if (toState.name == 'patient.inPatients') {
            $("body").css({"overflow": "hidden"});
        } else {
            $("body").css({"overflow": ""});
        }

        if (loggedIn) {
            var stateName = toState.name;
            if (stateName) {
                if (restrictedPage) {
                    $rootScope.commonService.CheckStateAccess(stateName, function (response) {
                        if (!response) {
                            $state.go('configuration.organization');
                        }
                    });
                }
            }
        }
    });
}