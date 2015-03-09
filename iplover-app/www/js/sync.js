
if(typeof iplover === 'undefined'){
	iplover = [];
}


iplover.sync = (function(){
    
    var onSyncAllEnd = function(){};
    
    var onProgress = function(percent){};
    
    var onNonserverEnd = function(){};
    
    var onEditedEnd = function(){};
    
    var onError = function(error){};
    
    var syncAll = function(success, progress, error){
        
        onSyncAllEnd = success;
        onProgress   = progress;
        onError      = error;
        
        //setup PUT updated records step
        onNonserverEnd = function(){
            putRecords(iplover.data.getChangedRecords());
        };
        
        //setup GET All and clobber local (runs at end)
        onEditedEnd = function(){
            getAllServerRecords();
        };
        
        //POST Nonserver records
        postRecords(iplover.data.getNonserverRecords());
        
        
    };
    
    //Gets all server records and updates local store
    var getAllServerRecords = function(){
        
        $.ajax({
            type: "GET",
            contentType: "application/json", 
            url: iplover.recordsurl, 
            headers: iplover.auth.getHeaderObj(),
            success:function(response, status, jqXHR){
                
                iplover.data.clobberAllRecords(response);
                onSyncAllEnd();
            }
        });
    };
    
    
    var postRecords = function(records){
        
        if(records.length < 1){
            onNonserverEnd();
            return;
        }
        
        //Get first record if length > 0
        topost = records[0];
        
        //populate it with ImageURL
        iplover.data.getImgeDataURL(topost.image_path, function(fileurl){
            topost.image_fileurl = fileurl;
            
            //POST
            $.ajax({
                type: "POST",
                contentType: "application/json", 
                url: iplover.recordsurl, 
                data: JSON.stringify(topost),
                headers: iplover.auth.getHeaderObj(),
                success:function(response, status, jqXHR){
                    //on success, delete local image and replace current local version
                    console.log(response);
                    
                    iplover.data.setRecordById(response.uuid, response);
                    
                    //delete image
                    iplover.data.deleteImage(topost.image_path, function(){});
                    
                    //Drop the record we just did, pass on rest
                    records.splice(0,1);
                    
                    //Start next one
                    postRecords(records);
                    
                },
                error:function(jqXHR, textStatus, errorThrown){
                    onError(errorThrown);
                },
                xhr: function(){
                    // get the native XmlHttpRequest object
                    var xhr = $.ajaxSettings.xhr() ;
                    // set the onprogress event handler
                    xhr.upload.onprogress = function(evt){
                        onProgress(evt.loaded*100/evt.total);
                    };
                    
                    return xhr;
                }
            });
        });
        
        return;
    };

        var putRecords = function(records){
        
        if(records.length < 1){
            onEditedEnd();
            return;
        }
        
        //Get first record if length > 0
        toput = records[0];
        
        //POST
        $.ajax({
            type: "PUT",
            contentType: "application/json", 
            url: iplover.recordsurl, 
            data: JSON.stringify(toput),
            headers: iplover.auth.getHeaderObj(),
            success:function(response, status, jqXHR){
                //on success, delete local image and replace current local version
                console.log(response);
                
                iplover.data.setRecordById(response.uuid, response);
                
                //Drop the record we just did, pass on rest
                records.splice(0,1);
                
                //Start next one
                putRecords(records);
                
            },
            error:function(jqXHR, textStatus, errorThrown){
                onError(errorThrown);
            }
        });
        
        return;
    };
    
    return {
        syncAll   : syncAll,
        onSyncAllEnd : onSyncAllEnd,
        onProgress  : onProgress
        };
})();
