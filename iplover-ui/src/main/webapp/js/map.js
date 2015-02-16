if(typeof iplover === 'undefined'){
	iplover = [];
}

iplover.map = (function(){

	var setupMap = function(target_id){

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
        
        var element = document.getElementById('popup');

        var popup = new ol.Overlay.Popup();
        map.addOverlay(popup);

        map.on('click', function(evt) {
            var feature = map.forEachFeatureAtPixel(evt.pixel,
                function(feature, layer) {
                    return feature;
                });
            if(feature){
                var prettyCoord = ol.coordinate.toStringHDMS(ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326'), 2);
                popup.show(evt.coordinate, '<div><p>Site ID:' + feature.get('name') + '</p>' + 
                            "<p><a href='" + feature.get("url") + "'>Edit</a></p></div>");
            }else{
                popup.hide();
            }
});
        
        
		return map;
	};


	var populatePoints = function(map, records){
		
		if(records.length < 1){
			return;
		}
		
		var features = Array(1);
		for (var i = 0; i < records.length; ++i) {
			features[i] = new ol.Feature({
				geometry: new ol.geom.Point(ol.proj.transform(
                    [records[i].location_lon, records[i].location_lat], 'EPSG:4326', 'EPSG:3857'
                )),
                name: records[i].site_id,
                url: 'edit_view_nest_site.html?uuid=' + records[i].uuid + '&sourceurl=mapsite.html',
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
		// set it to something more sane, 18 is a reasonable level for most maps
		if(map.getView().getZoom() > 18){
			map.getView().setZoom(18);
		}
	};
    
	var setMiniMapSrc = function(img_tag, lat, lon, acc){
		var lonConv = Math.cos(Math.PI/180*lat)*111131;
		var ulLat, ulLon, lrLat, lrLon = [];
		
		acc   = Math.floor(acc);  //in meters
		ulLat = lat + acc/111131;
		lrLat = lat - acc/111131;
		ulLon = lon - acc/lonConv;
		lrLon = lon + acc/lonConv;
		
		var mapSrc = 'http://open.mapquestapi.com/staticmap/v4/getmap?key=Fmjtd%7Cluur2d6znd%2Crl%3Do5-9abal6&zoom=16&size=280,280&'+
			'ellipse=color:0x0000ff%7Cfill:0x700000ff%7Cwidth:2%7C'+ ulLat +','+ ulLon +','+ lrLat +','+ lrLon +
			'&center='+lat+','+lon;
		img_tag.src = mapSrc;
	};
	
	var setGoogleMapsHref = function(a_tag, _position){
		var mapLink = 'http://maps.google.com/?q=' + _position.coords.latitude + ',' + _position.coords.longitude + '+(Recorded+location)&t=m&z=13';
		a_tag.href = mapLink;
	};
    
    return {
            setMiniMapSrc     : setMiniMapSrc,
            setGoogleMapsHref : setGoogleMapsHref,
            populatePoints    : populatePoints,
            setupMap          : setupMap
        };
    
})();