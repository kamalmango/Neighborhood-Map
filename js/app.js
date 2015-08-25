
var locations = [];
var map;
var infowindow;


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
      //createMarker(results[i]);
      createMarker(results[i]);

      
     
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

  /*
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location
  });
 */


  var markerStats = {
    map: map,
    position: place.geometry.location
  }

  var marker = new google.maps.Marker(markerStats);
  place.marker = marker;

  google.maps.event.addListener(marker, 'click', function() {
    toggleBounce(this);
    infowindow.setContent(place.name);
    infowindow.open(map, this);
  });

 
}


//console.log(google.maps.places.PlaceResult);
initMap();

/*
function openInfowindow(marker, place) {
  infowindow.setContent(place.name);
  infowindow.open(map, marker);
}
*/

// make marker bounce
function toggleBounce(marker){
  marker.setAnimation(google.maps.Animation.BOUNCE);
  setTimeout(function(){marker.setAnimation(null);}, 2100);
}


function Place(dataObj) {
  this.name = dataObj.name;
  this.location = dataObj.location;
  this.marker = null;
}



var ViewModel = function() {
  var self = this;
  
  self.placeList = ko.observableArray([]);
  console.log(self.placeList());
  
  
  locations.forEach(function(place) {
    self.placeList.push(new Place(place));
  });

  /* 
  locations.forEach(function(place){
      self.placeList.push(place);
  });
*/

  // search bar functionality
  self.points = ko.observableArray(locations);
  self.query = ko.observable('');

  self.search = ko.computed(function(){
    return ko.utils.arrayFilter(self.points(), function(point){
      return point.name.toLowerCase().indexOf(self.query().toLowerCase()) >= 0;
    });
  });

  //console.log(self.points);
  console.log(self.placeList());
};












