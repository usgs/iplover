$(document).ready(function() {
    document.addEventListener("deviceReady",onDeviceReady,false);
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
    alert("Please check username and password.");
};

function onlogin(token, group){
    $("#spinner-img").hide();
    location.href = "home.html";
};

$(document).ready(function() {

    $("#login_button").click(function(){

        user = $('#username_input').val();
        pass = $('#password_input').val();

        iplover.auth.login(user, pass, onlogin, onfail);
        $("#spinner-img").show();
    });
});
