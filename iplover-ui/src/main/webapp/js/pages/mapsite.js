
$(document).ready(function() {
    var map = iplover.map.setupMap('map');
    var latlons = iplover.data.getLatLons();
    iplover.map.populatePoints(map, latlons.lat, latlons.lon);
});


