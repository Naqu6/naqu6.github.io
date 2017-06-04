var NUMBER_OF_POINTS = 1000.0; // This should be 2 lower than you want it 
var NUMBER_OF_SECONDS_IN_DAY = 86400.0;

// Set Cesium Key and Viewer
Cesium.BingMapsApi.defaultKey="WCDFG1t7dCho3pYtjhP3~9TtLhJwfh4TmoCzzEsWmJg~ArVbBS52XqbPzY8aDjPfjh1biz_l3e8vI6sseb6k7TuH9omW5MjD3v6ex6i2dKjy";
var viewer = new Cesium.Viewer('cesiumContainer');

var flight;
var StartTime;
var EndTime;

var manuvers = {
	straightAndLevel: function(positions) {

	}, climb: function(positions) {

	}, climbingTurn: function(positions) {

	}, descend: function(positions) {

	}, descendingTurn: function(positions) {

	}, landingApproach: function(positions) {

	}, turnsAroundAPoint: function(positions) {

	}, STurns: function(positions) {

	}, rectCourse: function(positions) {

	}
}

// temporary varibles 
data = [];

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

function getPositionData(entity, startTime, endTime) { // Dont use global startTime and endTime 
	var entityPosition = entity.position;

	var data = {
		positions: [],
	};

	var time = Cesium.JulianDate.clone(startTime);

	var dayDelta = endTime.dayNumber - startTime.dayNumber;
	var secondsDelta = endTime.secondsOfDay - startTime.secondsOfDay;

	var delta = dayDelta * NUMBER_OF_SECONDS_IN_DAY + secondsDelta;

	var secondsIncrease = delta/NUMBER_OF_POINTS;


	while (endTime.dayNumber > time.dayNumber || endTime.secondsOfDay >= time.secondsOfDay) { // Cesium.Compare() doesn't work as intended, using custom evaluation
		currentPosition = entityPosition.getValue(time);

		data.positions.push(currentPosition);

		time.secondsOfDay += secondsIncrease;

		if (data.average === undefined) {
			data.average = {
				x: currentPosition.x,
				y: currentPosition.y,
				z: currentPosition.z
			}
		} else {
			data.average.x = (data.average.x + currentPosition.x)/2;
			data.average.y = (data.average.y + currentPosition.y)/2;
			data.average.z = (data.average.z + currentPosition.z)/2;
		}

		if (time.secondsOfDay > NUMBER_OF_SECONDS_IN_DAY) {
			time.dayNumber += 1;
			time.secondsOfDay -= NUMBER_OF_SECONDS_IN_DAY;
		}
	}

	return data;
}

$(".setStartTime").on("click", function() {
	StartTime = viewer.clock.currentTime;
});

$(".setEndTime").on("click", function() {
	EndTime = viewer.clock.currentTime;
});

$(".setManeuver").on("click", function() {
	data = getPositionData(flight, StartTime, EndTime);
	    viewer.entities.add({
        position : Cesium.Cartesian3(data.average.x, data.average.y, data.average.z),
        label : {
            text : 'Average Position',
            font : '24px Helvetica',
            fillColor : Cesium.Color.SKYBLUE,
            outlineColor : Cesium.Color.BLACK,
            outlineWidth : 2,
            style : Cesium.LabelStyle.FILL_AND_OUTLINE
        }
    });
});