var NUMBER_OF_POINTS = 500.0; // Accurate within 1 point
var NUMBER_OF_SECONDS_IN_DAY = 86400.0;
var SECONDS_TO_HOURS = 0.000277778;
var METERS_TO_FEET = 3.28084;
var METERS_TO_NM = 0.000539957;


// Set Cesium Key and Viewer
Cesium.BingMapsApi.defaultKey="WCDFG1t7dCho3pYtjhP3~9TtLhJwfh4TmoCzzEsWmJg~ArVbBS52XqbPzY8aDjPfjh1biz_l3e8vI6sseb6k7TuH9omW5MjD3v6ex6i2dKjy";
var viewer = new Cesium.Viewer('cesiumContainer');

var flight;
var StartTime;
var EndTime;

function secondsDifference(timeA, timeB) {
	var daysDifference = timeA.julianDayNumber - timeB.julianDayNumber;
	var secondsDifference = timeA.secondsOfDay - timeB.secondsOfDay;

	return Math.abs(daysDifference + (secondsDifference * NUMBER_OF_SECONDS_IN_DAY))
}

function getGroundPosition(point) {
	var cartoCoords = Cesium.Ellipsoid.WGS84.cartesianToCartographic(point);
	cartoCoords.height = 0;

	cartesianPoint = Cesium.Ellipsoid.WGS84.cartographicToCartesian(cartoCoords);

	return cartesianPoint;
}

function drawGroundLines(data) {
	var initalPosition = data.positions[0].clone();
	var finalPosition = data.positions[data.positions.length-1].clone();

	targetCoursePositions = [initalPosition, getGroundPosition(initalPosition), finalPosition, getGroundPosition(finalPosition)];
	actualCoursePositions = [];

	for (var i = 0; i<data.positions.length; i++) {
		actualCoursePositions.push(data.positions[i]);
		actualCoursePositions.push(getGroundPosition(data.positions[i]));
	}

	actualCourseGroundLine = viewer.entities.add({
		name: 'Actual Course Height',
		polygon: {
			hierarchy: actualCoursePositions,
			width: 5,
			material: Cesium.Color.RED.withAlpha(0.4)
		}
	});

	targetCourseGroundLine = viewer.entities.add({
		name: 'Actual Course Height',
		polygon: {
			hierarchy: targetCoursePositions,
			width: 5,
			material: Cesium.Color.BLUE.withAlpha(0.4)
		}
	});

	return [actualCourseGroundLine, targetCourseGroundLine];
}

function toggleVisibilityOfElementsInArray(array) {
	for (var i = 0; i<array.length; i++) {
		array[i].show = !array[i].show;
	}
}

var manuvers = {
	straightAndLevel: function(data, startTime, endTime) {
		targetCourse = viewer.entities.add({
		    name : 'Target Course',
		    polyline : {
		        positions : [data.positions[0], data.positions[data.positions.length-1]],
		        width : 5,
		        material : Cesium.Color.BLUE
		    }
		});

		actualCourse = viewer.entities.add({
		    name : 'Actual Course',
		    polyline: {
		        positions: data.positions,
		        width: 5,
		        material: Cesium.Color.RED
		    }
		});

		var distance = 0;
		for (var i = 1; i<data.positions.length; i++) {
			distance += Math.abs(Cesium.Cartesian3.distance(data.positions[i], data.positions[i-1]));
		}

		distance *= METERS_TO_NM; //Convert from meters to nautical miles

		var groundPositions = drawGroundLines(data);

		actualCourseGroundLine = groundPositions[0];
		targetCourseGroundLine = groundPositions[1];

		$(".toggleRealCourse").on("click", function() {
			actualCourse.show = !actualCourse.show;

			actualCourseGroundLine.show = !actualCourseGroundLine.show
		});

		$(".toggleTargetCourse").on("click", function() {
			targetCourse.show = !targetCourse.show;

			targetCourseGroundLine.show = !targetCourseGroundLine.show
		});

		initalPositionCarto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(data.positions[0]);
		finalPositionCarto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(data.positions[data.positions.length-1]);

		var averageSpeed = distance/(secondsDifference(startTime, endTime) * SECONDS_TO_HOURS)
		var result = "STRAIGHT AND LEVEL FLIGHT: \n\n Distance Traveled: " + Math.trunc(distance) + " nm \n Starting Altitute: " + Math.trunc(initalPositionCarto.height * METERS_TO_FEET) + " ft \n Ending Altitute: " + Math.trunc(finalPositionCarto.height * METERS_TO_FEET) + " ft \n\n" + "Average Speed: " + Math.trunc(avgSpeed) + " knots";

		$(".results").text(result);
		$(".results").html($(".results").html().replace(/\n/g,'<br>'));

	}, climb: function(data, startTime, endTime) {

	}, descend: function(data, startTime, endTime) {

	}, landingApproach: function(data, startTime, endTime) {



	}, turnsAroundAPoint: function(data, startTime, endTime) {

		var totalDistance = 0.0;

		for (var i = 0; i < data.positions.length; i++) {
			totalDistance += Cesium.Cartesian3.distance(data.averagePosition, data.positions[i]);
		}

		var averageDistance = totalDistance/data.positions.length;

		var targetCourse = viewer.entities.add({
		    position: data.averagePosition,
		    name: 'Target Course',
		    ellipse: {
		        semiMinorAxis : averageDistance,
		        semiMajorAxis : averageDistance,
		        material : Cesium.Color.BLUE.withAlpha(0.5),
		        outline : true
		    }
		});

		var actualCourse = viewer.entities.add({
		    name: 'Actual Course',
		    polygon: {
		        hierarchy: data.positions,
		        material: Cesium.Color.RED.withAlpha(0.5),
		    }
		});

		$(".toggleRealCourse").on("click", function() {
			actualCourse.show = !actualCourse.show;
		});

		$(".toggleTargetCourse").on("click", function() {
			targetCourse.show = !targetCourse.show;
		});


	}, STurns: function(data) {

	}, rectCourse: function(data) {

		var targetCourse = viewer.entities.add({
		    position: data.averagePosition,
		    name: 'Target Course',
		    ellipse: {
		        semiMinorAxis : averageDistance,
		        semiMajorAxis : averageDistance,
		        material : Cesium.Color.BLUE.withAlpha(0.5),
		        outline : true
		    }
		});

		var actualCourse = viewer.entities.add({
		    name: 'Actual Course',
		    polygon: {
		        hierarchy: data.positions,
		        material: Cesium.Color.RED.withAlpha(0.5),
		    }
		});

		$(".toggleRealCourse").on("click", function() {
			actualCourse.show = !actualCourse.show;
		});

		$(".toggleTargetCourse").on("click", function() {
			targetCourse.show = !targetCourse.show;
		});

	}
}

// temporary variables 
data = [];

// Setup Initial KML LOAD
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

	$(".fileMessage").text("File Selected: " + $(".kmlFile").get(0).files[0].name);

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

	var x_total = 0;
	var y_total = 0;
	var z_total = 0;


	while (endTime.dayNumber > time.dayNumber || endTime.secondsOfDay >= time.secondsOfDay) { // Cesium.Compare() doesn't work as intended, using custom evaluation
		currentPosition = entityPosition.getValue(time);

		data.positions.push(currentPosition);

		x_total += currentPosition.x;
		y_total += currentPosition.y;
		z_total += currentPosition.z;

		time.secondsOfDay += secondsIncrease;

		if (time.secondsOfDay > NUMBER_OF_SECONDS_IN_DAY) {
			time.dayNumber += 1;
			time.secondsOfDay -= NUMBER_OF_SECONDS_IN_DAY;
		}
	}

	data.averagePosition = new Cesium.Cartesian3(x_total/data.positions.length, y_total/data.positions.length, z_total/data.positions.length);

	return data;
}

function tracePath(positions) {
	viewer.entities.add({
	    name : 'Trace of Path',
	    polyline : {
	        positions : positions,
	        width : 5,
	        material : Cesium.Color.RED
	    }
	});
}

$(".toggleFlightPath").on("click", function() {
	flight.show = !flight.show;
})

$(".setStartTime").on("click", function() {
	StartTime = viewer.clock.currentTime;
});

$(".setEndTime").on("click", function() {
	EndTime = viewer.clock.currentTime;
});

$(".setManeuver").on("click", function() {
	data = getPositionData(flight, StartTime, EndTime);
    
    var manuver = manuvers[$(".selectManuver").val()];

    manuver(data, StartTime, EndTime);
});
