var NUMBER_OF_POINTS = 1000.0;
var NUMBER_OF_SECONDS_IN_DAY = 86400.0;

// Set Cesium Key and Viewer
Cesium.BingMapsApi.defaultKey="WCDFG1t7dCho3pYtjhP3~9TtLhJwfh4TmoCzzEsWmJg~ArVbBS52XqbPzY8aDjPfjh1biz_l3e8vI6sseb6k7TuH9omW5MjD3v6ex6i2dKjy";
var viewer = new Cesium.Viewer('cesiumContainer');

var flight;
var StartTime;
var EndTime;

// temporary varibles 
positions = [];

// Setup Inital KML LOAD
$(".loadKML").on("click", function() {

	// Set the data source
	// $(".kmlFile") is a jquery array, so we need to get the first element (the input), and then query the uploaded files.
	// Files[0] is the correct file
	var dataSource = Cesium.KmlDataSource.load($(".kmlFile").get(0).files[0],
     {
     	// Set the camera and canvas to the current scene
          camera: viewer.scene.camera,
          canvas: viewer.scene.canvas
     });

	viewer.dataSources.add(dataSource).then(function(dSource) {
		flight = dSource._entityCollection._entities._array[0]
	});
});

function getAllPoints(entity, startTime, endTime) { // Dont use global startTime and endTime 
	var entityPosition = entity.position;

	var positions = [entityPosition.getValue(startTime)];

	var time = Cesium.JulianDate.clone(startTime);

	var dayDelta = endTime.dayNumber - startTime.dayNumber;
	var secondsDelta = endTime.secondsOfDay - startTime.secondsOfDay;

	var delta = dayDelta * NUMBER_OF_SECONDS_IN_DAY + secondsDelta;

	var secondsIncrease = delta/NUMBER_OF_POINTS;


	while (endTime.dayNumber > time.dayNumber || endTime.secondsOfDay >= time.secondsOfDay) { // Cesium.Compare doesn't work as intended, using custom evaluation
		time.secondsOfDay += secondsIncrease;

		if (time.secondsOfDay > NUMBER_OF_SECONDS_IN_DAY) {
			time.dayNumber += 1;
			time.secondsOfDay -= NUMBER_OF_SECONDS_IN_DAY;
		}
		positions.push(entityPosition.getValue(time));
	}

	return positions;
}

$(".setStartTime").on("click", function() {
	StartTime = viewer.clock.currentTime;
});

$(".setEndTime").on("click", function() {
	EndTime = viewer.clock.currentTime;
});

$(".setManeuver").on("click", function() {
	positions = getAllPoints(flight, StartTime, EndTime);
});