window.app = {};
var app = window.app;

app.SelectionToggle = function(opt_options) {
  var options = opt_options || {};

  var button = document.createElement('button');
  var clear_button = document.createElement('button');
  button.innerHTML = 'S';
  button.title = "Select Solar Area";

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

app.ClearButton = function(opt_options) {
  var options = opt_options || {};

  var button = document.createElement('button');
  button.innerHTML = 'C';
  button.title = "Clear";

  var this_ = this;

  var clickClearButton = function() {
    clearButton();
  };

  button.addEventListener('click', clearButton, false);
  button.addEventListener('touchstart', clearButton, false);

  var element = document.createElement('div');
  element.className = 'clear ol-unselectable ol-control';
  element.appendChild(button);

  ol.control.Control.call(this, {
    element: element,
    target: options.target
  });

};
ol.inherits(app.ClearButton, ol.control.Control);


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

// Solar tiles
var solarLayer = new ol.layer.Tile({
  visible: true,
  source: new ol.source.TileImage({
    tileUrlFunction: function(coord) {
      var z = coord[0];
      var x = coord[1];
      var y = Math.pow(2, z) + coord[2];
      return 'http://www.cs.arizona.edu/people/woodti/solar_tiles/' + z + '/' + x + '/' + y + '.png';
    }
  })
});

solarLayer.setOpacity(0.65);
layers.push(solarLayer);

// Drag layer
var source = new ol.source.Vector({wrapX: false});
var vector = new ol.layer.Vector({
  source: source,
  style: new ol.style.Style({
    fill: new ol.style.Fill({
      color: 'rgba(255, 255, 255, 0.3)'
    }),
    stroke: new ol.style.Stroke({
      color: '#ffffff',
      width: 2
    })
  })
});
layers.push(vector);

function clearButton() {
  source.clear();
  toggleOff();
  clearBottom();
}

// build map, center on Tucson
var map = new ol.Map({
  controls: ol.control.defaults({
    attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
      collapsible: false
    })
  }).extend([
    new app.SelectionToggle(),
    new app.ClearButton()
  ]),
  layers: layers,
  target: 'map',
  loadTilesWhileInteracting: true,
  view: new ol.View({
    center: ol.proj.transform(
  	  [-110.9499, 32.2285], 'EPSG:4326', 'EPSG:3857'),
    zoom: 15
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
        var east, west, north, south;
        if (start_point[0] > end_point[0])
        {
          east = start_point[0];
          west = end_point[0];
        }
        else
        {
          west = start_point[0];
          east = end_point[0];
        }

        if (start_point[1] > end_point[1])
        {
          north = start_point[1];
          south = end_point[1];
        }
        else
        {
          south = start_point[1];
          north = end_point[1];
        }

        console.log("North " + north);
        console.log("South " + south);
        console.log("West " + west);
        console.log("East " + east);

        var url = "http://ec2-52-39-83-5.us-west-2.compute.amazonaws.com/cgi-bin/grass_backend.py?north_coord=" + north + "&south_coord=" + south + "&east_coord=" + east + "&west_coord=" + west;

        console.log(url);
        httpGetAsync(url, function(text) {
          display_results(text);
        });
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

function toggleOff() {
  i_toggle = false;

  map.removeInteraction(draw);
  addInteraction();
}

addInteraction();

function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

function display_results(text)
{
  //bla = '{"jan":624100820425.817017,"feb":745582653706.182983,"mar":1125239936035.348389,"apr":1399216917904.372070,"may":1592477242730.955566,"jun":1662899272212.545654,"jul":1678202773828.637451,"aug":1517705308241.968750,"sep":1199920499983.632324,"oct":919750703522.083252,"nov":654051507697.683228,"dec":566299118309.213867,"year":13685446754598.441406}';
  json_data = JSON.parse(text);
  console.log(json_data)
  //console.log(json_data.jan);
  showResults(json_data);
}

var calledAlready = 0; // Global variable just to keep track on whether or not you already drew something.
var barData;
var myGraph;
var heading;
var annualPower;
function showResults(power){
	
	if(calledAlready == 0){
		var resContainer = document.getElementById("results");
	
		var resultDiv = document.createElement("div");
		resultDiv.className = "jumbotron";
		resultDiv.id = "resultDiv";
		
		annualPower = power.year;
		heading = document.createElement("h1");
		heading.innerHTML = "Your selection recieves <br />" + annualPower.toFixed(2) + " kWh/year";
		heading.style.textAlign = "center";
	
		var graph = document.createElement("canvas");
		graph.style.width = "600px";
		graph.style.height = "400px";
	
		resultDiv.appendChild(heading);
		resultDiv.appendChild(graph);
		resContainer.appendChild(resultDiv);
		
		barData = {
			type: 'bar',
			data: {
				labels : ["January","February","March","April","May","June","July","August","September","October","November","December"],
				datasets : [{
					label: 'kWh/month',
					data : [(power.jan * 0.0562).toFixed(2), power.feb.toFixed(2), power.mar.toFixed(2), power.apr.toFixed(2), power.may.toFixed(2), power.jun.toFixed(2), power.jul.toFixed(2), power.aug.toFixed(2), power.sep.toFixed(2), power.oct.toFixed(2), power.nov.toFixed(2), power.dec.toFixed(2)],
				backgroundColor: "rgba(255,99,132,0.2)",
				borderColor: "rgba(255,99,132,1)",
				hoverBackgroundColor: "rgba(255,99,132,0.4)",
				hoverBorderColor: "rgba(255,99,132,1)"
			}]
			},
			options: {
				scales: {
					yAxes: [{
						ticks: {
							beginAtZero:true
						}
					}]
				}
			}
		}

		myGraph = new Chart(graph, barData);
		calledAlready = 1;
	}
	else{
		
		barData.data.datasets[0].data[0] += power.jan;
		barData.data.datasets[0].data[1] += power.feb;
		barData.data.datasets[0].data[2] += power.mar;
		barData.data.datasets[0].data[3] += power.apr;
		barData.data.datasets[0].data[4] += power.may;
		barData.data.datasets[0].data[5] += power.jun;
		barData.data.datasets[0].data[6] += power.jul;
		barData.data.datasets[0].data[7] += power.aug;
		barData.data.datasets[0].data[8] += power.sep;
		barData.data.datasets[0].data[9] += power.oct;
		barData.data.datasets[0].data[10] += power.nov;
		barData.data.datasets[0].data[11] += power.dec;
		
		myGraph.update();
		annualPower += power.year;
		heading.innerHTML = "Your selections recieves <br />" + annualPower.toFixed(2) + " kWh/year";
	}
}

function clearBottom() {
	var parentNode = document.getElementById("results");
	var childNode = document.getElementById("resultDiv");
	parentNode.removeChild(childNode);
	calledAlready = 0;
  
}
