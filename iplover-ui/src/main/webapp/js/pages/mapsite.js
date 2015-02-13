
$(document).ready(function() {
    var map = iplover.map.setupMap('map');
    var records = iplover.data.getRecords();
    iplover.map.populatePoints(map, records);
});


