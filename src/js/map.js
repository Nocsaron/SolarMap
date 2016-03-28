// Load Aerial with Labels layer from bing maps
var layers = [];
layers.push(new ol.layer.Tile({
  visible: true,
  preload: Infinity,
  source: new ol.source.BingMaps({
    key: 'AlmPp9qqz9ZI8noTd2a7HfRUPDbT8fNfhjedJ7FHzFLpqH3_7zDQWio4cA_qNryo',
    imagerySet: 'AerialWithLabels',
    maxZoom: 19
  })
}));
var overlay = new ol.layer.Tile({
  visible: true,
  source: new ol.source.XYZ({
    url: 'http://cs.arizona.edu/people/woodti/tiles/{z}/{x}/{y}.png'
  })
});
overlay.setOpacity(1);
layers.push(overlay); 

// build map, center on Tucson
var map = new ol.Map({
  layers: layers,
  target: 'map',
  loadTilesWhileInteracting: true,
  view: new ol.View({
    center: ol.proj.transform(
  	  [-110.9499, 32.23165], 'EPSG:4326', 'EPSG:3857'),
    resolution: 13
  })
});



// a normal select interaction to handle click
var select = new ol.interaction.Select();
map.addInteraction(select);

var selectedFeatures = select.getFeatures();

// a DragBox interaction used to select features by drawing boxes
var dragBox = new ol.interaction.DragBox({
  condition: ol.events.condition.platformModifierKeyOnly
});

map.addInteraction(dragBox);
dragBox.on('boxend', function() {
  // features that intersect the box are added to the collection of
  // selected features, and their names are displayed in the "info"
  // div
  var info = [];
  var extent = dragBox.getGeometry().getExtent();
  console.log(extent);
});

// clear selection when drawing a new box and when clicking on the map
dragBox.on('boxstart', function() {
  selectedFeatures.clear();
});
map.on('click', function() {
  selectedFeatures.clear();
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