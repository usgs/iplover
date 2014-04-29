/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */




// Get records
function getRecordKeys() {
  if (!Modernizr.localstorage) return false;
  
  if(localStorage.getItem("index")){
    return JSON.parse(localStorage.getItem("index"));
  }else{
      return false;
  }
}

function getRecord(key){
    return localStorage.getItem(key);
}

// Saves records locally
function addRecord(key, data){
    if(!localStorage.getItem("index")){
        localStorage.setItem("index", JSON.stringify(new Array()));
    }
    var indx = JSON.parse(localStorage.getItem("index"));
    
    localStorage.setItem(key, data);
    indx.push(key);
    localStorage.setItem("index", JSON.stringify(indx));   
}

function removeRecord(key){
    localStorage.removeItem(key);
    var indx = JSON.parse(localStorage.getItem("index"));
    if(indx.indexOf(key) > -1){
       indx.splice(indx.indexOf(key), 1);
    }
    localStorage.setItem("index", JSON.stringify(indx));
}

function numRecords(){
    
    var records = getRecordKeys();
    var num_records = 0;
    if(records){
        num_records = Object.keys(records).length;
    }
    return num_records;
}

