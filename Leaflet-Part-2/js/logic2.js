// Define the base maps
var streetmap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
});

var darkmap = L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
});

var satellitemap = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
});

// Initialize the map with the streetmap as the default layer
var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [streetmap]
});

// Define the URL for earthquake data
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Fetch the earthquake data
d3.json(queryUrl).then(function(data) {
    createFeatures(data.features);
});

// Define the URL for tectonic plates data
var tectonicPlatesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Create a layer group for tectonic plates
var tectonicPlates = L.layerGroup();

// Fetch and add tectonic plates data
d3.json(tectonicPlatesUrl).then(function(data) {
    L.geoJSON(data, {
        color: "orange",
        weight: 2
    }).addTo(tectonicPlates);

    // Add tectonic plates layer to the map
    tectonicPlates.addTo(myMap);

    // Update overlayMaps with tectonic plates layer
    overlayMaps["Tectonic Plates"] = tectonicPlates;

    // Create layer controls
    var baseMaps = {
        "Street Map": streetmap,
        "Dark Map": darkmap,
        "Satellite Map": satellitemap
    };

    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);
});

function createFeatures(earthquakeData) {
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place +
            "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" +
            "<p>Magnitude: " + feature.properties.mag + "</p>" +
            "<p>Depth: " + feature.geometry.coordinates[2] + "</p>");
    }

    function pointToLayer(feature, latlng) {
        var geojsonMarkerOptions = {
            radius: feature.properties.mag * 4,
            fillColor: getColor(feature.geometry.coordinates[2]),
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };
        return L.circleMarker(latlng, geojsonMarkerOptions);
    }

    var earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: pointToLayer,
        onEachFeature: onEachFeature
    });

    // Create a layer group for earthquakes
    var earthquakeLayer = L.layerGroup([earthquakes]);

    // Add earthquake layer to the map
    earthquakeLayer.addTo(myMap);

    // Add legend to the map
    var legend = L.control({ position: "bottomright" });

    legend.onAdd = function () {
        var div = L.DomUtil.create("div", "info legend"),
            grades = [0, 10, 30, 50, 70, 90],
            labels = [];

        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }

        return div;
    };

    legend.addTo(myMap);
}

// Function to determine marker color based on depth
function getColor(depth) {
    return depth > 90 ? "#d73027" :
           depth > 70 ? "#fc8d59" :
           depth > 50 ? "#fee08b" :
           depth > 30 ? "#d9ef8b" :
           depth > 10 ? "#91cf60" :
                        "#1a9850";
}

// Create an empty overlay maps object to hold layers
var overlayMaps = {};
