// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_month.geojson";

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  // Define a function that we want to run once for each feature in the features array.
  // Give each feature a popup that describes the place and time of the earthquake.
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>`);
  }

  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  let earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, {
        radius: feature.properties.mag * 5,  // Adjust the radius based on earthquake magnitude
        fillColor: getColor(feature.geometry.coordinates[2]),  // Get color based on depth
        color: "red",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      });
    }
  });

  // Send our earthquakes layer to the createMap function/
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Create the base layers.
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create a baseMaps object.
  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // Create an overlay object to hold our overlay.
  let overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  let myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [street, earthquakes]
  });

  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Add a legend to the map
  var legend = L.control({ position: 'bottomright' });
  legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend');
    var depthValues = [0, 10, 30, 50, 70, 90];  // Adjust depth values as needed
    div.innerHTML += '<h4>Depth</h4>';
    for (var i = 0; i < depthValues.length; i++) {
      div.innerHTML +=
        '<i style="background:' + getColor(depthValues[i] + 1) + '"></i> ' +
        depthValues[i] + (depthValues[i + 1] ? '&ndash;' + depthValues[i + 1] + '<br>' : '+');
    }
  
    // Add color boxes next to each depth range
    for (var i = 0; i < depthValues.length; i++) {
      div.innerHTML += '<div class="color-box" style="background:' + getColor(depthValues[i] + 1) + '"></div>';
    }
  
    return div;
  };
  legend.addTo(myMap);
}

// Function to get color based on depth
function getColor(depth) {
  return depth > 90 ? '#800026' :
         depth > 70 ? '#BD0026' :
         depth > 50 ? '#E31A1C' :
         depth > 30 ? '#FC4E2A' :
         depth > 10 ? '#FD8D3C' :
                      '#FFEDA0';
}