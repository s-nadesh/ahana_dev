//function init() {
//    window.addEventListener('scroll', function (e) {
//        var distanceY = window.pageYOffset || document.documentElement.scrollTop,
//                shrinkOn = 100,
//                header = document.querySelector("div.patient-panel");
//        if (header != null) {
//            body_class = document.querySelector("body");
//            if (distanceY > shrinkOn) {
//                classie.add(header, "smaller");
//                classie.add(body_class, "full-cont");
//            } else {
//                if (classie.has(header, "smaller")) {
//                    classie.remove(header, "smaller");
//                    classie.remove(body_class, "full-cont");
//                }
//            }
//        }
//    });
//}
//window.onload = init();