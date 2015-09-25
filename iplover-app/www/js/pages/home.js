
$(document).ready(function() {
    
    
    
    $("#logout").click(function(){
        message = 'Are you sure you want to logout?\n' + 
                'You will not be able to login again unless you have an internet connection.';
        if(confirm(message)){
            iplover.auth.logout();
        }
    });
    
});