if(typeof iplover === 'undefined'){
	iplover = [];
}

iplover.map = {

	setupMap:function(target_id){

		map = new ol.Map({
			target: 'map',
			layers: [
				new ol.layer.Tile({
					source: new ol.source.MapQuest({layer: 'sat'})
				})
			],
			view: new ol.View({
				center: ol.proj.transform([-73, 40], 'EPSG:4326', 'EPSG:3857'),
				zoom: 6
			})
		});
		return map;
	},


	populatePoints:function(map, lats, lons){
		
		if(lats.length < 1){
			return;
		}
		
		var features = Array(1);
		for (var i = 0; i < lats.length; ++i) {
			features[i] = new ol.Feature({
				geometry: new ol.geom.Point(ol.proj.transform([lons[i], lats[i]], 'EPSG:4326', 'EPSG:3857')),
				name: 'iPlover Nest'
			});
		}
		

		var markstyle = new ol.style.Style({
			image: new ol.style.Icon({
			  src: 'img/marker.png'
			})
		});

		var vectorSource = new ol.source.Vector({"features":features});

		var vectorLayer = new ol.layer.Vector({source:vectorSource, style:markstyle});
		map.addLayer(vectorLayer);
		
		map.getView().fitExtent(vectorSource.getExtent(), map.getSize());
		
		//If there is only one point, zoom level is crazy,
		// set it to something more sane
		if(map.getView().getZoom() > 18){
			map.getView().setZoom(18);
		}
	},
	
	setMiniMapSrc:function(img_tag, _position){
		var lonConv = Math.cos(Math.PI/180*_position.coords.latitude)*111131;
		var ulLat, ulLon, lrLat, lrLon, acc = [];
		
		acc   = Math.floor(_position.coords.accuracy);  //in meters
		ulLat = _position.coords.latitude + acc/111131;
		lrLat = _position.coords.latitude - acc/111131;
		ulLon = _position.coords.longitude - acc/lonConv;
		lrLon = _position.coords.longitude + acc/lonConv;
		
		var mapSrc = 'http://open.mapquestapi.com/staticmap/v4/getmap?key=Fmjtd%7Cluur2d6znd%2Crl%3Do5-9abal6&zoom=16&size=280,280&'+
			'ellipse=color:0x0000ff%7Cfill:0x700000ff%7Cwidth:2%7C'+ ulLat +','+ ulLon +','+ lrLat +','+ lrLon +
			'&center='+_position.coords.latitude+','+_position.coords.longitude;
		img_tag.src = mapSrc;
	},
	
	setGoogleMapsHref:function(a_tag, _position){
		var mapLink = 'http://maps.google.com/?q=' + _position.coords.latitude + ',' + _position.coords.longitude + '+(Recorded+location)&t=m&z=13';
		a_tag.href = mapLink;
	}
};