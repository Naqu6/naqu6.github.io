var NUMBER_OF_POINTS = 500.0; // Accurate within 1 point
var NUMBER_OF_SECONDS_IN_DAY = 86400.0;

// Set Cesium Key and Viewer
Cesium.BingMapsApi.defaultKey="WCDFG1t7dCho3pYtjhP3~9TtLhJwfh4TmoCzzEsWmJg~ArVbBS52XqbPzY8aDjPfjh1biz_l3e8vI6sseb6k7TuH9omW5MjD3v6ex6i2dKjy";
var viewer = new Cesium.Viewer('cesiumContainer');

var flight;
var StartTime;
var EndTime;

function getGroundPosition(point) {
	var cartoCoords = Cesium.Ellipsoid.WGS84.cartesianToCartographic(point);
	cartoCoords.height = 0;

	cartesianPoint = Cesium.Ellipsoid.WGS84.cartographicToCartesian(cartoCoords);

	return cartesianPoint;
}

function toggleVisibilityOfElementsInArray(array) {
	for (var i = 0; i<array.length; i++) {
		array[i].show = !array[i].show;
	}
}

var manuvers = {
	straightAndLevel: function(data) {
		initalPosition = data.positions[0].clone();
		finalPosition = data.positions[data.positions.length-1].clone();

		// averageAlt = (initalPosition.z + finalPosition.z)/2;

		// initalPosition.z = averageAlt
		// finalPosition.z = averageAlt;

		targetCourse = viewer.entities.add({
		    name : 'Target Course',
		    polyline : {
		        positions : [initalPosition, finalPosition],
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

		targetCoursePositions = [initalPosition, finalPosition, getGroundPosition(initalPosition), getGroundPosition(finalPosition)];
		actualCoursePositions = data.positions.slice(0);

		for (var i = 0; i<data.positions.length; i++) {
			actualCourseLines.push(getGroundPosition(data.positions[i]));
		}

		actualCourseGroundLine = viewer.entities.add({
			name: 'Actual Course Height',
			polyline: {
				positions: actualCoursePositions,
				width: 5,
				material: Cesium.Color.BLUE.withAlpha(0.1)
			}
		});

		actualCourseGroundLine.ellipse.material = new Cesium.GridMaterialProperty({
			color : Cesium.Color.BLUE,
			cellAlpha : 0.2,
			lineCount : new Cesium.Cartesian2(8, 8),
			lineThickness : new Cesium.Cartesian2(2.0, 2.0)
		});

		targetCourseGroundLine = viewer.entities.add({
			name: 'Actual Course Height',
			polyline: {
				positions: targetCoursePositions,
				width: 5,
				material: Cesium.Color.RED.withAlpha(0.1)
			}
		});

		targetCourseGroundLine.ellipse.material = new Cesium.GridMaterialProperty({
			color : Cesium.Color.RED,
			cellAlpha : 0.1,
			lineCount : new Cesium.Cartesian2(8, 8),
			lineThickness : new Cesium.Cartesian2(2.0, 2.0)
		});


		$(".toggleRealCourse").on("click", function() {
			actualCourse.show = !actualCourse.show;

			actualCourseGroundLine.Ellipsoid.show = !actualCourseGroundLine.show
		});

		$(".toggleTargetCourse").on("click", function() {
			targetCourse.show = !targetCourse.show;

			targetCourseGroundLine.Ellipsoid.show = !targetCourseGroundLine.show
		});

	}, climb: function(data) {

	}, descend: function(data) {

	}, landingApproach: function(data) {



	}, turnsAroundAPoint: function(data) {

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

    manuver(data);
});