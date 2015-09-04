
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
      
      // create data model
      place = {};

      place.name = results[i].name;
      place.location = {
        'lat' : results[i].geometry.location.lat(),
        'lng' : results[i].geometry.location.lng()
      };

      //console.log(results[i].photos);
      if (results[i].photos) {
        place.image = results[i].photos[0].getUrl({'maxWidth': 200, 'maxHeight': 200});
      }
      

      locations.push(new Place(place));
    }
    createMarker();
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

    place.marker.click = 'dick';

    
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


    /*
  var infoWindowOptions = {
    content: infowindowHtml,
    maxWidth: 200
  };
  */

  //return new google.maps.InfoWindow(infoWindowOptions);

  
  infowindow.setContent(infowindowHtml);
  infowindow.open(map, marker);
  

  //$('.place-name').text(place.name);
  
  //infowindow.setContent(place.name);
  //infowindow.setContent(place.image);
  //infowindow.open(map, marker);
  
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
  //this.marker = dataObj.marker;
}




function callYelp(locations) {
  
  function nonce_generate(){
    return (Math.floor(Math.random() * 1e12).toString());
  } 


  var yelp_url = 'http://api.yelp.com/v2/search';
  //var yelp_url = 'http://api.yelp.com/v2/business/' + locations[0].name;

  var parameters = {
    location: 'washington+dc',
    //location: 'San+Francisco',
    //cll: '"' + locations[0].location.lat + '","' + locations[0].location.lng + '"', 
    //bounds: '38.9047,-77.0164',
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
    },
    error: function() {
      // Do stuff on fail
      console.log('ajax request failed');
    }
  };

  $.ajax(settings);
}

callYelp(locations);








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


  /*
  self.clickMarker = function(name) {
    //console.log(name);
    locations.forEach(function(place){
      if (place.name === name) {
        toggleBounce(place.marker);
        openInfowindow(place, place.marker);
      }
    })
  }
  */
  
  

  
  
  
  //console.log(self.search());
  
};












