if(typeof iplover === 'undefined'){
	iplover = [];
}

iplover.auth = (function(){
    
    
    var onlogin = function(token, group){};
    
    var onfail  = function(message){};
    
    //returns group and 
    var login = function(user, pass, loginfun, failfun){
        onfail = failfun;
        onlogin = loginfun;
        
        $.post(iplover.authurl, {"username":user, "password":pass}, function(message, type, xhr) {
            //verify we got an auth-token back
            if(!message['auth-token']){
                onfail(message);
                return;
            };
            
            console.log(message['auth-token']);
            console.log(message['group']);
            
            setToken(message['auth-token']);
            iplover.data.setGroup(message['group']);
            iplover.data.setUser(user);
            
            onlogin(message['auth-token'], message['group']);
        })
        .fail(function(xhr, message, errorthrown) {
            myxhr = xhr;
            onfail(message);
        });
    };
    
    var checkUnauthorized = function(xhr){
        if(xhr.status && xhr.status === 401){
            //redirect them back to index.
            navigator.notification.alert(
                    "You are not currently authorized, sending you back to log in.",
                    logout(),
                    "Unauthorized");
            return true;
        }
        return false;
    };
    
    var getHeaderObj = function(){
        return {"auth-token":getToken()};
    };
    
    var getToken = function(){
        return localStorage.token;
    };
    
    var setToken = function(token){
        return localStorage.token = token;
    };
    
    var logout = function(){
        setToken('');
        location.href = 'index.html';
    };
    
    return {
        login             : login,
        logout            : logout,
        checkUnauthorized : checkUnauthorized,
        getToken          : getToken,
        getHeaderObj      : getHeaderObj
    };
})();