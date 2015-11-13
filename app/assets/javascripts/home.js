$(document).ready(function() {

    L.mapbox.accessToken = 'pk.eyJ1IjoicGl0cjEyIiwiYSI6ImNpZzN1a3ZmMDAybWx2bmtoZzdxcTY3ZTMifQ.MAq5KrbVv-505sbh9UzDQw';
    var map = L.mapbox.map('map', 'pitr12.ecdd20b0', {zoomControl:false}).setView([48.6,19.8],8);
    var myLayer = L.mapbox.featureLayer().addTo(map);
    var myPolyLayer = L.mapbox.featureLayer().addTo(map);
    var myLineLayer = L.mapbox.featureLayer().addTo(map);
    var info = document.getElementById('info');
    var myPosition;

    //add zoom slider
    L.control.zoomslider().addTo(map);

    //add default user location
    // Creates a single, draggable marker
    myPosition = L.marker(new L.LatLng(48.685216, 18.630821), {
        icon: L.mapbox.marker.icon({
            'marker-color': '#ff8888',
            'marker-symbol': 'star'
        }),
        draggable: true
    }).bindPopup('Current position!\nDrag me around!').addTo(map);

    //locate user using HTML5 geolocation API
    if (!navigator.geolocation) {
        alert('Geolocation is not available');
    } else {
            map.locate();
    }

    // Add marker to user location
    map.on('locationfound', function(e) {
        map.removeLayer(myPosition);
        map.setView([e.latlng.lat, e.latlng.lng],9);

        // Creates a single, draggable marker
        myPosition = L.marker(new L.LatLng(e.latlng.lat, e.latlng.lng), {
            icon: L.mapbox.marker.icon({
                'marker-color': '#ff8888',
                'marker-symbol': 'star'
            }),
            draggable: true
        }).bindPopup('Current position!\nDrag me around!').addTo(map);
    });

    // Error message on locaion error
    map.on('locationerror', function() {
        alert('Position could not be found');
    });

    myLayer.clearLayers();
    myLayer.loadURL('/api/locations?lat=' +myPosition.getLatLng().lat+ '&lon=' +myPosition.getLatLng().lng);

    ///////////////////load geoJSON after button click/////////////
    var find = document.getElementById('show');
    find.onclick = function (e){
        e.preventDefault();
        e.stopPropagation();
        myLayer.clearLayers();
        myLayer.loadURL('/api/locations?lat=' +myPosition.getLatLng().lat+ '&lon=' +myPosition.getLatLng().lng);
    };

    // When the features layer is ready,
    // ie. added to the map, run populateListing.
    myLayer.on('ready', function(){
        myLayer.eachLayer(function(layer){
            if(layer.feature.geometry.type == 'Polygon'){
                myLayer.removeLayer(layer);
                layer.addTo(myPolyLayer);
            }
            if(layer.feature.geometry.type == 'LineString'){
                myLayer.removeLayer(layer);
                layer.addTo(myLineLayer);
            }
        });
        //myLayer.eachLayer(function(marker) {
        //    if (marker.feature.geometry.type == 'Polygon') {
        //        // Get bounds of polygon
        //        var bounds = marker.getBounds();
        //        // Get center of bounds
        //            var center = bounds.getCenter();
        //        if("undifined" == typeof center){
        //            console.log("marker je undifined");
        //        }
        //            // Use center to put marker on map
        //            var new_marker = L.marker(center).addTo(map);
        //    }
        //});
        map.fitBounds(myLayer.getBounds());
        populateListing();
    });

    function populateListing() {
        // Clear out the listing container first.
        info.innerHTML = '';
        var listings = [];

        // Build a listing of markers
        myLayer.eachLayer(function(marker) {
            //if(marker.feature.geometry.type == 'Polygon'){
            //    // Get bounds of polygon
            //    var bounds = marker.getBounds();
            //    // Get center of bounds
            //    var center = bounds.getCenter();
            //    // Use center to put marker on map
            //    var new_marker = L.marker(center).addTo(map);
            //}
            // Convert distance to kilometres
            var toKilometres = 0.001;
            var distance = ((toKilometres * marker.feature.properties.description).toFixed(1));

            var link = document.createElement('a');
            if(listings.length % 2 == 0){
                link.className = 'item even';
            }
            else {
                link.className = 'item';
            }
            link.href = '#';
            link.setAttribute('data-distance', distance);

            // Populate content from each markers object.
            link.innerHTML = marker.feature.properties.title +
                '<br /><small>' + distance + ' km away</small>';

            link.onclick = function() {
                if (/active/.test(this.className)) {
                    this.className = this.className.replace(/active/, '').replace(/\s\s*$/, '');
                } else {
                    var siblings = info.getElementsByTagName('a');
                    for (var i = 0; i < siblings.length; i++) {
                        siblings[i].className = siblings[i].className
                            .replace(/active/, '').replace(/\s\s*$/, '');
                    };
                    this.className += ' active';

                    // When a menu item is clicked, animate the map to center
                    // its associated marker and open its popup.
                    map.panTo(marker.getLatLng());
                    marker.openPopup();
                }
                return false;
            };

            listings.push(link);
        });

        // Sort the listing based on the
        // assigned attribute, 'data-listing'
        //listings.sort(function(a, b) {
        //    return a.getAttribute('data-distance') - b.getAttribute('data-distance');
        //});

        listings.forEach(function(listing) {
            info.appendChild(listing);
        });
    }
});