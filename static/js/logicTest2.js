// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson"

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" +
      "</h3><hr><p>Magnitude: " + feature.properties.mag + "</p>");
  }
// Create a GeoJSON layer containing the features array on the earthquakeData object
// Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
      pointToLayer: function (feature, latlng) {
        var colorScaleRange = ['#ffffb2', '#bd0026']
        var minmax = d3.extent(data.features.map((feature) => feature.properties.mag));
        var range = [0, data.features.length - 1];
        var domain = [1,minmax[1]];
        var bins = d3.ticks(Math.floor(minmax[0]), minmax[1], Math.ceil(minmax[1] - minmax[0]));
        var colorScale = d3.scaleLinear().domain(minmax).range(colorScaleRange);
        var getColor  = d3.scaleLinear().domain(domain).range(colorScale);
      
      var geojsonMarkerOptions = {
        radius: 2*feature.properties.mag,
        fillColor: colorScale(+feature.properties.mag),
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
        };
      return L.circleMarker(latlng, geojsonMarkerOptions);
      }
  });

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  // var earthquakes = {};
  //   for (var i=0; i < bins.length; i++) {
  //     var earthquake = L.geoJSON(earthquakeData.features, {
  //       filter: function(feature) {
  //         return (i == bins.length -1 ?
  //           (+feature.properties.mag >= bins[i]) :
  //           (+feature.properties.mag >= bins[i]) &&
  //           (+feature.properties.mag < bins[i + 1]));
  //       },
      // pointToLayer: function (feature, latlng) {
      //   return L.circleMarker(latlng, {
      //     radius: 2*feature.properties.mag,
      //     fillColor: colorScale(+feature.properties.mag),
      //     color: "#000",
      //     weight: 1,
      //     opacity: 1,
      //     fillOpacity: 0.8
      //   });
      // },
    // onEachFeature: onEachFeature,
  // });
  // Sending our earthquakes layer to the createMap function
createMap(earthquakes);
}

function createMap(earthquakes) {
  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

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
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [streetmap, earthquakes]
  });

  // function getColor(d) {
  //     return d < 1 ? '#800026' :
  //           d < 2  ? '#BD0026' :
  //           d < 3  ? '#E31A1C' :
  //           d < 4  ? '#FC4E2A' :
  //           d < 5  ? '#FD8D3C' :
  //           d < 6  ? '#FEB24C' :
  //           d < 7  ? '#FED976' :
  //                   '#FFEDA0';
  // }
  // Create a legend to display information about our map
  var legend = L.control({position: 'bottomright'});
  legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend'),
    bins = [0, 1, 2, 3, 4, 5];
    div.innerHTML+='Magnitude<br><hr>'
    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < bins.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(bins[i] + 1) + '">&nbsp&nbsp&nbsp&nbsp</i> ' +
            bins[i] + (bins[i + 1] ? '&ndash;' + bins[i + 1] + '<br>' : '+');
    }
  }
  };

// Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);


