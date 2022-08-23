// Arkansas map options
var options = {
  zoomSnap: .5,
  center: [34.8, -92.0],
  // zoom: 7.5,
  minZoom: 5,
  // padding: [0, 0],
  // maxBounds: [[36.50, -89.64], [33.00, -94.62]],
  // zoomControl: false,
  // attributionControl: false
}

// create map
var map = L.map('mapid', options);

map.on('autopanstart', function (event) {
  console.log("autopan");
});

map.on('moveend', function (event) {
  console.log("moveend");
});

// request tiles and add to map
// https://leaflet-extras.github.io/leaflet-providers/preview/
var OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// Stadia
// var Stadia_OSMBright = L.tileLayer('https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png', {
// 	maxZoom: 20,
// 	attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
// });
//
var Stadia_AlidadeSmooth = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
	maxZoom: 20,
	attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
});
//
// var Stadia_AlidadeSmoothDark = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
// 	maxZoom: 20,
// 	attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
// });


var countiesLayer = L.geoJSON(counties, {
  pane: 'tilePane',
  interactive: false,
  style: function (feature) {
    return {
      fillColor: '#888',
      weight: 1,
      color: '#444',
      fillOpacity: 1,
    }
  }
}).addTo(map);

console.log(countiesLayer.getBounds());
map.fitBounds(countiesLayer.getBounds(), {paddingTopLeft: [8,5], paddingBottomRight: [45,5]});
// map.setMaxBounds(countiesLayer.getBounds());

// // change zoom control position
// L.control.zoom({
//   position: 'bottomleft'
// }).addTo(map);

let overlayControl = {};

let basemapControl = {
  "Solid": countiesLayer,
  "Streets": OpenStreetMap_Mapnik,
  "Light": Stadia_AlidadeSmooth
};

var layerControl = L.control.layers(
  basemapControl,
  overlayControl,
  {
    hideSingleBase: true,
    collapsed: false
  }).addTo(map);

L.control.locate({
  locateOptions: {maxZoom: 10},
}).addTo(map);

L.easyPrint().addTo(map);

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
 var colors = ['#EE6677', '#228833', '#66CCEE', '#CCBB44', '#4477AA', '#AA3377', '#BBBBBB'];
 // var colors = ['#EE7733', '#0077BB', '#33BBEE', '#EE3377', '#CC3311', '#009988', '#BBBBBB'];
 // var colors = ['#EE99AA', '#6699CC', '#004488', '#EECC66', '#994455', '#997700'];
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

  var radius = 8;
  var dataLayer = L.geoJSON(data, {
    pointToLayer: function (geoJsonPoint, latlng) {
      // console.log(geoJsonPoint);
      return L.circleMarker(latlng, {
        radius: radius,
        fillColor: colors[categories.indexOf(geoJsonPoint.properties.type)],
        weight: 2,
        fillOpacity: 0.9,
        color: 'whitesmoke',
      })
    },
    onEachFeature: function (feature, layer) {
      // console.log(layer);
      layerGroups[feature.properties.type].addLayer(layer);
      // var popupText = '';
      // popupText += '<p>' + feature.properties.name + '<p>';
      // popupText += '<p>' + feature.properties.address + '<p>';
      // popupText += '<p>' + feature.properties.phoneNumber + '<p>';
      // popupText += '<p>' + feature.properties.type + '<p>';
      //
      // layer.bindPopup(popupText, {maxWidth: 175});
      // layer.on('click', function (e) {
      //   console.log(layer);
      //
      // });
    }
  }).addTo(map);

  map.on('popupclose', function (e) {
    dataLayer.resetStyle();
  });

  var thresholdDistance = metersPerPixel(map.getCenter().lat, map.getZoom())*radius; // meters
  map.on('click', function (e) {
    // console.log(e);
    thresholdDistance = metersPerPixel(e.latlng.lat, map.getZoom())*radius;
    // console.log(thresholdDistance);

    // var clickBounds = L.circle(e.latlng,{
    //   radius: 200,
    //   stroke: false,
    //   fill: false
    // }).addTo(map).getBounds();
    // console.log(clickBounds);

    var intersectingFeatures = [];
    dataLayer.eachLayer(function (layer) {
      // console.log(layer);
      // var bounds = L.featureGroup().addLayer(layer).getBounds();
      // console.log(bounds);

      if (map.distance(e.latlng, layer.getLatLng()) <= thresholdDistance) {
        // console.log(map.distance(e.latlng, layer.getLatLng()));
        intersectingFeatures.push(layer);

        layer.setStyle({
          weight: 2,
          color: 'yellow'
        });
      }
      // else if (map.distance(e.latlng, layer.getLatLng()) <= thresholdDistance*1.5) {
      //   console.log(map.distance(e.latlng, layer.getLatLng()));
      // }

      // if (!bounds.isValid()) {
      //   console.log('invalid');
      // }

      // if (bounds && clickBounds.intersects(bounds)) {
      //   intersectingFeatures.push(layer);
      // }
    });

    console.log(intersectingFeatures);

    // if at least one feature found, show it
    if (intersectingFeatures.length) {
      var popupHTML = "";
      if (intersectingFeatures.length > 1) {
        popupHTML += '<p class="fs-5 fw-bold p-0 m-0">' + intersectingFeatures.length + " Screening Sites</p><ul class='list-group list-group-flush'>" +
          intersectingFeatures.map(function(o) {
          return '<li class="list-group-item px-0"><p class="my-0 fw-bold">' + o.feature.properties.name + ': </p>' +
            '<p class="my-0">' + o.feature.properties.address + ' </p>' +
            '<p class="my-0">' + o.feature.properties.phoneNumber + ' </p>' +
            '<p class="my-0">Screening Type: ' + o.feature.properties.type + '</p>';
        }).join('</li>');
        popupHTML += '</ul>';
      } else {
        popupHTML += '<span><strong>' + intersectingFeatures[0].feature.properties.name + ':</strong> </span>' +
          '<span>' + intersectingFeatures[0].feature.properties.address + '</span>' +
          '<span>' + intersectingFeatures[0].feature.properties.phoneNumber + '</span>' +
          '<span>' + intersectingFeatures[0].feature.properties.type + '</span>';
      }


      map.openPopup(popupHTML,
        e.latlng,
        {
          maxHeight: 200,
          autoPanPaddingTopLeft: [50, 20],
          autoPanPaddingBottomRight: [130, 20],
        }
      );

      // zoom in if a large number of features
      if (intersectingFeatures.length > 8) {
        map.setZoomAround(e.latlng, map.getZoom()+1);
      }
    }
  });


}   //end drawMap()

function metersPerPixel(latitude, zoomLevel) {
  var earthCircumference = 40075017;
  var latitudeRadians = latitude * (Math.PI/180);
  return earthCircumference * Math.cos(latitudeRadians) / Math.pow(2, zoomLevel + 8);
}

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
