

(function(){
	
	var DB_VERSION_MISMATCH = 2;
	
	/* 
	 * Used as null handler when no action is required
	 */
	iplover.data.nullDataHandler = function(transaction, results){};

	iplover.data.errorHandler = function(transaction, error){
		// error.message is a human-readable string.
		// error.code is a numeric error code
		alert('Error:'+error.message+' (Code '+error.code+')');
	 
		// Handle errors here
		//var we_think_this_error_is_fatal = true;
		//if (we_think_this_error_is_fatal) return true;
		return false;    
	};

	iplover.data.createTables = function(){
		db.transaction(
			function (transaction) {
				transaction.executeSql('CREATE TABLE IF NOT EXISTS sites(key STRING NOT NULL, data TEXT NOT NULL);', 
					[], nullDataHandler, errorHandler);
			}
		);
	};


	iplover.data.initDatabase = function() {
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
	iplover.data.getRecordKeys = function(callback) {
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

	iplover.data.getRecord = function(key, callback){
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
	iplover.data.addRecord = function(key, data, callback){
		
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

	iplover.data.removeRecord = function(key, callback){
		
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

	iplover.data.numRecords = function(callback){
		
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
	
})();

