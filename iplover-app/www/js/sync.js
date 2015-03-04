
if(typeof iplover === 'undefined'){
	iplover = [];
}


iplover.sync = (function(){
    
    
    var onsyncend = function(){};
    
    var onupdate  = function(percent){};
    
    var onnonserverend  = function(){};
    
    var syncAll = function(){
        //POST Nonserver records
        postRecords(iplover.data.getNonserverRecords());
        
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
        
        if(records.length < 1){
            onnonserverend();
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
                contentType: "applicatoin/json; charset=utf-8", 
                url: iplover.recordsurl, 
                data: data,
                success:function(response){
                    //on success, delete local image and replace current local version
                    console.log(response);
                    
                    iplover.data.setRecordById(topost.uuid, topost);
                    
                    //delete image
                    iplover.data.deleteImage(topost.image_path, function(){});
                    
                    //Drop the record we just did, pass on rest
                    records.splice(0,1);
                    
                    //Start next one
                    postRecords(records);
                    
                },
                error:function(jqXHR, textStatus, errorThrown){
                    
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
        });
        
        return;
    };
    
    return {
        syncAll   : syncAll,
        onsyncend : onsyncend,
        onupdate  : onupdate
        };
})();
