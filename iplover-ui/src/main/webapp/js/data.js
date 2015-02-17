if(typeof iplover === 'undefined'){
	iplover = [];
}

iplover.data = (function(){
	
	//
	//This saves the image to the persistent storage (if available)
	// and returns the image file path
	//
	var saveImage = function(image){
		return "TODO:implement this function";
	};
	
	var newRecord = function(data, image){
		
        
		var records = [];
		if(localStorage.records){
			records = JSON.parse(localStorage.records)
		}else{
			records = new Array();
		}
		
		var imgPath = saveImage(image);
		data['image_path'] = imgPath;
		
		records.push(data);
		
		localStorage.records = JSON.stringify(records);
		return true;
	};
	
	//
	//This returns an array of iplover record objects
	// that match the record_state pattern 
	// record states:['unsynced', 'synced', 'edited', 'deleted']
	// Can also pass nothing and get back all records
	//
	var getRecords = function(record_state){
		
		var records = [];
		if(localStorage.records){
			records = JSON.parse(localStorage.records)
		}else{
			records = new Array();
		}
        
        records = records.filter(function(element){return !element.deleted});
		
		if(!record_state){
			return records;
		}else{
			// filter and then return
			var toreturn = records.filter(function(element){return element.memstate == record_state;});
			return toreturn;
		}
	};
    
    var getRecordById = function(uuid){
        
        var records = getRecords();
        // filter and then return
        var toreturn = records.filter(function(element){return element.uuid == uuid;});
        if(toreturn.length == 1){
            return toreturn[0];
        }else{
            return null;
        }
        
    };
    
    var setRecordById = function(uuid, record){
        
        var records = [];
        if(localStorage.records){
            records = JSON.parse(localStorage.records)
        }else{
            records = new Array();
        }
        
        var indx = records.map(function(e) {return e.uuid;}).indexOf(uuid);
        
        if(indx < 0){
            console.log('Error saving record with uuid:' + uuid);
            alert("Error saving site \n" + uuid);
        }
        
        records.splice(indx, 1, record);
        
        localStorage.records = JSON.stringify(records);
    };
	
    
    var getDeviceInfo = function(){
        if(typeof device != 'undefined'){
            return device.platform + ' ' + device.version;
        }else{
            return window.navigator.userAgent;
        }
    };
    
    var getGroup = function(){
        if(!localStorage.group){
            return "unknown";
        }else{
            return localStorage.group;
        }
    };
    
    var setGroup = function(group){
        localStorage.group = group;
    };
    
    return {newRecord     : newRecord, 
            getRecords    : getRecords,
            getRecordById : getRecordById,
            setRecordById : setRecordById,
            getDeviceInfo : getDeviceInfo,
            getGroup      : getGroup, 
            setGroup      : setGroup
            }
    
})();
