$(document).ready((() => {

    $('#list-form').submit(function(e){
        e.preventDefault(); // <----stops the form to get submitted
        $.ajax({
           url:'/testRoute',
           data:{
                  a     :$('p[name="stretched-link"]').text() // send the p's text.
           },
           success:function(data){
             console.log(data); // logs the response from the server.
           },
           error:function(){}
       });
      });
      


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