
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
}


function callYelp() {

  function nonce_generate(){
    return (Math.floor(Math.random() * 1e12).toString());
  } 


  var yelp_url = 'http://api.yelp.com/v2/search';
  

  var parameters = {
    location: 'washington+dc',
    oauth_consumer_key: 'HKEEu2MdseoJv8QK4GKyig',
    oauth_token: '4En18EFYgqBLZm9yWtJeLOIGYEGx4xIq',
    oauth_nonce: nonce_generate(),
    oauth_timestamp: Math.floor(Date.now()/1000),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_version : '1.0',
    callback: 'cb'              
  };



  var encodedSignature = oauthSignature.generate('GET', yelp_url, parameters, 'Qym8Yfq-k2ZGs2FFyNjK2ARWV40', 'HAmaTHm9-5CiLtfJ6xrZzN_N_78');
  parameters.oauth_signature = encodedSignature;

  var settings = {
    url: yelp_url,
    data: parameters,
    cache: true,                
    dataType: 'jsonp',
    jsonpCallback: 'cb',
    success: function(results) {
      // Do stuff with results
      console.log(results);
      var place;
      for (var i = 0; i < results.businesses.length; i++) {
        place = {};
        place.name = results.businesses[i].name;
        place.location = {
          'lat' : results.businesses[i].location.coordinate.latitude,
          'lng' : results.businesses[i].location.coordinate.longitude
        };
        place.image = results.businesses[i].image_url;
        

        locations.push(new Place(place));
      }
      createMarker();
      ko.applyBindings(new ViewModel());
    },
    error: function() {
      // Do stuff on fail
      console.log('ajax request failed');
    } 
  };
 
  $.ajax(settings);
}


initMap();
callYelp();


function createMarker() {
  locations.forEach(function(place) {
    //console.log(place);
    var markerOptions = {
      map: map,
      position: place.location
    };

    place.marker = new google.maps.Marker(markerOptions);


    
    google.maps.event.addListener(place.marker, 'click', function() {
      toggleBounce(this);
      openInfowindow(place, place.marker);
    })


    place.marker.click = function() {
      toggleBounce(place.marker);
      openInfowindow(place, place.marker);
    };

    
  });

}


function openInfowindow(place, marker) {
  
  var infowindowHtml = '<div id="infoWindow">' +
    '<div class = "place-name">' + place.name + '</div>' +
    '<img class = "place-image" src= "' + place.image + '">' +
    '</div>';

  
  infowindow.setContent(infowindowHtml);
  infowindow.open(map, marker);
  
}


// make marker bounce
function toggleBounce(marker){
  marker.setAnimation(google.maps.Animation.BOUNCE);
  setTimeout(function(){marker.setAnimation(null);}, 2100);
}


function Place(dataObj) {
  this.name = dataObj.name;
  this.location = dataObj.location;
  this.image = dataObj.image;
  this.marker = null;
}



var ViewModel = function() {
  var self = this;
  
  // search bar functionality
  
  self.points = ko.observableArray(locations);
  self.query = ko.observable('');
  console.log(self.points());
  self.search = ko.computed(function(){
    return ko.utils.arrayFilter(self.points(), function(point){
      if (point.name.toLowerCase().indexOf(self.query().toLowerCase()) === -1){
        point.marker.setMap(null);
      } else {
        point.marker.setMap(map);
      }
      return point.name.toLowerCase().indexOf(self.query().toLowerCase()) >= 0; //test if array (true or false)
    });
  });
  
};












