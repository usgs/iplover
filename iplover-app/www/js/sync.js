
if(typeof iplover === 'undefined'){
	iplover = [];
}


iplover.sync = (function(){
    
    
    var onsyncend = function();
    
    var onupdate  = function(percent){};
    
    var syncAll = function(){
        //POST Nonserver records
        
        
        
        //PUT Unsynced Records
        
        
        //GET All and clobber local
        
        
        
    };
    
    
    var postNonserver = function(){
        
    };
    
    var putUnsynced = function(){
        
    };
    
    var getAllServerRecords = function(){
        
    };
    
    
    function postRecords(records){
        
        //Get first record if length > 0
        
        //populate it with ImageURL
        
        //POST
        
        
        //on success, delete local image and replace current local version
        
        $.ajax({
            type: "POST",
            contentType: "applicatoin/json; charset=utf-8", 
            url: iplover.recordsurl, 
            data: data,
            success:function(response){
                addResponse(response);
                console.log(response);
                //Remove the last upload now and start the next
                removeRecord(key, function(){
                    console.log("removed item "+key);
                    //window.alert(response);
                    $('#syncbutton').addClass('disabled');
                    updateNumRecords();
                    syncRecords();
                });
            },
            error:function( jqXHR, textStatus, errorThrown){
                
            },
            xhr: function(){
            // get the native XmlHttpRequest object
            var xhr = $.ajaxSettings.xhr() ;
            // set the onprogress event handler
            xhr.upload.onprogress = function(evt){
                var pct = Math.round(evt.loaded*100/evt.total) + "%";
            } ;
            // set the onload event handler
            xhr.upload.onload = function(evt){
                console.log('Done, maybe...');
            };
            xhr.upload.onabort = function(){
            };

            xhr.upload.error = function(evt){
                alert(evt);
            };
            // return the customized object
            return xhr;
            }
        });
        
        return null;
    };
    
    return {
        syncAll   : syncAll,
        onsyncend : onsyncend,
        onupdate  : onupdate
        
        };
}


