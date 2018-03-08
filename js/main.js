'use strict';

/* Controllers */

angular.module('app')
        .controller('AppCtrl', ['$scope', '$translate', '$localStorage', '$window', '$rootScope', '$state', '$cookieStore', 'CommonService', '$timeout', '$http', 'AuthenticationService',
            function ($scope, $translate, $localStorage, $window, $rootScope, $state, $cookieStore, CommonService, $timeout, $http, AuthenticationService) {
                // add 'ie' classes to html
                var isIE = !!navigator.userAgent.match(/MSIE/i);
                isIE && angular.element($window.document.body).addClass('ie');
                isSmartDevice($window) && angular.element($window.document.body).addClass('smart');

                // config
                $scope.app = {
                    name: 'Ahana HMS',
                    version: '',
                    // for chart colors
                    color: {
                        primary: '#7266ba',
                        info: '#23b7e5',
                        success: '#27c24c',
                        warning: '#fad733',
                        danger: '#f05050',
                        light: '#e8eff0',
                        dark: '#3a3f51',
                        black: '#1c2b36'
                    },
                    settings: {
                        themeID: 1,
                        navbarHeaderColor: 'bg-black',
                        navbarCollapseColor: 'bg-white-only',
                        asideColor: 'bg-black',
                        headerFixed: true,
                        asideFixed: false,
                        asideFolded: false,
                        asideDock: false,
                        container: false
                    }
                }
                $scope.copyRightdate = new Date();

                // save settings to local storage
                if (angular.isDefined($localStorage.settings)) {
                    $scope.app.settings = $localStorage.settings;
                } else {
                    $localStorage.settings = $scope.app.settings;
                }
                $scope.$watch('app.settings', function () {
                    if ($scope.app.settings.asideDock && $scope.app.settings.asideFixed) {
                        // aside dock and fixed must set the header fixed.
                        $scope.app.settings.headerFixed = true;
                    }
                    // save to local storage
                    $localStorage.settings = $scope.app.settings;
                }, true);

                $scope.loggedIn = function () {
                    return Boolean($rootScope.globals.currentUser);
                };

                $scope.logout = function () {
                    $http.post($rootScope.IRISAdminServiceUrl + '/user/logout')
                            .success(function (response) {
                                if (response.success) {
                                    if (AuthenticationService.ClearCredentials()) {
                                        $timeout(function () {
                                            $window.location.reload();
                                        }, 1000);
                                    }
                                } else {
                                    $scope.errorData = response.message;
                                }
                            })
                            .error(function () {
                                $scope.errorData = "An Error has occured!";
                            });
                };

                //Change Status
                $scope.updateStatus = function (modelName, primaryKey, clientUrl) {
                    $scope.service = CommonService;
                    $scope.service.ChangeStatus(modelName, primaryKey, clientUrl, function (response) {
                        $scope.successMessage = 'Status changed successfully !!!';
                    });
                }

                $scope.$watch('successMessage', function (newValue, oldValue) {
                    if (newValue != '') {
                        $timeout(function () {
                            $scope.successMessage = '';
                        }, 3000);
                    }

                }, true);

                //show/hide Load bar
                $scope.loadbar = function (mode) {
                    if (mode == 'show') {
                        $('.butterbar').removeClass('hide').addClass('active');
                        $('.save-btn').attr('disabled', true);
                    } else if (mode == 'hide') {
                        $('.butterbar').removeClass('active').addClass('hide');
                        $('.save-btn').attr('disabled', false);
                    }
                }

                function isSmartDevice($window)
                {
                    // Adapted from http://www.detectmobilebrowsers.com
                    var ua = $window['navigator']['userAgent'] || $window['navigator']['vendor'] || $window['opera'];
                    // Checks for iOs, Android, Blackberry, Opera Mini, and Windows mobile devices
                    return (/iPhone|iPod|iPad|Silk|Android|BlackBerry|Opera Mini|IEMobile/).test(ua);
                }

                $scope.onlyLetters = /^[a-zA-Z0-9]*$/;

                //error Summary
                $scope.errorSummary = function (error) {
                    var html = '<div><p>Please fix the following errors:</p><ul>';
                    angular.forEach(error, function (error) {
                        html += '<li>' + error.message + '</li>';
                    });

                    html += '</ul></div>';
                    return html;
                }
            }]);
