app.controller('FutureAppointmentCalenderController', ['$rootScope', '$scope', '$http', '$modal', '$log', '$filter', '$state', function ($rootScope, $scope, $http, $modal, $log, $filter, $state) {

        $scope.app.settings.patientTopBar = false;
        $scope.app.settings.patientSideMenu = false;
        $scope.app.settings.patientContentClass = 'app-content app-content3';
        $scope.app.settings.patientFooterClass = 'app-footer app-footer3';

        var currentdate = new Date();
        var d = currentdate.getDate();
        var m = currentdate.getMonth();
        var y = currentdate.getFullYear();

        /* event source that pulls from google.com */
        $scope.eventSource = {
            url: "http://www.google.com/calendar/feeds/usa__en%40holiday.calendar.google.com/public/basic",
            className: 'gcal-event', // an option!
            currentTimezone: 'America/Chicago' // an option!
        };

        $scope.consultant_colors = ["bg-light dk b-l b-2x b-danger", "bg-light dk b-l b-2x b-info", "bg-light dk b-l b-2x b-warning", "bg-light dk b-l b-2x b-primary"];

        $scope.events = [];
        $http.get($rootScope.IRISOrgServiceUrl + '/appointment/getfutureappointments')
                .success(function (data) {
                    angular.forEach(data, function (item) {
                        result = $scope.groupConsultants(item);
                        $scope.events.push({
                            id: item.consultant_id,
                            title: item.consultant_name + " - " + item.consultant_perday_appt_count,
                            start: item.status_date,
                            end: item.status_date,
                            className: result.className,
                            url: $state.href('patient.futureAppointmentList', {
                                consultant_id: item.consultant_id, 
                                date: item.status_date
                            })
                        });
                    });
                });

        $scope.consultants = [];
        $scope.groupConsultants = function (data) {
            var result = {};
            if ($scope.consultants.length == 0) {
                result = $scope.pushConsultant(data);
            } else {
                checkConsultantExists = $filter('filter')($scope.consultants, {id: data.consultant_id});
                if (typeof checkConsultantExists[0] == 'undefined') {
                    result = $scope.pushConsultant(data);
                } else {
                    checkConsultantExists[0].visit_count = parseInt(checkConsultantExists[0].visit_count) + parseInt(data.consultant_perday_appt_count);
                    result = checkConsultantExists[0];
                }
            }
            return result;
        };

        $scope.pushConsultant = function (data) {
            var result = {
                'id': data.consultant_id,
                'title': data.consultant_name,
                'visit_count': data.consultant_perday_appt_count,
                'className': []
            };
            $scope.consultants.push(result);
            $filter('filter')($scope.consultants, function (item) {
                if (item.id == data.consultant_id) {
                    key = $scope.consultants.indexOf(item);
                    item.className = [$scope.consultant_colors[key % 4]];
                }
            });
            return result;
        }

        /* toggle event */
        $scope.showHideEvents = function (consultant, key) {
            key ? $scope.add(consultant) : $scope.remove(consultant);
        };

        /* remove event */
        $scope.removedevents = [];
        $scope.remove = function (consultant) {
            result = $filter('filter')($scope.events, {id: consultant.id});
            angular.forEach(result, function (item) {
                $scope.removedevents.push(item);
                $scope.events.splice($scope.events.indexOf(item), 1);
                $('.calendar').fullCalendar('removeEvents', consultant.id);
            });
        };

        /* add event */
        $scope.add = function (consultant) {
            result = $filter('filter')($scope.removedevents, {id: consultant.id});
            angular.forEach(result, function (item) {
                $scope.events.push(item);
                $scope.removedevents.splice($scope.removedevents.indexOf(item), 1);
            });
        };

        //Add New Event
        $scope.add_appointment = function (date) {
            var modalInstance = $modal.open({
                templateUrl: 'tpl/modal_form/modal.patient_appointment.html',
                controller: "ModalPatientAppointmentController",
                resolve: {
                    scope: function () {
                        return $scope;
                    },
                }
            });

            modalInstance.data = {
                title: 'Add Future Appointment',
                date: date
            };

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        }

        /* alert on dayClick */
        $scope.precision = 400;
        $scope.lastClickTime = 0;
        $scope.alertOnEventClick = function (date, jsEvent, view) {
            var todayDate = new Date();
            var eventDate = date;
            if (eventDate > todayDate) {
                var time = todayDate.getTime();
                if (time - $scope.lastClickTime <= $scope.precision) {
                    $scope.add_appointment(date);
                }
                $scope.lastClickTime = time;
            }
        };

        /* alert on Drop */
        $scope.alertOnDrop = function (event, delta, revertFunc, jsEvent, ui, view) {
            $scope.alertMessage = ('Event Droped to make dayDelta ' + delta);
        };
        /* alert on Resize */
        $scope.alertOnResize = function (event, delta, revertFunc, jsEvent, ui, view) {
            $scope.alertMessage = ('Event Resized to make dayDelta ' + delta);
        };

        $scope.overlay = $('.fc-overlay');
        $scope.alertOnMouseOver = function (event, jsEvent, view) {
            $scope.event = event;
            $scope.overlay.removeClass('left right top').find('.arrow').removeClass('left right top pull-up');
            var wrap = $(jsEvent.target).closest('.fc-event');
            var cal = wrap.closest('.calendar');
            var left = wrap.offset().left - cal.offset().left;
            var right = cal.width() - (wrap.offset().left - cal.offset().left + wrap.width());
            var top = cal.height() - (wrap.offset().top - cal.offset().top + wrap.height());
            if (right > $scope.overlay.width()) {
                $scope.overlay.addClass('left').find('.arrow').addClass('left pull-up')
            } else if (left > $scope.overlay.width()) {
                $scope.overlay.addClass('right').find('.arrow').addClass('right pull-up');
            } else {
                $scope.overlay.find('.arrow').addClass('top');
            }
            if (top < $scope.overlay.height()) {
                $scope.overlay.addClass('top').find('.arrow').removeClass('pull-up').addClass('pull-down')
            }
            (wrap.find('.fc-overlay').length == 0) && wrap.append($scope.overlay);
        }

        /* config object */
        $scope.uiConfig = {
            calendar: {
                height: 450,
                editable: false,
                draggable: false,
                header: {
                    left: 'prev',
                    center: 'title',
                    right: 'next'
                },
                dayRender: function (date, cell) {
                    if (date <= currentdate) {
                        $(cell).addClass('fc-state-disabled');
                    }
                },
                dayClick: $scope.alertOnEventClick,
//                eventDrop: $scope.alertOnDrop,
//                eventResize: $scope.alertOnResize,
//                eventMouseover: $scope.alertOnMouseOver
            }
        };

        /* Change View */
        $scope.changeView = function (view, calendar) {
            $('.calendar').fullCalendar('changeView', view);
        };

        $scope.today = function (calendar) {
            $('.calendar').fullCalendar('today');
        };

        /* event sources array*/
        $scope.eventSources = [$scope.events];
        
        $scope.switch = function(type){
            $('.view_div').hide();
            $('.a_view').hide();
            
            $('#'+type).show();
            $('#a_'+type).show();
            
            $scope.changeView('month');
            if(type == 'calendar_view'){
//                $scope.$parent.loadEvents();
            }
        }
    }]);
/* EOF */
