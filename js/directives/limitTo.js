angular.module('app').directive('limitTo', function () {
    return {
        restrict: "A",
        link: function(scope, elem, attrs) {
            var limit = parseInt(attrs.limitTo);
            angular.element(elem).on("keydown keypress keyup", function(event) {
                if (this.value.length == limit && jQuery.inArray(event.keyCode, [8,9,37,38,39,40])  === -1) return false;
//                if (this.value.length == limit && event.keyCode != 8 && event.keyCode != 9) return false;
            });
        }
    };
});