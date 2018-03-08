angular.module('app').factory('APIInterceptor', function ($localStorage, $rootScope, $q, $timeout, $templateCache) {
    return {
        request: function (request) {
            request.params = request.params || {};

            var is_api = request.url.indexOf($rootScope.IRISOrgServiceUrl);
            if (is_api >= 0) {
                if (typeof request.headers['x-domain-path'] == 'undefined' || request.headers['x-domain-path'] == '')
                    request.headers['x-domain-path'] = $rootScope.clientUrl;
            }
            request.headers['config-route'] = $rootScope.$state.current.name;
            request.headers['request-time'] = moment().format('YYYY-MM-DD hh:mm:ss');

            if (typeof $localStorage.user != 'undefined') {
                var token = $localStorage.user.access_token;
                if (token && is_api >= 0) {
                    request.params['access-token'] = token;
                }
            }
            if ($templateCache.get(request.url) === undefined) {
                request.params['appVersion'] = APP_VERSION;
            }

            return request;
        },
        response: function (response) {
            $('.selectpicker').selectpicker('refresh');
            $timeout(function () {
                $('.selectpicker').selectpicker('refresh');
            }, 3000);
            return response;
        },
        responseError: function (rejection) {
            // do something on error
            if (rejection.status === 401) {
                $rootScope.$broadcast('unauthorized');
            } else if (rejection.status === 500) {
                $rootScope.$broadcast('internalerror');
            }
            return $q.reject(rejection);
        }
    };
});