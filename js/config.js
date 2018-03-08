// config

var app =
        angular.module('app')
        .config(config);

config.$inject = ['$controllerProvider', '$compileProvider', '$filterProvider', '$provide'];
function config($controllerProvider, $compileProvider, $filterProvider, $provide) {
    $compileProvider.debugInfoEnabled(false);
    // lazy controller, directive and service
    app.controller = $controllerProvider.register;
    app.directive = $compileProvider.directive;
    app.filter = $filterProvider.register;
    app.factory = $provide.factory;
    app.service = $provide.service;
    app.constant = $provide.constant;
    app.value = $provide.value;
    
    $provide.decorator('datepickerDirective', function($delegate) {
            var directive = $delegate[0];
            var link = directive.link;

            directive.compile = function() {
                return function(scope, element, attrs, ctrls) {
                    link.apply(this, arguments);

                    var datepickerCtrl = ctrls[0];
                    var ngModelCtrl = ctrls[1];

                    if (ngModelCtrl) {
                        // Listen for 'refreshDatepickers' event...
                        scope.$on('refreshDatepickers', function refreshView() {
                            datepickerCtrl.refreshView();
                        });
                    }
                }
            };
            return $delegate;
        });
}