window.app = {};
var app = window.app;


//
// Define rotate to north control.
//


/**
 * @constructor
 * @extends {ol.control.Control}
 * @param {Object=} opt_options Control options.
 */
app.SelectionToggle = function(opt_options) {

  var options = opt_options || {};

  var button = document.createElement('button');
  button.innerHTML = 'S';

  var this_ = this;
  var toggleSelectionMode = function() {
    // toggle selection mode
    flipToggle();
  };

  button.addEventListener('click', toggleSelectionMode, false);
  button.addEventListener('touchstart', toggleSelectionMode, false);

  var element = document.createElement('div');
  element.className = 'toggle-selection ol-unselectable ol-control';
  element.appendChild(button);

  ol.control.Control.call(this, {
    element: element,
    target: options.target
  });

};
ol.inherits(app.SelectionToggle, ol.control.Control);

// Load Aerial with Labels layer from bing maps
var layers = [];
var bing = new ol.layer.Tile({
  visible: true,
  preload: Infinity,
  source: new ol.source.BingMaps({
    key: 'AlmPp9qqz9ZI8noTd2a7HfRUPDbT8fNfhjedJ7FHzFLpqH3_7zDQWio4cA_qNryo',
    imagerySet: 'AerialWithLabels',
    maxZoom: 19
  })
});
layers.push(bing);

var overlay = new ol.layer.Tile({
  visible: true,
  source: new ol.source.XYZ({
    url: 'http://cs.arizona.edu/people/woodti/tiles/{z}/{x}/{y}.png'
  })
});
overlay.setOpacity(1);
layers.push(overlay); 

var source = new ol.source.Vector({wrapX: false});

var vector = new ol.layer.Vector({
  source: source,
  style: new ol.style.Style({
    fill: new ol.style.Fill({
      color: 'rgba(255, 255, 255, 0.2)'
    }),
    stroke: new ol.style.Stroke({
      color: '#ffcc33',
      width: 2
    }),
    image: new ol.style.Circle({
      radius: 6,
      fill: new ol.style.Fill({
        color: '#ffcc33'
      })
    })
  })
});
layers.push(vector);

// build map, center on Tucson
var map = new ol.Map({
  controls: ol.control.defaults({
    attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
      collapsible: false
    })
  }).extend([
    new app.SelectionToggle()
  ]),
  layers: layers,
  target: 'map',
  loadTilesWhileInteracting: true,
  view: new ol.View({
    center: ol.proj.transform(
  	  [-110.9499, 32.23165], 'EPSG:4326', 'EPSG:3857'),
    resolution: 13
  })
});

// Called when search is run, uses geo location on address to get lat/lon
function runSearch() {
  var xmlhttp = new XMLHttpRequest();
  var url = "http://nominatim.openstreetmap.org/search?format=json&q=" + document.getElementById('address-search').value.split(' ').join('+')
  xmlhttp.onreadystatechange = function() {
  	if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
  		var myArr = JSON.parse(xmlhttp.responseText);
  		moveToAddress(myArr);
  	}
  };
  xmlhttp.open("GET", url, true);
  xmlhttp.send();
}

// Move view to address
function moveToAddress(arr) {
  var duration = 2000;
  var start = +new Date();
  var pan = ol.animation.pan({
    duration: duration,
    source: /** @type {ol.Coordinate} */ (map.getView().getCenter()),
    start: start
  });
  var zoom = ol.animation.zoom({
    duration: duration,
    resolution: map.getView().getResolution(),
    start: start
  });

  map.beforeRender(pan, zoom);
  map.getView().setCenter(ol.proj.fromLonLat([Number(arr[0].lon), Number(arr[0].lat)]));
  map.getView().setResolution(0.25);
}

var typeSelect = document.getElementById('type');

var draw; // global so we can remove it later
var i_toggle = false;
function addInteraction() {
  if (i_toggle) {
    var geometryFunction, maxPoints;
    var value = 'LineString';
    maxPoints = 2;
    geometryFunction = function(coordinates, geometry) {
      if (!geometry) {
        geometry = new ol.geom.Polygon(null);
      }
      var start = coordinates[0];
      var end = coordinates[1];
      geometry.setCoordinates([
        [start, [start[0], end[1]], end, [end[0], start[1]], start]
      ]);

      if (coordinates.length > 2) {
        var start_point = ol.proj.transform(start, 'EPSG:3857', 'EPSG:4326');
        var end_point = ol.proj.transform(end, 'EPSG:3857', 'EPSG:4326');
        console.log('mouse click coord : ' + start_point + ' | ' + end_point);
      }

      return geometry;
    };

    draw = new ol.interaction.Draw({
      source: source,
      type: /** @type {ol.geom.GeometryType} */ (value),
      geometryFunction: geometryFunction,
      maxPoints: maxPoints
    });
    map.addInteraction(draw);
  }
}

function flipToggle() {
  if (i_toggle) {
    i_toggle = false;
  } else {
    i_toggle = true;
  }

  map.removeInteraction(draw);
  addInteraction();
}

addInteraction();