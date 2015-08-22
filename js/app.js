
var locations = [];
var map;
var infowindow;
//var marker

function initMap() {
  var latlng = {lat: 38.9047, lng: -77.0164};

  map = new google.maps.Map(document.getElementById('map'), {
    center: latlng,
    zoom: 14
  });

  infowindow = new google.maps.InfoWindow();

  var service = new google.maps.places.PlacesService(map);
  service.nearbySearch({
    location: latlng,
    radius: 2000, //500,
    types: ['restaurant']
  }, callback);
}


function callback(results, status) {
  var place;

  if (status === google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      createMarker(results[i]);
      //console.log(results[i]);
      // create data model
      place = {};

      place.name = results[i].name;
      place.location = {
        'lat' : results[i].geometry.location.lat(),
        'lng' : results[i].geometry.location.lng()
      };

      locations.push(place);
    }
    ko.applyBindings(new ViewModel()); // call it from here to wait for locations to be built
  }
}

function createMarker(place) {
  var placeLoc = place.geometry.location;
  //locations.push(placeLoc);
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location
  });

  //marker.addListener('click', toggleBounce);
  google.maps.event.addListener(marker, 'click', function() {
    toggleBounce(marker);
    infowindow.setContent(place.name);
    infowindow.open(map, this);
    //toggleBounce(marker);
  });

}

//console.log(google.maps.places.PlaceResult);
initMap();

// make marker bounce
function toggleBounce(marker) {
  if (marker.getAnimation() !== null) {
    marker.setAnimation(null);
  } else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function(){marker.setAnimation(null);}, 2100);
  }
}


var ViewModel = function() {
  var self = this;

  self.placeList = ko.observableArray([]);
  console.log(self.placeList());

  locations.forEach(function(place){
      self.placeList.push(place);
  });

  // search bar functionality
  self.points = ko.observableArray(locations);
  self.query = ko.observable('');

  self.search = ko.computed(function(){
    return ko.utils.arrayFilter(self.points(), function(point){
      return point.name.toLowerCase().indexOf(self.query().toLowerCase()) >= 0;
    });
  });


};












/*
var markers = [
        ['Georgetown Waterfront Park', 38.9022, -77.0619],
        ['The White House', 38.8977,  -77.0366],
        ['Verizon Center', 38.8981, -77.0208]
    ]


function initMap() {
    var latlng = new google.maps.LatLng(38.9047, -77.0164);
    var myOptions = {
        zoom: 14,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false
    };
    var map = new google.maps.Map(document.getElementById("map"),myOptions);

    var infowindow = new google.maps.InfoWindow(), marker, i;

    for (i = 0; i < markers.length; i++) {  
        marker = new google.maps.Marker({
            position: new google.maps.LatLng(markers[i][1], markers[i][2]),
            map: map
        });
        google.maps.event.addListener(marker, 'click', (function(marker, i) {
            return function() {
                infowindow.setContent(markers[i][0]);
                infowindow.open(map, marker);
            }
        })(marker, i));
    }
}

initMap();
*/










