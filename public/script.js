const e = require("express")

$(document).ready((() => {

}))

    function showAlertMessage(showAlertMessage) {

    console.log(showAlertMessage)
    const elem = $('#wrong-pw-message')
    if (showAlertMessage == "true") {
        elem.removeClass('d-none')
    } else {
        elem.addClass('d-none')
    }

}