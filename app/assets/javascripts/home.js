$(document).ready(function() {
    var location = false;
    L.mapbox.accessToken = 'pk.eyJ1IjoicGl0cjEyIiwiYSI6ImNpZzN1a3ZmMDAybWx2bmtoZzdxcTY3ZTMifQ.MAq5KrbVv-505sbh9UzDQw';
    var geolocate = document.getElementById('geolocate');
    var map = L.mapbox.map('map', 'pitr12.ecdd20b0').setView([48.6,19.8],8);
    var myLayer = L.mapbox.featureLayer().addTo(map);
    var myPosition;

    //locate user using HTML5 geolocation API
    if (!navigator.geolocation) {
        geolocate.innerHTML = 'Geolocation is not available';
    } else {
        geolocate.onclick = function (e) {
            e.preventDefault();
            e.stopPropagation();
            map.locate();
        };
    }

    // Zoom and center the map on user location, and add marker
    map.on('locationfound', function(e) {
        location=true;
        map.setView([48.6,19.8],8);

        // Creates a single, draggable marker
        myPosition = L.marker(new L.LatLng(e.latlng.lat, e.latlng.lng), {
            icon: L.mapbox.marker.icon({
                'marker-color': '#ff8888',
                'marker-symbol': 'star'
            }),
            draggable: true
        }).bindPopup('Current position!\nDrag me around!').addTo(map);

        // Hide the geolocation button
        geolocate.parentNode.removeChild(geolocate);
    });

    // Error message on locaion error
    map.on('locationerror', function() {
        geolocate.innerHTML = 'Position could not be found';
    });

    ///////////////////load geoJSON after button click/////////////
    var find = document.getElementById('show');
    find.onclick = function (e){
        e.preventDefault();
        e.stopPropagation();
        myLayer.loadURL('/api/locations');
    };

});