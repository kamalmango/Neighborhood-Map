
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
        var image = results.businesses[i].image_url;
        //var largeImage = image.replace('ms', 'o');
        place.name = results.businesses[i].name;
        place.location = {
          'lat' : results.businesses[i].location.coordinate.latitude,
          'lng' : results.businesses[i].location.coordinate.longitude
        };
        //place.image = results.businesses[i].image_url;
        place.image = image.replace('ms', 'l'); // get larger yelp image
        place.ratingImage = results.businesses[i].rating_img_url;
        place.reviewSnippet = results.businesses[i].snippet_text;
        place.reviewUrl = results.businesses[i].url;
        place.address = results.businesses[i].location.display_address[0] + ', ' + results.businesses[i].location.display_address[1];
        

        locations.push(new Place(place));
      }
      createMarker();
      ko.applyBindings(new ViewModel());
    },
    error: function() {
      // Do stuff on fail
      console.log('Yelp information not available at the moment');
    } 
  };
 
  $.ajax(settings);
}


initMap();
callYelp();


function createMarker() {
  //var currentMarker = null;

  locations.forEach(function(place) {
    
    var redImage = {
      url: 'http://www.google.com/mapfiles/kml/paddle/red-circle.png',
      scaledSize: new google.maps.Size(50, 50)
    };

    var bluImage = {
      url: 'http://www.google.com/mapfiles/kml/paddle/blu-circle.png',
      scaledSize: new google.maps.Size(50, 50)
    }

    var markerOptions = {
      map: map,
      position: place.location,
      icon: redImage
    };

    place.marker = new google.maps.Marker(markerOptions);

    place.marker.clicked = false;

    
    place.marker.changeColor = function() {
      place.marker.setIcon(bluImage);
    };
    
    place.marker.resetColor = function() {
      place.marker.setIcon(redImage);
    };
    
    
    google.maps.event.addListener(place.marker, 'click', function() {
      locations.forEach(function(place){
        if (place.marker.clicked === true) {
          place.marker.clicked = false;
          place.marker.setIcon(redImage);
        }
      });
      this.clicked = true;
      toggleBounce(this);
      openInfowindow(place, place.marker);
      this.changeColor();
    });

    place.marker.click = function() {
      locations.forEach(function(place){
        if (place.marker.clicked === true) {
          place.marker.clicked = false;
          place.marker.setIcon(redImage);
        }
      });
      this.clicked = true;
      toggleBounce(place.marker);
      openInfowindow(place, place.marker);
      place.marker.changeColor();
    };

    place.marker.addListener('mouseover', function() {
      
      if (this.clicked === false) {
        this.changeColor();
      }
      
    });

    place.marker.addListener('mouseout', function() {
      
      if (this.clicked === false) {
        this.resetColor();
      }
      
    });
   
  });
 
}



function openInfowindow(place, marker) {
  
  var infowindowHtml = '<div id="infoWindow">' +
    '<div class = "place-name">' + place.name + '</div>' +
    '<img class = "rating" src="' + place.ratingImage + '">' +
    //'<img class = "place-image" src= "' + place.image + '">' +
    '<img class = "place-image" src= "' + place.image + '">' +
    '<div class = "review-snippet">' + place.reviewSnippet + '</div>' +
    '<a href = "review-url">' + place.reviewUrl + '</a>' +
    '</div>';

  
  infowindow.setContent(infowindowHtml);
  infowindow.open(map, marker);
  
  
  google.maps.event.addListener(infowindow,'closeclick',function(){
    marker.clicked = false;
    marker.resetColor();
    
  });

  
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
  this.ratingImage = dataObj.ratingImage;
  this.reviewSnippet = dataObj.reviewSnippet;
  this.reviewUrl = dataObj.reviewUrl;
  this.address = dataObj.address;
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














