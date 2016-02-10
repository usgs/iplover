
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
                
                if(iplover.auth.checkUnauthorized(jqXHR)){
                	return;
                }
                iplover.data.clobberAllRecords(response);
                onSyncAllEnd();
            },
            error:function(jqXHR, textStatus, errorThrown){
                if(!iplover.auth.checkUnauthorized(jqXHR)){
                	onError(errorThrown);
                }
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
        
        if(topost.deleted & !topost.on_server){
        
        	//Remove record and continue to next one
        	iplover.data.rmRecordById(topost.uuid);

			//I don't care if the file delete is successful
			// either way, move on to the next        	
        	onErrOrSuccess = function(){
	            //Drop the record we just did, pass on rest
        	    records.splice(0,1);
                    
    	        //Start next one
	            postRecords(records);	
        	};
        	
        	iplover.data.deleteImage(topost.image_path, onErrOrSuccess, onErrOrSuccess);
        	return;

        }
        
        
        //populate it with ImageURL
        _post_function = function(fileurl){
            topost.image_fileurl = fileurl;
            //Deletion of l_e_calculations allows for syncing to database without that field.
            delete topost.last_edited_calculations;
            
            //POST
            $.ajax({
                type: "POST",
                contentType: "application/json; charset=utf-8",
				dataType: "json",
                url: iplover.recordsurl, 
                data: JSON.stringify(topost),
                headers: iplover.auth.getHeaderObj(),
                success:function(response, status, jqXHR){
                    
            	    if(iplover.auth.checkUnauthorized(jqXHR)){
        	        	return;
    	            }
    	            
                	//on success, delete local image and replace current local version
                    console.log(response);
                    
                    iplover.data.setRecordById(response.uuid, response);
                    
                    //delete image, once finished, start next upload
					uploadNext = function(){
                    
                    	//Drop the record we just did, pass on rest
                    	records.splice(0,1);
                    
                    	//Start next one
                    	postRecords(records);
                    };
					
                    iplover.data.deleteImage(topost.image_path, uploadNext, uploadNext);
                                        
                },
                error:function(jqXHR, textStatus, errorThrown){
                    if(!iplover.auth.checkUnauthorized(jqXHR)){
                    	onError(errorThrown);
                    }
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
        };
        
        
        
        iplover.data.getImageDataURL(topost.image_path, 
        	_post_function, 
        	function(error){
        		console.log('FileSystem Error code:' + error.code);
        		_post_function("missing");
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
        //Deletion of l_e_calculations allows for syncing to database without that field.
        delete toput.last_edited_calculations;

        //POST
        $.ajax({
            type: "PUT",
            contentType: "application/json", 
            url: iplover.recordsurl, 
            data: JSON.stringify(toput),
            headers: iplover.auth.getHeaderObj(),
            success:function(response, status, jqXHR){
                
                if(iplover.auth.checkUnauthorized(jqXHR)){
                	return;
                }
                //on success, delete local image and replace current local version
                console.log(response);
                
                iplover.data.setRecordById(response.uuid, response);
                
                //Drop the record we just did, pass on rest
                records.splice(0,1);
                
                //Start next one
                putRecords(records);
                
            },
            error:function(jqXHR, textStatus, errorThrown){
                if(!iplover.auth.checkUnauthorized(jqXHR)){
                	onError(errorThrown);
                }
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
