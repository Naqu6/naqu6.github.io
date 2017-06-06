var NUMBER_OF_POINTS = 500.0; // Accurate within 1 point
var NUMBER_OF_SECONDS_IN_DAY = 86400.0;
var SECONDS_TO_HOURS = 0.000277778;
var METERS_TO_FEET = 3.28084;
var METERS_TO_NM = 0.000539957;


$(document).ready(function() {
	Cesium.BingMapsApi.defaultKey="WCDFG1t7dCho3pYtjhP3~9TtLhJwfh4TmoCzzEsWmJg~ArVbBS52XqbPzY8aDjPfjh1biz_l3e8vI6sseb6k7TuH9omW5MjD3v6ex6i2dKjy";
	var viewer = new Cesium.Viewer('cesiumContainer');

	// Set Cesium Key and Viewer

	var flight;
	var StartTime;
	var EndTime;

	$(".setEndTime").hide();

	function getGroundPosition(point) {
		var cartoCoords = Cesium.Ellipsoid.WGS84.cartesianToCartographic(point);
		cartoCoords.height = 0;

		cartesianPoint = Cesium.Ellipsoid.WGS84.cartographicToCartesian(cartoCoords);

		return cartesianPoint;
	}

	function drawGroundPath(positions, color) {

		if (positions.length == 0) {
		 	return null;
		}

		var maxHeight = positions[0].z;

		for (var i = 0; i < positions.length; i++) {
			if (Math.abs(positions[i].z) > Math.abs(maxHeight)) {
				maxHeight = positions[i].z;
			}
		}

		var entity = viewer.entities.add({
		    name: 'Height',
		    polyline: {
		        positions: positions,
		        material: color,
		        height: maxHeight,
		        width: 5.0
		    }
		});

		return entity;
	}

	function toggleVisibilityOfElementsInArray(array) {
		for (var i = 0; i<array.length; i++) {
			array[i].show = !array[i].show;
		}
	}

	var dataTitles = [
		{
			dataName: "initialAltitude",
			title: "Initial Altitude: ",
			unit: " feet MSL"
		}, {
			dataName: "finalAltitude",
			title: "Final Altitude: ",
			unit: " feet MSL"
		}, {
			dataName: "averageAltitude",
			title: "Average Altitude: ",
			unit: " feet MSL"
		}, {
			dataName: "minAlt",
			title: "Minimum Altitude: ",
			unit: " feet MSL"
		}, {
			dataName: "maxAlt",
			title: "Maximum Altitude: ",
			unit: " feet MSL"
		}, {
			dataName: "initialSpeed",
			title: "Initial Speed: ",
			unit: " knots"
		}, {
			dataName: "finalSpeed",
			title: "Final Speed: ",
			unit: " knots"
		}, {
			dataName: "minSpeed",
			title: "Minimum Speed: ",
			unit: " knots"
		}, {
			dataName: "maxSpeed",
			title: "Maximum Speed: ",
			unit: " knots"
		}, {
			dataName: "distance",
			title: "Total Distance: ",
			unit: " nautical miles"
		}
	]

	function buildDataTitles(data) {
		var result = "";

		for (var i = 0; i < dataTitles.length; i++) {
			dataTitle = dataTitles[i];

			result += dataTitle.title + Math.trunc(data[dataTitle.dataName]) + dataTitle.unit + "\n\n";
		}

		return result;
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

			

			actualCourseGroundLine = drawGroundPath(data.positions, Cesium.Color.RED.withAlpha(0.5));
			targetCourseGroundLine = drawGroundPath([data.positions[0], data.positions[data.positions.length-1]], Cesium.Color.BLUE.withAlpha(0.5));

			$(".toggleRealCourse").on("click", function() {
				actualCourse.show = !actualCourse.show;

				actualCourseGroundLine.show = !actualCourseGroundLine.show
			});

			$(".toggleTargetCourse").on("click", function() {
				targetCourse.show = !targetCourse.show;

				targetCourseGroundLine.show = !targetCourseGroundLine.show
			});

			var result = "STRAIGHT AND LEVEL FLIGHT RESULTS: \n\n" + buildDataTitles(data);

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
			distance: 0
		};

		var time = Cesium.JulianDate.clone(startTime);

		var dayDelta = endTime.dayNumber - startTime.dayNumber;
		var secondsDelta = endTime.secondsOfDay - startTime.secondsOfDay;

		var delta = dayDelta * NUMBER_OF_SECONDS_IN_DAY + secondsDelta;

		var secondsIncrease = delta/NUMBER_OF_POINTS;

		var x_total = 0;
		var y_total = 0;
		var z_total = 0;

		var speedTotal = 0;
		var altitudeTotal = 0;

		var maxSpeed = -1;
		var minSpeed = Number.MAX_VALUE;

		var maxAlt = -Number.MAX_VALUE;
		var minAlt = Number.MAX_VALUE; 

		var i = 0;
		var lastTime;

		while (endTime.dayNumber > time.dayNumber || endTime.secondsOfDay >= time.secondsOfDay) { // Cesium.Compare() doesn't work as intended, using custom evaluation
			var currentPosition = entityPosition.getValue(time);

			data.positions.push(currentPosition);

			var cartoPosition = Cesium.Ellipsoid.WGS84.cartesianToCartographic(currentPosition);

			x_total += currentPosition.x;
			y_total += currentPosition.y;
			z_total += currentPosition.z;

			var alt = cartoPosition.height * METERS_TO_FEET;

			altitudeTotal += alt;

			if (minAlt > alt) {
				minAlt = alt;
			}

			if (maxAlt < alt) {
				maxAlt = alt;
			}

			time.secondsOfDay += secondsIncrease;

			if (time.secondsOfDay > NUMBER_OF_SECONDS_IN_DAY) {
				time.dayNumber += 1;
				time.secondsOfDay -= NUMBER_OF_SECONDS_IN_DAY;
			}

			if (i > 0) {
				var lastPosition = data.positions[i-1];

				var legDistance = Math.abs(Cesium.Cartesian3.distance(lastPosition, currentPosition) * METERS_TO_NM)
				var hoursTimeDifference = SECONDS_TO_HOURS * Math.abs(Cesium.JulianDate.secondsDifference(lastTime, time));

				var speed = legDistance/hoursTimeDifference;

				speedTotal += speed;

				if (speed > maxSpeed) {
					maxSpeed = speed;
				}

				if (speed < minSpeed) {
					minSpeed = speed
				}

				data.distance += legDistance;

				if (i == 1) {
					data.initialSpeed = speed
				} else {
					data.finalSpeed = speed
				}
			}

			lastTime = time.clone();

			i++;

		}

		data.averagePosition = new Cesium.Cartesian3(x_total/data.positions.length, y_total/data.positions.length, z_total/data.positions.length);

		data.initialAltitude = Cesium.Ellipsoid.WGS84.cartesianToCartographic(data.positions[0]).height * METERS_TO_FEET
		data.finalAltitude = Cesium.Ellipsoid.WGS84.cartesianToCartographic(data.positions[data.positions.length - 1]).height * METERS_TO_FEET

		data.maxSpeed = maxSpeed;
		data.minSpeed = minSpeed;

		data.maxAlt = maxAlt;
		data.minAlt = minAlt;

		data.averageSpeed = speedTotal/data.positions.length;
		data.averageAltitude = altitudeTotal/data.positions.length;

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

		$(".setStartTime").hide();
		$(".setEndTime").show();
	});

	$(".setEndTime").on("click", function() {
		EndTime = viewer.clock.currentTime;

		$(".setStartTime").show();
		$(".setEndTime").hide();
	});

	$(".setManeuver").on("click", function() {
		data = getPositionData(flight, StartTime, EndTime);
	    
	    var manuver = manuvers[$(".selectManuver").val()];

	    manuver(data, StartTime, EndTime);
	});
});