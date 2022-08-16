(function () {

  // US map options
  var options = {
    zoomSnap: .5,
    center: [39, -97],
    zoom: 5,
    minZoom: 2,
    zoomControl: false,
    // attributionControl: false
  }

  // create map
  var map = L.map('mapid', options);

  // request tiles and add to map
  // https://leaflet-extras.github.io/leaflet-providers/preview/
  var OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  	maxZoom: 19,
  	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  // Stadia
  // var Stadia_OSMBright = L.tileLayer('https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png', {
  // 	maxZoom: 20,
  // 	attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
  // });
  //
  // var Stadia_AlidadeSmooth = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
  // 	maxZoom: 20,
  // 	attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
  // });
  //
  // var Stadia_AlidadeSmoothDark = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
  // 	maxZoom: 20,
  // 	attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
  // });

  // change zoom control position
  L.control.zoom({
    position: 'bottomleft'
  }).addTo(map);

  // setup slider
  var dateSlider = document.getElementById('slider');

  function timestamp(str) {
      return new Date(str).getTime();
  }

  noUiSlider.create(dateSlider, {
  // Create two timestamps to define a range.
      range: {
          min: timestamp('2010'),
          max: timestamp('2016')
      },

  // Steps of one week
      step: 7 * 24 * 60 * 60 * 1000,

  // Two more timestamps indicate the handle starting positions.
      start: [timestamp('2011-01-15')],

  // No decimals
      format: {
        to: function (value) {
          return value;
        },
        from: function (value) {
          return Number(value);
        }
      }
  });


  // update slider
  var dateValues = [
      document.getElementById('event')
  ];

  var formatter = new Intl.DateTimeFormat('en-US');

  dateSlider.noUiSlider.on('update', function (values, handle) {
      dateValues[handle].innerHTML = formatter.format(new Date(+values[handle]));
  });



  // GET DATA
  processData();

  // PROCESS DATA FUNCTION
  function processData() {

    drawMap();

    // example breaks for legend
    var breaks = [1, 4, 7, 10];
    var colorize = chroma.scale(chroma.brewer.BuGn).classes(breaks).mode('lab');

    drawLegend(breaks, colorize);

  }   //end processData()

  // DRAW MAP FUNCTION
  function drawMap() {

  }   //end drawMap()

  function drawLegend(breaks, colorize) {

    var legendControl = L.control({
      position: 'topright'
    });

    legendControl.onAdd = function(map) {

      var legend = L.DomUtil.create('div', 'legend');
      return legend;

    };

    legendControl.addTo(map);

    var legend = document.querySelector('.legend');
    var legendHTML = "<h3><span>YYYY</span> Legend</h3><ul>";

    for (var i = 0; i < breaks.length - 1; i++) {

      var color = colorize(breaks[i], breaks);

      var classRange = '<li><span style="background:' + color + '"></span> ' +
          breaks[i].toLocaleString() + ' &mdash; ' +
          breaks[i + 1].toLocaleString() + '</li>'
      legendHTML += classRange;

    }

    legendHTML += '</ul><p>(Data from SOURCE)</p>';
    legend.innerHTML = legendHTML;

  } // end drawLegend()

})();
