$(document).ready(function() {
    L.mapbox.accessToken = 'pk.eyJ1IjoicGl0cjEyIiwiYSI6ImNpZzN1a3ZmMDAybWx2bmtoZzdxcTY3ZTMifQ.MAq5KrbVv-505sbh9UzDQw';
    var map = L.mapbox.map('map', 'pitr12.ecdd20b0', {zoomControl:false}).setView([48.6,19.8],8);
    var myLayer = L.mapbox.featureLayer().addTo(map);
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

    ///////////////////load geoJSON after button click/////////////
    var find = document.getElementById('show');
    find.onclick = function (e){
        e.preventDefault();
        e.stopPropagation();
        myLayer.loadURL('/api/locations?lat=' +myPosition.getLatLng().lat+ '&lon=' +myPosition.getLatLng().lng);
    };

    // When the features layer is ready,
    // ie. added to the map, run populateListing.
    myLayer.on('ready', populateListing);

    function populateListing() {
        // Clear out the listing container first.
        info.innerHTML = '';
        var listings = [];

        // Build a listing of markers
        myLayer.eachLayer(function(marker) {
            // Draggable marker coordinates.
        //    alert(marker.getLatLng());
        //    var home = myPosition.getLatLng();
        //    var toKilometres = 0.001;
        //    var distance = (toKilometres * home.distanceTo(marker.getLatLng())).toFixed(1);
        //
        //    var link = document.createElement('a');
        //    link.className = 'item';
        //    link.href = '#';
        //    link.setAttribute('data-distance', distance);
        //
        //    // Populate content from each markers object.
        //    link.innerHTML = marker.feature.properties.title +
        //        '<br /><small>' + distance + ' km away</small>';
        //
        //    link.onclick = function() {
        //        if (/active/.test(this.className)) {
        //            this.className = this.className.replace(/active/, '').replace(/\s\s*$/, '');
        //        } else {
        //            var siblings = info.getElementsByTagName('a');
        //            for (var i = 0; i < siblings.length; i++) {
        //                siblings[i].className = siblings[i].className
        //                    .replace(/active/, '').replace(/\s\s*$/, '');
        //            };
        //            this.className += ' active';
        //
        //            // When a menu item is clicked, animate the map to center
        //            // its associated marker and open its popup.
        //            map.panTo(marker.getLatLng());
        //            marker.openPopup();
        //        }
        //        return false;
        //    };
        //
        //    listings.push(link);
        //});
        //
        //// Sort the listing based on the
        //// assigned attribute, 'data-listing'
        //listings.sort(function(a, b) {
        //    return a.getAttribute('data-distance') - b.getAttribute('data-distance');
        //});
        //
        //listings.forEach(function(listing) {
        //    info.appendChild(listing);
        });
    }
});