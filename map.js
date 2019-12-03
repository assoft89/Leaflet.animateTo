
var map,
	layer,
	city_latlng = [63.2, 75.44];
	
function initMap(){

	map = L.map('mapid').setView(city_latlng, 9, 5);


	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);

	
	map.on('click', onMapClick);
	map.on('move',function(){	
					//markerCenter.setLatLng(map.getCenter());
	});
					
	var latlng1 = L.latLng(63.2, 75.44);
	var latlng2 = L.latLng(63.2, 76.445);
	
	layer = L.marker(latlng1).addTo(map)
	.bindPopup('Click on Map for new position for layer')
    .openPopup();
		
}

function onMapClick(e) {
	//mymap.setView(e.latlng, 14);
	layer.animateTo(e.latlng, {duration: 1000, pan : 'inbounds', complete : function(){console.log('finish')}})
}



function isMarkerInsidePolygon(marker, poly) {
    var polyPoints = poly.getLatLngs();       
    var x = marker[0], y = marker[1];

    var inside = false;
    for (var i = 0, j = polyPoints.length - 1; i < polyPoints.length; j = i++) {
        var xi = polyPoints[i].lat, yi = polyPoints[i].lng;
        var xj = polyPoints[j].lat, yj = polyPoints[j].lng;

        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
};



