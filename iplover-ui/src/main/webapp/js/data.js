if(typeof iplover === 'undefined'){
	iplover = [];
}

(function(){
	
	iplover.data = [];
	
	var DB_VERSION_MISMATCH = 2;

	
	var errorHandler = function(transaction, error){
		// error.message is a human-readable string.
		// error.code is a numeric error code
		alert('Error:'+error.message+' (Code '+error.code+')');
	 
		// Handle errors here
		//var we_think_this_error_is_fatal = true;
		//if (we_think_this_error_is_fatal) return true;
		return false;    
	};

	var createTables = function(){
		db.transaction(
			function (transaction) {
				transaction.executeSql('CREATE TABLE IF NOT EXISTS sites(key STRING NOT NULL, data TEXT NOT NULL);', 
					[], function(){}, errorHandler);
			}
		);
	};


	var initDatabase = function() {
		try {
			if (!window.openDatabase) {
				alert('Databases are not supported in this browser.');
			} else {
				var shortName = 'ploverdb';
				var version = '1.0';
				var displayName = 'DEMO Database';
				var maxSize = 100000; //  bytes
				db = openDatabase(shortName, version, displayName, maxSize);
				createTables();
			}
		} catch(e) {
	 
			if (e == DB_VERSION_MISMATCH) {
				// Version number mismatch.
				console.log("Invalid database version.");
			} else {
				console.log("Unknown error "+e+".");
			}
		}
	};


	// Returns an array of keys that are currently stored in the DB
	var getRecordKeys = function(callback) {
		db.transaction(function(tr){
			tr.executeSql('SELECT key FROM sites;',[], 
			function(tx,results){
				var rKeys = new Array();
				for(var i=0; i < results.rows.length; i++){
					rKeys.push(results.rows.item(i).key);
				}
				callback(rKeys);
			},
			function(tx, error){
				console.log(error);
			});
		});
	  
	};

	var getRecord = function(key, callback){
		db.transaction(function(tr){
			tr.executeSql('SELECT data FROM sites WHERE key=?;',[key], 
			function(tx,results){
				callback(results.rows.item(0).data);
			},
			function(tx, error){
				console.log(error);
			});
		});
	};

	// Saves records locally
	var addRecord = function(key, data, callback){
		
		db.transaction(function(transaction){
			transaction.executeSql("INSERT INTO sites(key, data) VALUES(?, ?);", 
			[key, data], 
			function(transaction, results){
				console.log("Just saved:" + key);
				callback(results);
			},
			function(transaction, error){
				console.log(error);
			});
		});
	};

	var removeRecord = function(key, callback){
		
		db.transaction(function(tr){
			tr.executeSql('DELETE FROM sites WHERE key=?;',[key], 
			function(tx,results){
				callback(); //called when delete is finished
			},
			function(tx, error){
				console.log(error);
			});
		});
	};

	var numRecords = function(callback){
		
		db.transaction(function(tr){
			tr.executeSql('SELECT COUNT(*) as num FROM sites;',[], 
			function(tx,results){
				callback(results.rows.item(0).num);
			},
			function(tx, error){
				console.log(error);
			});
		});
	};
	
	//
	//This saves the image to the persistent storage (if available)
	// and returns the image file path
	//
	var saveImage = function(image){
		return "TODO:implement this function";
	};
	
	iplover.data.newRecord = function(data, image){
		
        data.store_state = 'unsynced';
        
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
	// record states:['new', 'saved', 'edited']
	// Can also pass nothing and get back all records
	//
	iplover.data.getRecords = function(record_state){
		
		var records = [];
		if(localStorage.records){
			records = JSON.parse(localStorage.records)
		}else{
			records = new Array();
		}
		
		if(!record_state){
			return records;
		}else{
			// filter and then return
			var toreturn = records.filter(function(element){return element.memstate == record_state;});
			return toreturn;
		}
	};
	
	iplover.data.getLatLons = function(){
		var allRecords = iplover.data.getRecords();
		lat = new Array(allRecords.length);
		lon = new Array(allRecords.length);
		for(var i=0; i<allRecords.length; i++){
			lat[i] = Number(allRecords[i]["location_lat"]);
			lon[i] = Number(allRecords[i]["location_lon"]);
		}
		return {lat:lat, lon:lon};
	};
    
    iplover.data.getDeviceInfo = function(){
        if(typeof device != 'undefined'){
            return device.platform + ' ' + device.version;
        }else{
            return window.navigator.userAgent;
        }
    };
    
    iplover.data.collection_group = "unknown";
    
})();

