
// globar variables
var locations = [];
var map;
var infowindow;
var mapZoom;

// function that calls google maps API to bring up a map centered in Washington DC
function initMap() {
  if (window.innerWidth < 730) {
    mapZoom = 12;
  } else {
    mapZoom = 14;
  }

  var latlng = {lat: 38.9047, lng: -77.0164}; //DC latitude longitude

  map = new google.maps.Map(document.getElementById('map'), {
    center: latlng,
    zoom: mapZoom
  });

  infowindow = new google.maps.InfoWindow();
}

// function that calls the Yelp Search API which returns a JSON with 20 key
// locations around the DC area with information about each place including
// images, review snippets, ratings, address and phone numbers. 
function callYelp() {
  // yelp uses OAuth 1.0a for authentication API requests
  // bettiolo/oauth-signature-js was used to generate the required signature

  //function that genearates a random number so that API call works multiple times 
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

    // funciton for parsing the API JSON results
    success: function(results) {
      
      var place;
      
      for (var i = 0; i < results.businesses.length; i++) {
        place = {}; //place object that will hold the neccessary information from the yelp results
        var image = results.businesses[i].image_url;
        place.name = results.businesses[i].name;
        place.location = {
          'lat' : results.businesses[i].location.coordinate.latitude,
          'lng' : results.businesses[i].location.coordinate.longitude
        };
        place.image = image.replace('ms', 'l'); // get larger yelp image by replacing ms with l in the returned url
        place.ratingImage = results.businesses[i].rating_img_url;
        place.reviewSnippet = results.businesses[i].snippet_text;
        place.reviewUrl = results.businesses[i].url;
        place.address = results.businesses[i].location.display_address[0] + ', ' + results.businesses[i].location.display_address[1];
        
        locations.push(new Place(place)); //push the place object into a custom "Place" object which would store the needed values
      }
      createMarker();
      ko.applyBindings(new ViewModel());
    },
    // function for if the API call to Yelp fails for any reason (ex. no internet)
    error: function() {
      alert('Sorry, Yelp information not available at the moment');
    }
  };
  $.ajax(settings);
};

initMap();
callYelp();

// function that creates the markers shown on the map
// each marker represents one of the locations returned from the Yelp API
function createMarker() {
  locations.forEach(function(place) {
    
    //create a custom red marker form google mapfiles
    var redImage = {
      url: 'http://www.google.com/mapfiles/kml/paddle/red-circle.png',
      scaledSize: new google.maps.Size(50, 50)
    };

    //create a custom blue marker from google mapfiles
    var bluImage = {
      url: 'http://www.google.com/mapfiles/kml/paddle/blu-circle.png',
      scaledSize: new google.maps.Size(50, 50)
    };

    var markerOptions = {
      map: map,
      position: place.location, //place marker in location from Yelp Search API
      icon: redImage //marker starts out as red
    };

    place.marker = new google.maps.Marker(markerOptions);

    place.marker.clicked = false; //keep track if the marker is clicked or not

    //marker method to change the marker's color to blue
    place.marker.changeColor = function() {
      place.marker.setIcon(bluImage);
    };
    
    //marker method to reset the marker color to red
    place.marker.resetColor = function() {
      if (place.marker.clicked !== true) {
        console.log(place.marker.clicked);
        place.marker.setIcon(redImage);
      }
    };

    function resetMarkers() {
      locations.forEach(function(place){
        if (place.marker.clicked === true) {
          place.marker.clicked = false;
          place.marker.setIcon(redImage);
        }
      });
    }
    
    //if the marker is clicked, it changes colors to blue, opens an infoWindow and bounces
    google.maps.event.addListener(place.marker, 'click', function() {
      resetMarkers();
      this.clicked = true;
      toggleBounce(this);
      openInfowindow(place, place.marker);
      this.changeColor();
    });

    //marker click method to simulate what happens if a marker is clicked and be able to refernce as a binding in index.html
    place.marker.click = function() {
      google.maps.event.trigger(place.marker, 'click');
      /*
      resetMarkers();
      place.marker.clicked = true;
      toggleBounce(place.marker);
      openInfowindow(place, place.marker);
      place.marker.changeColor();
      */
    };

    //marker color changes to blue if the mouse is over it
    place.marker.addListener('mouseover', function() {
      if (this.clicked === false) {
        this.changeColor();
      } 
    });

    //marker color resets back to red if mouse is not over it anymore
    place.marker.addListener('mouseout', function() {
      if (this.clicked === false) {
        this.resetColor();
      }  
    }); 
  }); 
};


//funciton that sets the information inside the google infoWindow and opens it
function openInfowindow(place, marker) {
  // HTML to fill the infowindow with location specific information such as photos, review snippet, name and link to yelp url
  var infowindowHtml = '<div id="infoWindow">' +
    '<div class = "place-name">' + place.name + '</div>' +
    '<img class = "rating" src="' + place.ratingImage + '">' +
    '<img class = "place-image" src= "' + place.image + '">' +
    //'<div class = "review-snippet">' + place.reviewSnippet + '</div>' +
    '<div class = "reviews"><h3>Review Snippet</h3><p id="snippet">' + place.reviewSnippet + '</p></div>'+
    '<a href = "'+ place.reviewUrl+ '" target="_blank"> Click here to see more reviews </a>' +
    '</div>';

  infowindow.setContent(infowindowHtml); //fill the infoWindow with the HTML
  infowindow.open(map, marker);
  
  //event listener that would reset the marker color to red if infoWindow is closed
  google.maps.event.addListener(infowindow,'closeclick',function(){
    marker.clicked = false;
    marker.resetColor();
    map.panTo({lat: 38.9047, lng: -77.0164}); // centers the map when the infoWindow is closed
  });
};

// make marker bounce
function toggleBounce(marker){
  marker.setAnimation(google.maps.Animation.BOUNCE);
  setTimeout(function(){marker.setAnimation(null);}, 2100);
};

//function that creates a custom "Place" object which will store references for each locations key values for easy access
function Place(dataObj) {
  this.name = dataObj.name;
  this.location = dataObj.location;
  this.image = dataObj.image;
  this.marker = null; // a reference to the Places' map marker will be saved after the marker is built
  this.ratingImage = dataObj.ratingImage;
  this.reviewSnippet = dataObj.reviewSnippet;
  this.reviewUrl = dataObj.reviewUrl;
  this.address = dataObj.address;
};

//KO View Model
var ViewModel = function() {
  var self = this;
  
  // search bar functionality
  self.points = ko.observableArray(locations);
  self.query = ko.observable('');
  self.search = ko.computed(function(){
    return ko.utils.arrayFilter(self.points(), function(point){
      //filter markers as well as list
      if (point.name.toLowerCase().indexOf(self.query().toLowerCase()) === -1){
        point.marker.setMap(null);
      } else {
        point.marker.setMap(map);
      }
      return point.name.toLowerCase().indexOf(self.query().toLowerCase()) >= 0; //test if array (true or false)
    });
  });

  
};


//JQuery that would toggle the list of places once the "Places" button on the top right is clicked
$("#place-toggle").click(function() {
  $("#place-list").toggle();
});

$("#nav-toggle").click(function(){
  $("#place-list").toggle();
});

















