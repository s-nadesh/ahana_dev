$(document).ready(function () {
    $("a[class='custom-close-sidebar']").click(function () {
        setTimeout(function () { // Wait for closing animation to finish.
            $.slidebars.close();
        }, 400);
    });

//Image Preview
    $("body").on('mouseover', 'img', function () {
        var prevSRC = $(this).data('preview-img');
        if (prevSRC != '') {
            $("#patient-preview-pop-up img").attr('src', prevSRC);
            $("#patient-preview-pop-up").show();
        }
    }).on('mouseout', 'img', function () {
        if ($("#patient-preview-pop-up").is(':visible')) {
            $("#patient-preview-pop-up img").attr('src', '');
            $("#patient-preview-pop-up").hide();
        }
    });
});

$(document).mouseup(function (e) {
    var container = $("#patientcont-header.search-patientcont-header");
    var input_box = $(".header_search_input");

    if (!container.is(e.target) && container.has(e.target).length === 0 && !input_box.is(e.target)) {
        container.hide();
    } else {
        container.show();
    }

    var container_2 = $("#prescriptioncont-header.search-patientcont-header");
    var input_box_2 = $(".prescription_search_input");

    if (!container_2.is(e.target) && container_2.has(e.target).length === 0 && !input_box_2.is(e.target)) {
        container_2.hide();
    } else {
        container_2.show();
    }

    var container_3 = $("#patient-merge.result-patient-merge");
    var input_box_3 = $(".patient_merge_input");

    if (!container_3.is(e.target) && container_3.has(e.target).length === 0 && !input_box_3.is(e.target)) {
        container_3.hide();
    } else {
        container_3.show();
    }
});

$(document).bind('click', function (e) {
    var $clicked = $(e.target);
    if ($clicked.closest('.patient-details-part').find('.trigger-close').length == 0) {
        if ($('.patient-details-part .trigger-close').next('.popover').is(':visible'))
            $('.trigger-close').trigger('click');
    }
    if ($clicked.hasClass('alert-read-more')) {
        $('.trigger-close').trigger('click');
    }
    if ($clicked.hasClass('allergies-read-more')) {
        $('.trigger-allergies-close').trigger('click');
    }
    if ($clicked.closest('.patient-details-part').find('.trigger-allergies-close').length == 0) {
        if ($('.patient-details-part .trigger-allergies-close').next('.popover').is(':visible'))
            $('.trigger-allergies-close').trigger('click');
    }
    
});

function chunk(str, n) {
    var ret = [];
    var i;
    var len;

    for (i = 0, len = str.length; i < len; i += n) {
        ret.push(str.substr(i, n))
    }

    return ret
}

function profilePhoto(selecter) {
    $('table tbody img').each(function() {
        $(this).attr('src', $(this).attr('lazy-img'));
    });
    
    $(selecter).photoZoom({
        zoomStyle: {
            "border": "1px solid #ccc",
            "background-color": "#fff",
            "box-shadow": "0 0 5px #888",
            'z-index': '999'
        },
    });
}