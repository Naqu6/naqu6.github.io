Cesium.BingMapsApi.defaultKey="WCDFG1t7dCho3pYtjhP3~9TtLhJwfh4TmoCzzEsWmJg~ArVbBS52XqbPzY8aDjPfjh1biz_l3e8vI6sseb6k7TuH9omW5MjD3v6ex6i2dKjy";
var viewer = new Cesium.Viewer('cesiumContainer');


$(".loadKML").on("click", function() {
	var dataSource = Cesium.KmlDataSource.load($(".kmlFile").get(0).files[0],
     {
          camera: viewer.scene.camera,
          canvas: viewer.scene.canvas
     });
	viewer.dataSources.add(dataSource);

});