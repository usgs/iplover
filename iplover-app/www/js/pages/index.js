$(document).ready(function() {
	document.addEventListener("deviceReady",onDeviceReady,false);
	
	$("#login_button").click(function(){

        user = $('#username_input').val();
        pass = $('#password_input').val();

        iplover.auth.login(user, pass, onlogin, onfail);
        $("#spinner-img").show();
    });
});

function onDeviceReady() {
	setTimeout(function() {
		if(iplover.auth.getToken() && iplover.auth.getToken() != ''){
        	location.href = "home.html";
    	}

    	 navigator.splashscreen.hide();
	}, 2000);

};

function onfail(message){
    $("#spinner-img").hide();
	navigator.notification.alert("Please check username and password",function(){},"Login failed");
};

function onlogin(token, group){
    $("#spinner-img").hide();
    location.href = "home.html";
};

//Doubling the document.ready functions seems wrong. Decide what to do about this.
//$(document).ready(function() {
//
//    $("#login_button").click(function(){
//
//        user = $('#username_input').val();
//        pass = $('#password_input').val();
//
//        iplover.auth.login(user, pass, onlogin, onfail);
//        $("#spinner-img").show();
//    });
//});
