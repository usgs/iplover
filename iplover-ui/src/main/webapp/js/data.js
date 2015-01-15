/* 
 * 
 * 
 */
function nullDataHandler (transaction, results){}

function errorHandler (transaction, error){
    // error.message is a human-readable string.
    // error.code is a numeric error code
    alert('Error:'+error.message+' (Code '+error.code+')');
 
    // Handle errors here
    //var we_think_this_error_is_fatal = true;
    //if (we_think_this_error_is_fatal) return true;
    return false;    
}

function createTables(){
	db.transaction(
        function (transaction) {
        	transaction.executeSql('CREATE TABLE IF NOT EXISTS sites(key STRING NOT NULL, data TEXT NOT NULL);', 
                [], nullDataHandler, errorHandler);
        }
    );
}


function initDatabase() {
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
 
	    if (e == 2) {
	        // Version number mismatch.
	        console.log("Invalid database version.");
	    } else {
	        console.log("Unknown error "+e+".");
	    }
	    return;
	}
}


// Returns an array of keys that are currently stored in the DB
function getRecordKeys(callback) {
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
  
}

function getRecord(key, callback){
    db.transaction(function(tr){
        tr.executeSql('SELECT data FROM sites WHERE key=?;',[key], 
        function(tx,results){
            callback(results.rows.item(0).data);
        },
        function(tx, error){
            console.log(error);
        });
    });
}

// Saves records locally
function addRecord(key, data, callback){
    
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
}

function removeRecord(key, callback){
    
    db.transaction(function(tr){
        tr.executeSql('DELETE FROM sites WHERE key=?;',[key], 
        function(tx,results){
            callback(); //called when delete is finished
        },
        function(tx, error){
            console.log(error);
        });
    });
}

function numRecords(callback){
    
    db.transaction(function(tr){
        tr.executeSql('SELECT COUNT(*) as num FROM sites;',[], 
        function(tx,results){
            callback(results.rows.item(0).num);
        },
        function(tx, error){
            console.log(error);
        });
    });
}

