var map;
var myLayer;
var hotelsLayer;
var hotelsMarkerLayer;
var markersLayer;
var myPosition;
var info;
var clusterGroup;

$(document).ready(function() {
    $("#hotels_distance_slider").hide();
    $("#hotels_distance_slider_val").hide();
    L.mapbox.accessToken = 'pk.eyJ1IjoicGl0cjEyIiwiYSI6ImNpZzN1a3ZmMDAybWx2bmtoZzdxcTY3ZTMifQ.MAq5KrbVv-505sbh9UzDQw';
    map = L.mapbox.map('map', 'pitr12.o6bmhpc8', {zoomControl:false}).setView([48.6,19.8],8);
    myLayer = L.mapbox.featureLayer();
    hotelsLayer = L.mapbox.featureLayer().addTo(map);
    hotelsMarkerLayer = L.mapbox.featureLayer().addTo(map);
    markersLayer = L.mapbox.featureLayer();
    clusterGroup = new L.MarkerClusterGroup();
    var location = false;
    info = document.getElementById('info');

    //my distance slider
    $(function() {
        $( "#hotels_distance_slider" ).slider({
            range: "min",
            value: 3000,
            min: 0,
            max: 20000,
            step: 1,
            slide: function( event, ui ) {
                $( "#hotels_distance_slider_val" ).val( ui.value );
            }
        });
        $( "#hotels_distance_slider_val" ).val( $( "#hotels_distance_slider" ).slider( "value" ) );
        $("#hotels_distance_slider_val").on('input', function() {
            $('#hotels_distance_slider').slider('value', $(this).val());
        });
    });

    //hotel distance slider
    $(function() {
        $( "#slider-range-min" ).slider({
            range: "min",
            value: 500,
            min: 0,
            max: 500,
            step: 1,
            slide: function( event, ui ) {
                $( "#area" ).val( ui.value );
            }
        });
        $( "#area" ).val( $( "#slider-range-min" ).slider( "value" ) );
        $("#area").on('input', function() {
            $('#slider-range-min').slider('value', $(this).val());
        });
    });

    //add zoom slider
    L.control.zoomslider().addTo(map);

    //locate user using HTML5 geolocation API
    map.locate();

    // Add marker to user location
    map.on('locationfound', function(e) {
        // Creates a single, draggable marker
        myPosition = L.marker(new L.LatLng(e.latlng.lat, e.latlng.lng), {
            icon: L.mapbox.marker.icon({
                'marker-color': '#ff8888',
                'marker-symbol': 'star'
            }),
            draggable: true
        }).bindPopup('Current position!\nDrag me around!').addTo(map);
        location = true;
        showAllResorts();
    });

    // On locaion error set default position
    map.on('locationerror', function() {
        //add default user location
        // Creates a single, draggable marker
        myPosition = L.marker(new L.LatLng(48.685216, 18.630821), {
            icon: L.mapbox.marker.icon({
                'marker-color': '#ff8888',
                'marker-symbol': 'star'
            }),
            draggable: true
        }).bindPopup('Current position!\nDrag me around!').addTo(map);
        showAllResorts();
    });

    /////////////////////load all resorts/////////////
    var show = document.getElementById('show');
    show.onclick = function (e){
        e.preventDefault();
        e.stopPropagation();
        showAllResorts();
    };

    //////////////////show all hotels///////////////
    var show_hotels = document.getElementById('show_hotels');
    show_hotels.onclick = function (e){
        e.preventDefault();
        e.stopPropagation();
        showAllHotels();
    };

    ///////////////////filter resorts/////////////
    var find = document.getElementById('find');
    find.onclick = function (e){
        e.preventDefault();
        e.stopPropagation();
        findResorts();
    };

    // When the features layer is ready,
    // ie. added to the map, add marker on each polygon and run populateListing.
    myLayer.on('ready', function(){
        myLayer.setStyle({
            weight: 1,
            opacity: 1,
            color: 'black',
            dashArray: '5',
            fillOpacity: 0.2,
            fillColor: '#ff0000'
        });
        var skiMarkers = [];
        var hotelMarkers = [];
        myLayer.eachLayer(function(layer){
            if ("H" == layer.feature.properties.type){
                myLayer.removeLayer(layer);
                layer.addTo(hotelsLayer);
                if(layer.feature.geometry.type == 'Polygon' || layer.feature.geometry.type == 'LineString'){
                    if(layer._latlngs.length != 0) {
                        hotelMarkers.push(createGeoJson(layer));
                    }
                }
            }
            else{
                clusterGroup.addLayer(layer);
                
                if(layer.feature.geometry.type == 'Polygon' || layer.feature.geometry.type == 'LineString'){
                    if(layer._latlngs.length != 0) {
                        skiMarkers.push(createGeoJson(layer));
                    }
                }
            }
        });

        hotelsMarkerLayer.setGeoJSON(hotelMarkers);
        markersLayer.setGeoJSON(skiMarkers);

        markersLayer.eachLayer(function(hlayer){
            clusterGroup.addLayer(hlayer);
        });

        map.addLayer(clusterGroup);
        populateListing();
    });
});

function createGeoJson(marker){
    var json = {};
    if("S" == marker.feature.properties.type){
        json = {
            "type": "Feature",
            "geometry": {
              type: 'Point',
              coordinates: [marker.getBounds().getCenter().lng, marker.getBounds().getCenter().lat]
            },
            "properties": {
                "title": marker.feature.properties["title"],
                "description": marker.feature.properties["description"],
                "type": marker.feature.properties["type"],
                "marker-color": "#3887BE",
                "marker-size": "large",
                "marker-symbol": "skiing"
            }
        }
    }
    else{
        json = {
            "type": "Feature",
            "geometry": {
                type: 'Point',
                coordinates: [marker.getBounds().getCenter().lng, marker.getBounds().getCenter().lat]
            },
            "properties": {
                "title": marker.feature.properties["title"],
                "type": marker.feature.properties["type"],
                "marker-color": "#FE7569",
                "marker-size": "large",
                "marker-symbol": "lodging"
            }
        }
    }
    return json;
}

function clearMap(){
    myLayer.clearLayers();
    hotelsLayer.clearLayers();
    markersLayer.clearLayers();
    hotelsMarkerLayer.clearLayers();
    clusterGroup.clearLayers();
}

function showAllResorts(){
    info.style.display='block';
    clearMap();
    myLayer.loadURL('/api/locations?lat=' +myPosition.getLatLng().lat+ '&lon=' +myPosition.getLatLng().lng);
}

function showAllHotels(){
    info.style.display='none';
    clearMap();
    myLayer.loadURL('/api/hotels');
}

function findResorts(){
        var difficulty = [];
        $.each($("input[name='difficulty']:checked"), function(){
            difficulty.push($(this).val());
        });

    info.style.display='block';
    var area = $("#area").val() * 1000;
    clearMap();
    if(document.getElementById('near_hotels').checked){
        var hotel_distance = $("#hotels_distance_slider_val").val();
        myLayer.loadURL('/api/ski_near_hotels?lat=' +myPosition.getLatLng().lat+ '&lon=' +myPosition.getLatLng().lng+ '&area=' +area+ '&hotel_dist=' +hotel_distance+ '&difficulty=' +difficulty);
    }
    else {
        myLayer.loadURL('/api/locations?lat=' + myPosition.getLatLng().lat + '&lon=' + myPosition.getLatLng().lng + '&area=' + area+ '&difficulty=' +difficulty);
    }
}

function populateListing() {
    // Clear out the listing container first.
    info.innerHTML = '';
    var listings = [];

    // Build a listing of markers
    myLayer.eachLayer(function(marker) {
        // Convert distance to kilometres
        var toKilometres = 0.001;
        if(marker.hasOwnProperty("feature")) {
            var distance = ((toKilometres * marker.feature.properties.description).toFixed(1));
        }
        else {
            var distance = ((toKilometres * marker.options.properties.description).toFixed(1));
        }

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
        if(marker.hasOwnProperty("feature")) {
            link.innerHTML = marker.feature.properties.title +
                '<br /><small>' + distance + ' km away</small>';
        }
        else {
            link.innerHTML = marker.options.properties.title +
                '<br /><small>' + distance + ' km away</small>';
        }

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
                if("Point" != marker.feature.geometry.type){
                    var bounds = marker.getBounds();
                    map.panTo(bounds.getCenter());
                }
                else {
                    map.panTo(marker.getLatLng());
                }
                marker.openPopup();
            }
            return false;
        };

        listings.push(link);
    });

    listings.forEach(function(listing) {
        info.appendChild(listing);
    });
    if(location){
        map.setView([myPosition.getLatLng().lat, myPosition.getLatLng().lng],9);
    }
}

function valueChanged()
{
    if($("#near_hotels").is(":checked")) {
        $("#hotels_distance_slider").show();
        $("#hotels_distance_slider_val").show();
        $("#hotels_label").show();
    }
    else {
        $("#hotels_distance_slider").hide();
        $("#hotels_distance_slider_val").hide();
        $("#hotels_label").hide();
    }
}