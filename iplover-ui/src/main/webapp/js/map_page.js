
var map;
var vectorLayer;

$(document).ready(function() {
  setupMap();
  populatePoints();
});


function setupMap(){

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
};

//var lats = [37.17335261, 37.17392719, 37.17509789,37.17885105,37.17920599,37.16568141,37.16890471,37.16946479,37.17042594,
                //37.17089654,37.15264114,37.15324761,37.15599696,37.15000897,37.15685065];
//var lons = [-75.83565183,-75.83445531,-75.8332847,-75.83198475,-75.83284029,-75.84750837,-75.84258358,-75.84159426,-75.8400587,
//              -75.8394138,-75.86271524,-75.86202172,-75.85970177,-75.86535327,-75.85848028];

function populatePoints(){
    
    
    var features = Array(1);
    for (var i = 0; i < lats.length; ++i) {
        features[i] = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.transform([lons[i], lats[i]], 'EPSG:4326', 'EPSG:3857')),
            name: 'iPlover Nest'
        });
    }
    

    var markstyle = new ol.style.Style({
        image: new ol.style.Icon({
          src: 'https://raw.githubusercontent.com/openlayers/openlayers/master/img/marker.png'
        })
    });

    var vectorSource = new ol.source.Vector({"features":features});

    vectorLayer = new ol.layer.Vector({source:vectorSource, style:markstyle});
    map.addLayer(vectorLayer);
}