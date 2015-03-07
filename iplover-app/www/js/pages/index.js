
document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
	setTimeout(function() {
    	 navigator.splashscreen.hide();
	}, 2000);
}

