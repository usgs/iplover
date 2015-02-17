if(typeof iplover === 'undefined'){
	iplover = [];
}

iplover.Nestsite = function(siteid, lat, lon, acc, pic, geomorphic, substrate, vegtype, vegdens, initdate, notes){
	
	this.dbid   = null;
	this.siteid = siteid;
	this.lat    = lat;
	this.lon    = lon;
	this.acc    = acc;
	this.pic    = pic;
	this.geomorphic = geomorphic;
	this.substrate  = substrate;
	this.vegtype    = vegtype;
	this.vegdens    = vegdens;
	this.initdate   = initdate;
	this.notes      = notes;
	
	this.memstate   = 'new'; //Can have 3 states, ['new', 'saved', 'edited']
}


