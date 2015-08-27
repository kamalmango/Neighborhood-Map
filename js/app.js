
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
  //console.log(results);
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      //createMarker(results[i]);
      // create data model
      place = {};

      place.name = results[i].name;
      place.location = {
        'lat' : results[i].geometry.location.lat(),
        'lng' : results[i].geometry.location.lng()
      };

      //locations.push(place);
      locations.push(new Place(place));
    }
    createMarker();
    animateMarker(locations);
    /*
    locations.forEach(function(place){
      animateMarker(place);
    })
  */

    ko.applyBindings(new ViewModel()); // call it from here to wait for locations to be built
  }
}

initMap();

function createMarker() {

  locations.forEach(function(place) {
    //console.log(place);
    var markerOptions = {
      map: map,
      position: place.location
    };

    place.marker = new google.maps.Marker(markerOptions);
    
  });

}


function openInfowindow(place, marker) {
  infowindow.setContent(place.name);
  infowindow.open(map, marker);
}


function animateMarker() {

  locations.forEach(function(place){
    google.maps.event.addListener(place.marker, 'click', function() {
      toggleBounce(this);
      infowindow.setContent(place.name);
      infowindow.open(map, this);
    });
  })
  
}



// make marker bounce
function toggleBounce(marker){
  marker.setAnimation(google.maps.Animation.BOUNCE);
  setTimeout(function(){marker.setAnimation(null);}, 2100);
}


function Place(dataObj) {
  this.name = dataObj.name;
  this.location = dataObj.location;
  this.marker = null;
  //this.marker = dataObj.marker;
}



var ViewModel = function() {
  var self = this;
  

  // search bar functionality
  self.points = ko.observableArray(locations);
  self.query = ko.observable('');

  self.search = ko.computed(function(){
    return ko.utils.arrayFilter(self.points(), function(point){
      return point.name.toLowerCase().indexOf(self.query().toLowerCase()) >= 0;
    });
  });

  /*
  self.animateMarker = function() {
    console.log('hi');
    locations.forEach(function(place){
      google.maps.event.addListener(place.marker, 'click', function() {
        toggleBounce(this);
        infowindow.setContent(place.name);
        infowindow.open(map, this);
      });
    });

  };
  self.animateMarker();
  */
  
  console.log(self.search());
  
};












