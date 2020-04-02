// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson"

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {
// Define a function we want to run once for each feature in the features array
// Give each feature a popup describing the place and time of the earthquake  
  function onEachFeature(feature, layer) {
    layer.bindPopup(
      "<h3>" + 
      feature.properties.place +
      "</h3><hr><p>" + 
      new Date(feature.properties.time) + 
      "</p>" +
      "</h3><hr><p>Magnitude: " + 
      feature.properties.mag + 
      "</p>"
    );
  }
  var colorScaleRange = ['#ffffb2', '#bd0026']
  var minmax = d3.extent(earthquakeData.map((feature) => feature.properties.mag));
  var colorScale = d3.scaleLinear().domain(minmax).range(colorScaleRange);

// Create a GeoJSON layer containing the features array on the earthquakeData object
// Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: function (feature, latlng) {
          var geojsonMarkerOptions = {
            radius: Math.pow(2, feature.properties.mag - 1),
            fillColor: colorScale(+feature.properties.mag),
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
          };
          return L.circleMarker(latlng, geojsonMarkerOptions);
        }
    });
    var bins = d3.ticks(Math.floor(minmax[0]), minmax[1], Math.ceil(minmax[1] - minmax[0]));
    var legend = {
      limits: bins,
      colors: bins.map(mag => colorScale(mag))
    }

// Sending our earthquakes layer to the createMap function
createMap(earthquakes, legend);
}

function createMap(earthquakes, legendOptions) {

// Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
    }
  );
  
// Define a baseMaps object to hold our base layers
  var baseMaps = {
      "Street Map": streetmap
  };

// Create overlay object to hold our overlay layer
  var overlayMaps = {
      Earthquakes: earthquakes
  };

// Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
      center: [37.09, -95.71],
      zoom: 5,
      layers: [streetmap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);

// // Create a legend to display information about our map
var legend = L.control({position: 'bottomright'});
legend.onAdd = function () {
    var div = L.DomUtil.create('div', 'info legend');
    var limits = legendOptions.limits;
    var colors = legendOptions.colors;
    var labels = [];

    // Add min & max
    var legendInfo = `
      <h1>Magnitude</h1>`;

    div.innerHTML = legendInfo;

    limits.forEach(function(limit, index) {
      labels.push(`<li style="background-color:${colors[index]};">${limit}</li>`);
    });

    div.innerHTML += `<ul style="">${labels.join("")}</ul>`
    return div;
  };
  legend.addTo(myMap);
}
