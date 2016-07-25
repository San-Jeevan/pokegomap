//var api_endpoint = 'http://localhost:1234';

var endpointlist = ['', 'http://pokenodebiggy.cloudapp.net', 'http://pokenode2.cloudapp.net'];
var api_endpoint = endpointlist[Math.floor(Math.random() * 2) + 1];
//var api_endpoint = endpointlist[2];

var gymicon = 'images/gymbadgeblue.png';
var pokecentericon = 'images/pokeballicon.png';
var pokemonicon = 'images/pokemonicon.png';
var othericon = 'images/pokeothericon.png';
var spinner;

var iconmapping = [];
iconmapping["Gym"] = gymicon;
iconmapping["PokeStop"] = pokecentericon;
iconmapping["Pokemon Sighting"] = pokemonicon;
iconmapping["Other"] = othericon;

function getIcon(type, text) {
    if (type !== "Pokemon Sighting") return iconmapping[type];
    if (isNaN(text)) return iconmapping["Pokemon Sighting"];
    return "http://map.pokego.no/icons/small/" + text + ".png";
}

function getIconLarge(type, text) {
    if (type !== "Pokemon Sighting") return iconmapping[type];
    if (isNaN(text)) return iconmapping["Pokemon Sighting"];
    return "http://map.pokego.no/icons/" + text + ".png";
}


 var contentString = '<div style="overflow:hidden; width: 250px;" id="content">' +
        '<div id="siteNotice"></div>' +
        '<div id="bodyContent">' +
        '<div>' +
        '<h1>Pokedex</h1>' + 
        '<div class="">' +
         '<div class="col-md-offset-1">' +
          '{icon} <br>' +
 ' {text} <br>' +
'{type}<br>' +
    'Lattide: {lat}<br>' +
   ' Longitude: {long}<br>' +
    '{time}<br>' +
    'by: {author}<br>' +
   ' <br>' +
  '</div>' +
 ' </div>' +
      '<div class="">' +
         '<div class="col-md-offset-1">' +
   ' <button type="button" onclick="voteDown(\'{markerid}\');" class="btn btn-default btn-lg" aria-label="Left Align"><span class="glyphicon glyphicon-thumbs-down" aria-hidden="true"></span></button>   <span id="votecount">{votecount}</span>  <button  onclick="voteUp(\'{markerid}\');"  type="button" class="btn btn-success btn-lg" aria-label="Justify"><span class="glyphicon glyphicon-thumbs-up" aria-hidden="true"></span></button>' +
  '</div>' + 
'<div class="col-md-offset-1">' +
    '<br>' +
   '<a href="/#" onclick="deleteMarker(\'{markerid}\');">Delete</a> ' +  
 ' </div>' +
 ' </div>' +
    '<br>' +
        '</div>' +
        '</div>'; 
var options = {
    imagePath: 'images/m',
    maxZoom: 10,
    minimumClusterSize: 1,
    gridSize: 80
};
var opts = {
    lines: 13 // The number of lines to draw
    , length: 28 // The length of each line
    , width: 14 // The line thickness
    , radius: 42 // The radius of the inner circle
    , scale: 1 // Scales overall size of the spinner
    , corners: 0 // Corner roundness (0..1)
    , color: '#000' // #rgb or #rrggbb or array of colors
    , opacity: 0.25 // Opacity of the lines
    , rotate: 0 // The rotation offset
    , direction: 1 // 1: clockwise, -1: counterclockwise
    , speed: 2 // Rounds per second
    , trail: 60 // Afterglow percentage
    , fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
    , zIndex: 2e9 // The z-index (defaults to 2000000000)
    , className: 'spinner' // The CSS class to assign to the spinner
    , top: '50%' // Top position relative to parent
    , left: '50%' // Left position relative to parent
    , shadow: true // Whether to render a shadow
    , position: 'relative' // Whether to render a shadow

}

var markers = [];
var googlemarkers = [];
var googlemarsnonclustered = [];
var markerCluster;
var prev_zoom = 4;
var zoombeforemarker = 10;
var prev_bnd;
var markerscleared = false;
var clusterscleared = false;
var popupMap;

var pokemonrawlist = [];
var pokemonlist = [];
var pokemonidToPokemon = [];


function initTypeAhead() {
         var $input = $('.typeahead');
        $input.typeahead({
            source: pokemonrawlist,
            autoSelect: true
        });
        $input.change(function () {
            var current = $input.typeahead("getActive");
            if (current) {
                // Some item from your model is active!
                if (current.name == $input.val()) {
                    // This means the exact match is found. Use toLowerCase() if you want case insensitive match.
                } else {
                    // This means it is only a partial match, you can either add a new item 
                    // or take the active if you don't want new items
                }
            } else {
                // Nothing is active so it is a new value (or maybe empty value)
            }
        });
    
}

function showPokeSubmitPopup() {
    $('.modal').on('shown.bs.modal', function () {
        var center = nMap.getCenter();
        var bnd = nMap.getBounds();
        popupMap.setCenter(center);
        popupMap.fitBounds(bnd);
        google.maps.event.trigger(popupMap, 'resize');
    });

    $('#pokePopup').modal('show');
    popupMap = new google.maps.Map(document.getElementById('popupmap'), {
        center: { lat: 41.592412, lng: -99.354512 },
        zoom: 2
    });
    popupMap.addListener('click', function (e) {
        $("#markerGps").val(e.latLng.lat() + "," + e.latLng.lng());
    });

    initTypeAhead();
}



function voteUp(markerid) {
  var data = {Markerid: markerid, Val:1};
      $.ajax({
        type: "POST",
        url: api_endpoint + "/api/submitVote",
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        crossDomain: true,
        dataType: "json",
        success: function (data, status) {
            if (!data.success) {
            showNotification(data.message);
                return;
            }
            showNotification("Voted successfully!");
             $("#votecount").text($("#votecount").text() +1);
        },
        error: function (jqXHR, status) {
            showNotification("ERROR: " + jqXHR.responseText);
        }
    });
}

function voteDown(markerid) {
  var data = {Markerid: markerid, Val:-1};
      $.ajax({
        type: "POST",
        url: api_endpoint + "/api/submitVote",
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        crossDomain: true,
        dataType: "json",
        success: function (data, status) {
            if (!data.success) {
            showNotification(data.message);
                return;
            }
            showNotification("Voted successfully!");
            $("#votecount").text($("#votecount").text() -1);
        },
        error: function (jqXHR, status) {
            showNotification("ERROR: " + jqXHR.responseText);
        }
    });
}

function deleteMarker(markerid) {
    var data = {};
    data.markerid = markerid;
    $.ajax({
        type: "POST",
        url: api_endpoint + "/api/delMarker",
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        crossDomain: true,
        dataType: "json",
        success: function (data, status) {
            showNotification("Deleted successfully!");
            for (var i = 0; i < googlemarsnonclustered.length; i++) {
            if (googlemarsnonclustered[i].title === data) {
                googlemarsnonclustered[i].setMap(null);
            }
            }
            infowindow.close();
        },
        error: function (jqXHR, status) {
            showNotification("ERROR: " + jqXHR.responseText);
        }
    });
    return false;
}

function markerClicked(markerid) {
    for (var i = 0; i < markers.length; i++) {
        if (markers[i]._id === markerid) {
            var markertext = markers[i].Text;
            if (markers[i].Type === "Pokemon Sighting" && !isNaN(markers[i].Text)) markertext = pokemonidToPokemon[markers[i].Text];
            var necontent = contentString.replace('{icon}', '<img src="' + getIconLarge(markers[i].Type, markers[i].Text) + '">').replace('{type}', markers[i].Type).replace('{text}', markertext).replace('{lat}',markers[i].loc.coordinates[1]).replace('{long}',markers[i].loc.coordinates[0]).replace('{time}',moment(markers[i].DateAdded).fromNow())
            .replace(new RegExp('{markerid}', 'g'), markerid)           
            .replace('{votecount}', markers[i].VoteCount)           
           .replace('{author}', markers[i].Author);
             infowindow.setContent(necontent);
            infowindow.open();
            return false;
        }
    }
    return false;
}

function scrollToHome() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                nMap.setCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
            });
        } else {
            showNotification("Geolocation is not supported by this browser.");
  }
}



function addexistingmarkers() {
var data = markers;
    for (var i = 0; i < data.length; i++) {
                        var _newPosition = new google.maps.LatLng(data[i].loc.coordinates[1], data[i].loc.coordinates[0]);
                        var marker = new google.maps.Marker({
                            position: _newPosition,
                            map: nMap,
                            icon: getIcon(data[i].Type, data[i].Text),
                            title: data[i]._id
                        });

                        marker.addListener('click', function () {
                            markerClicked(this.title);
                            infowindow.open(nMap, this);
                        });
                        googlemarsnonclustered.push(marker);
                }
}



//        public static bool FBBoundingBoxContainsCoordinate(FBBoundingBox box, CLLocationCoordinate2D coordinate)
//{
//    bool containsX = box.x0 <= coordinate.Latitude && coordinate.Latitude <= box.xf;
//    bool containsY = box.y0 <= coordinate.Longitude && coordinate.Longitude <= box.yf;
//    return containsX && containsY;
//}

//bbox = []

function BboxContainsCords(bbox, cords) {
    var ContainsX = bbox[0]
}

function zoomChanged() {
    var currentzoom = nMap.getZoom();
    if (prev_zoom > currentzoom) {
        //ZOOMING OUT
        if (prev_zoom === zoombeforemarker) {
            clearMarkersFromMap();
            markerCluster = new MarkerClusterer(nMap, googlemarkers, options);
        }

    } else {
        //ZOOMING INv
        if (currentzoom > zoombeforemarker) {
            markerCluster.clearMarkers();
            clusterscleared = true;
             if (prev_bnd == null) {
             getMarkersSpatial();
                 prev_zoom = currentzoom;
                 return;
             
             }
      var sw = turf.point([nMap.getBounds().getSouthWest().lng() ,nMap.getBounds().getSouthWest().lat()]);
        var ne = turf.point([nMap.getBounds().getSouthWest().lng(),nMap.getBounds().getSouthWest().lat()]);
        var isSwInside = turf.inside(sw, prev_bnd);
        var isNeInside = turf.inside(ne, prev_bnd);
        if (isNeInside && isSwInside) {
            if (markerscleared)addexistingmarkers();
        } else {
            getMarkersSpatial();
        }
        }
    }
    prev_zoom = currentzoom;
}

function viewPortChanged() {
    var currentzoom = nMap.getZoom();
    if (currentzoom >= zoombeforemarker) {
    if (prev_bnd != null) {
        var sw = turf.point([nMap.getBounds().getSouthWest().lng() ,nMap.getBounds().getSouthWest().lat()]);
        var ne = turf.point([nMap.getBounds().getSouthWest().lng(),nMap.getBounds().getSouthWest().lat()]);
        var isSwInside = turf.inside(sw, prev_bnd);
        var isNeInside = turf.inside(ne, prev_bnd);
        if (isNeInside && isSwInside) {
        } else {
            getMarkersSpatial();
        }
    } 
}
else {
  
    }
}


function submitBug() {
    var data = {};
    data.text = $('#bugInput').val();
    if (data.text == null || data.text == "") {
        showNotification("write something first");        
        return false;
    } 
    $('#bugInput').val("");
    $.ajax({
        type: "POST",
        url: api_endpoint + "/api/addBug",
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        crossDomain: true,
        dataType: "json",
        success: function (data, status) {
            showNotification("added successfully!");
            window.location.reload();
        },
        error: function (jqXHR, status) {
            showNotification("ERROR: " + jqXHR.responseText);
        }
    });
    return false;
}

function updateStats() {
    $("#statTotal").text(markers.length);
    var author = "Anonymous";
    if (markers[markers.length - 1].Author !== "") author = markers[markers.length - 1].Author;
    $("#statLast").html(moment(markers[markers.length - 1].DateAdded).fromNow() + " by " + author);
}

function sendClicked() {
    var sendText = $("#inputSend").val();
    if (sendText == null || sendText === '') {
        alert("Cannot send empty message!");
        $("#inputSend").focus();
        return;
    }
    StartSendSession({ data: sendText });
    return false;
}

function initBindings() {
    $('#markerType').on('change', function () {
        if (this.value === "Gym") {
            $('.typeahead').typeahead('destroy');
            $('#markerText').val("");
            $('#markerText').attr("placeholder", "Gym name is required!");
        }
        if (this.value === "PokeStop") {
            $('.typeahead').typeahead('destroy');
            $('#markerText').val("");
            $('#markerText').attr("placeholder", "PokeStop or leave empty");
        }
        if (this.value === "Pokemon Sighting") {
            $('.typeahead').typeahead('destroy');
            $('#markerText').val("");
            $('#markerText').attr("placeholder", "Pokemon name is required!");
            initTypeAhead();
        }
    });

    $("#markerSubmit").click(submitMarker);
    $("#bugReportBtn").click(submitBug);
    $("#btnScrollHome").click(scrollToHome);
}

jQuery(document).ready(function () {
    "use strict";
    initBindings();
    getCounter();
    getIndexMarkers();
    $.get('http://map.pokego.no/pokemonlist.json', function (data) {
        pokemonrawlist = data;
        for (var i = 0; i < data.length; i++) {
            pokemonlist[data[i].name] = data[i].id;
            pokemonidToPokemon[data[i].id] = data[i].name;
        }
    }, 'json');
});

function getIndexMarkers() {
    var target = document.getElementById('over_map');
    spinner = new Spinner(opts).spin(target);
    var url = "";
  
    url = 'http://map.pokego.no/geoindex.json';
    //url = "http://localhost:1234/api/getIndexLocal";
    $.ajax({
        type: "GET",
        url: url,
        crossDomain: true,
        success: function(data, status) {
            spinner.stop();
            markers = data;
            googlemarkers = [];
            for (var i = 0; i < data.length; i++) {
                for (var j = 0; j < data[i].count; j++) {
                    if (data[i]._id !== "") {
                        var pos = Geohash.decode(data[i]._id);
                        var _newPosition = new google.maps.LatLng(pos.lat, pos.lon);
                        var marker = new google.maps.Marker({
                            position: _newPosition,
                            title: data[i].count.toString()
                        });

                        marker.addListener('click', function() {
                        });
                        googlemarkers.push(marker);
                 
                    }
                }
            }
            markerCluster = new MarkerClusterer(nMap, googlemarkers, options);
        },
        error: function (jqXHR, status) {
            showNotification("ERROR: " + jqXHR.responseText);
        }
    });
}

function clearMarkersFromMap() {
    markerscleared = true;
    for (var i = 0; i < googlemarsnonclustered.length; i++) {
        googlemarsnonclustered[i].setMap(null);
    }
}

function createInfoWindow() {
 
}

function getMarkersSpatial() {
    var target = document.getElementById('over_map');
    spinner = new Spinner(opts).spin(target);
    var data = { sw: {}, ne: {} };
    data.sw.x = nMap.getBounds().getSouthWest().lat();
    data.sw.y = nMap.getBounds().getSouthWest().lng();
    data.ne.x = nMap.getBounds().getNorthEast().lat();
    data.ne.y = nMap.getBounds().getNorthEast().lng();
   prev_bnd = turf.bboxPolygon([nMap.getBounds().getSouthWest().lng(), nMap.getBounds().getSouthWest().lat(), nMap.getBounds().getNorthEast().lng(), nMap.getBounds().getNorthEast().lat()]);
    $.ajax({
        type: "POST",
        url: api_endpoint + "/api/getSpatialMarkers",
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        crossDomain: true,
        dataType: "json",
        success: function (data, status) {
            spinner.stop();
            clearMarkersFromMap();
            markers = data;
                for (var i = 0; i < data.length; i++) {
                        var _newPosition = new google.maps.LatLng(data[i].loc.coordinates[1], data[i].loc.coordinates[0]);
                        var marker = new google.maps.Marker({
                            position: _newPosition,
                            map: nMap,
                            icon: getIcon(data[i].Type, data[i].Text),
                            title: data[i]._id
                        });
                        marker.addListener('click', function () {
                            markerClicked(this.title);
                            infowindow.open(nMap, this);
                        });
                        googlemarsnonclustered.push(marker);
                }
            
        },
        error: function (jqXHR, status) {
            showNotification("ERROR: " + jqXHR.responseText);
        }
    });
}

function submitMarker() {
    var data = {};
    data.MarkerType = $('#markerType').val();
    data.MarkerText = $('#markerText').val();
    data.MarkerGps = $('#markerGps').val();
    data.MarkerAuthor = $('#markerAuthor').val();
    if ($('#markerType').val() === "Pokemon Sighting") {
        if (data.MarkerText == null || data.MarkerText === "") {
            alert("You must write a Pokemon name!");
            return false;
        }
        data.MarkerText = pokemonlist[data.MarkerText];
    }

    if ($('#markerType').val() === "Gym") {
        if (data.MarkerText == null || data.MarkerText === "") {
            alert("You must write a Gym name!");
            return false;
        }
    }
  

    $.ajax({
        type: "POST",
        url: api_endpoint + "/api/addMarker",
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        crossDomain: true,
        dataType: "json",
        success: function (data, status) {
            showNotification(data.message);
            $('#markerText').val("");
            $('#markerGps').val("");

            var _newPosition = new google.maps.LatLng(data.result.loc.coordinates[1], data.result.loc.coordinates[0]);
            var marker = new google.maps.Marker({
                position: _newPosition,
                icon: getIcon(data.result.Type, data.result.Text),
                title: data.result._id,
                map: nMap
            });


            var popupmarker = new google.maps.Marker({
                position: _newPosition,
                icon: getIcon(data.result.Type, data.result.Text),
                title: data.result._id,
                map: popupMap
            });
            marker.addListener('click', function () {
                markerClicked(this.title);
               infowindow.open(nMap, this);
            });
            markers.push(data.result);
            markerCluster.addMarker(marker, false);
            googlemarsnonclustered.push(marker);
        },
        error: function (jqXHR, status) {
            showNotification("ERROR: " + jqXHR.responseText);
        }
    });
    return false;
}

function showNotification(message) {
    $.notify({
        title: '',
        message: message,
        target: '_blank'
    }, {
            // settings
            element: 'body',
            position: null,
            type: "success",
            allow_dismiss: true,
            newest_on_top: false,
            showProgressbar: false,
            placement: {
                from: "top",
                align: "center"
            },
            offset: 20,
            spacing: 10,
            z_index: 3000,
            delay: 2000,
            timer: 2000,
            url_target: '_blank',
            mouse_over: null,
            animate: {
                enter: 'animated fadeInDown',
                exit: 'animated fadeOutUp'
            },
            onShow: null,
            onShown: null,
            onClose: null,
            onClosed: null,
            icon_type: 'class',
            template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0}" role="alert">' +
            '<button type="button" aria-hidden="true" class="close" data-notify="dismiss">×</button>' +
            '<span data-notify="icon"></span> ' +
            '<span data-notify="title">{1}</span> ' +
            '<span data-notify="message">{2}</span>' +
            '<div class="progress" data-notify="progressbar">' +
            '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
            '</div>' +
            '<a href="{3}" target="{4}" data-notify="url"></a>' +
            '</div>'
        });
} 

function getCounter() {
    var url = "";
    url = api_endpoint + "/api/welcome";
    $.ajax({
        type: "GET",
        url: url,
        crossDomain: true,
        success: function(data, status) {
            if (data.success) {
                 $("#totalpoints").text(data.count + " markers");
                $("#mobiletotalpoints").text(data.count + " markers");
            }
        },
        error: function (jqXHR, status) {
        }
    });
}