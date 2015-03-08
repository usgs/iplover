
$(document).ready(function() {
    
    $("#logout").click(function(){
        
        return confirm('Are you sure you want to logout?\n' + 
                'Until you have an internet connection, you will not be able to log in.');
         
        });
    
});