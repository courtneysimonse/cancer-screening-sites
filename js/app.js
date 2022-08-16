// Arkansas map options
var options = {
  zoomSnap: .5,
  center: [34.8, -92.0],
  zoom: 7.5,
  minZoom: 2,
  zoomControl: false,
  // attributionControl: false
}

// create map
var map = L.map('mapid', options);

// request tiles and add to map
// https://leaflet-extras.github.io/leaflet-providers/preview/
// var OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
// 	maxZoom: 19,
// 	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
// }).addTo(map);

// Stadia
// var Stadia_OSMBright = L.tileLayer('https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png', {
// 	maxZoom: 20,
// 	attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
// });
//
var Stadia_AlidadeSmooth = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
	maxZoom: 20,
	attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
}).addTo(map);
//
// var Stadia_AlidadeSmoothDark = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
// 	maxZoom: 20,
// 	attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
// });

var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles Powered by <a href="http://www.esri.com/" target="_blank">ESRI</a> &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

// change zoom control position
L.control.zoom({
  position: 'bottomleft'
}).addTo(map);

let overlayControl = {};

let basemapControl = {
  "Streets": Stadia_AlidadeSmooth,
  "Satellite": Esri_WorldImagery
};

var layerControl = L.control.layers(
  basemapControl,
  overlayControl,
  {
    hideSingleBase: true,
    collapsed: false
  }).addTo(map);

  const categories = [
    'Breast',
    'Cervical',
    'Colorectal',
    'Lung',
    'FQHC',
    'RHC',
  ];

 // generate colors for legend
 // var breaks = categories.length;
 // var colors = chroma.scale(chroma.brewer.BuGn).colors(categories.length);
 // https://personal.sron.nl/~pault/#sec:qualitative
 var colors = ['#4477AA', '#EE6677', '#228833', '#CCBB44', '#66CCEE', '#AA3377', '#BBBBBB'];
 console.log(colors);


// GET DATA
processData();

// PROCESS DATA FUNCTION
function processData() {
  d3.csv("/data/ar_providers.csv", (d) => {
    // console.log(d);
    return {
      type: "Feature",
      properties: {
        type: d.Type,
        name: d.Name,
        address: d.Address,
        phoneNumber: d["Phone Number"]
      },
      geometry: {
        type: "Point",
        coordinates: [+d.Longitude, +d.Latitude]
      }
    }
  }).then((data) => {
    console.log(data);
    drawMap(data);
  }).catch(error => console.log(error));


  // drawLegend(categories, colors);

}   //end processData()

// DRAW MAP FUNCTION
function drawMap(data) {
  console.log(data);

  var layerGroups = [];
  categories.forEach((category, i) => {
    // var layerName = category;
    layerGroups[category] = L.layerGroup().addTo(map);
    var legendName = '<span class="legendColor" style="background:' + colors[i] + '"></span>'+category;
    layerControl.addOverlay(layerGroups[category],legendName);
  });
  // console.log(layerGroups);


  var dataLayer = L.geoJSON(data, {
    pointToLayer: function (geoJsonPoint, latlng) {
      // console.log(geoJsonPoint);
      return L.circleMarker(latlng, {
        radius: 5,
        color: colors[categories.indexOf(geoJsonPoint.properties.type)],
      })
    },
    onEachFeature: function (feature, layer) {
      layerGroups[feature.properties.type].addLayer(layer);
      var popupText = '';

      layer.bindPopup(popupText, {maxwidth: "auto"});
    }
  }).addTo(map);


}   //end drawMap()

function drawLegend(labels, colors) {

  var legendControl = L.control({
    position: 'topright'
  });

  legendControl.onAdd = function(map) {

    var legend = L.DomUtil.create('div', 'legend');
    return legend;

  };

  legendControl.addTo(map);

  var legend = document.querySelector('.legend');
  var legendHTML = "<h3>Legend</h3><ul>";

  for (var i = 0; i < labels.length; i++) {

    var color = colors[i];

    var classRange = '<li><span style="background:' + color + '"></span> ' +
        labels[i] + '</li>'
    legendHTML += classRange;

  }

  legendHTML += '</ul><p>(Data from SOURCE)</p>';
  legend.innerHTML = legendHTML;

} // end drawLegend()
