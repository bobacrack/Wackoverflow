$(document).ready((() =>{
    

}))


function showAlertMessage(showAlertMessage){

    console.log(showAlertMessage)
    const elem = $('#wrong-pw-message')
    if(showAlertMessage == "true"){
        console.log("bye")
        elem.removeClass('d-none') 
    }else {
        console.log("hey")
        elem.addClass('d-none')
    }

}