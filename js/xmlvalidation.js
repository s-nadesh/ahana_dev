function OThersvisible(current_id, target_id, status) {
    if ($("#" + current_id).is(':checked')) {
        $("#" + target_id).removeClass('hide');
        $("#" + target_id).addClass('show');
    } else {
        $("#" + target_id).removeClass('show');
        $("#" + target_id).addClass('hide');
    }

    if (status == 'none') {
        $("#" + target_id).removeClass('show');
        $("#" + target_id).addClass('hide');
    }
    if (status == 'block') {
        $("#" + target_id).removeClass('hide');
        $("#" + target_id).addClass('show');
    }
}

function OThersDDtextvisible(current_id, current_value, target_id, status) {
    if (current_value == 'Others') {
        $("#" + target_id).removeClass('hide');
        $("#" + target_id).addClass('show');
    } else {
        $("#" + target_id).removeClass('show');
        $("#" + target_id).addClass('hide');
    }
}

function isNumericKeyStroke(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;

    var returnValue = false;
    // 8 - Backspace, 13 - Carriage Return (Enter), 9 - Tab Key
    if (((charCode >= 48) && (charCode <= 57)) || (charCode == 8) || (charCode == 13) || (charCode == 9) || ((charCode >= 96) && (charCode <= 105)))
        returnValue = true

    return returnValue;
}

function isNumericDotKeyStroke(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    var returnValue = false;
    // 8 - Backspace, 13 - Carriage Return (Enter), 9 - Tab Key
    if (((charCode >= 48) && (charCode <= 57)) || (charCode == 8) || (charCode == 13) || (charCode == 110) || (charCode == 190) || (charCode == 9) || ((charCode >= 96) && (charCode <= 105)))
        returnValue = true

    return returnValue;
}

function isNumericDateStroke(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;

    var returnValue = false;
    // 8 - Backspace, 13 - Carriage Return (Enter), 9 - Tab Key
    if (((charCode >= 48) && (charCode <= 57)) || (charCode == 8) || (charCode == 13) || (charCode == 9) || ((charCode >= 96) && (charCode <= 105)) || ((charCode >= 109) && (charCode <= 111)) || ((charCode >= 189) && (charCode <= 191)))
        returnValue = true

    return returnValue;
}

function isNumericSlashStroke(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;

    var returnValue = false;
    // 8 - Backspace, 13 - Carriage Return (Enter), 9 - Tab Key 111, 191 - Slash
    if (((charCode >= 48) && (charCode <= 57)) || (charCode == 8) || (charCode == 13) || (charCode == 111) || (charCode == 191) || (charCode == 9) || ((charCode >= 96) && (charCode <= 105)) || ((charCode >= 109) && (charCode <= 111)) || ((charCode >= 189) && (charCode <= 191)))
        returnValue = true

    return returnValue;
}

function Checkvisible(a, e)
{
    if (a == 'menstrual_history')
    {
        var radioValue = $("input[name='gender']:checked").val();
        if (radioValue == 'Male')
        {
            e.stopPropagation();
        }
    }

}