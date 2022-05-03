// 5-3-22

var map = L.map('map').setView([39.8283, -98.5795], 3);
var user_pos = L.marker([0, 0]).addTo(map);
var tiles = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    maxZoom: 18,
    // attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
    //     'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox/' + 'dark' + '-v9',
    tileSize: 512,
    zoomOffset: -1
}).addTo(map);

omnivore.kml('sample.kml').addTo(map);
L.edgeScaleBar().addTo(map);



let tracking = false;
let current_pos = {};
// DEBUG
current_pos = {
    lat: 38.25,
    lon: -109.412,
    speed: 15,
    altitude: 1500,
    heading: 190,
    accuracy: 15
}
let scaling = 1;

kml_lines = KmlToArray("sample.kml"); // Returns array of kml_line objects
// console.log(kml_lines)
DrawIdleCdi();



let recip_hdg;
let closetest_line;
let tracking_line = false;

if (current_pos.heading != null) { // Only give closest line if have heading to compare with line heading
    [closetest_line, recip_hdg] = GetClosestLine(current_pos, kml_lines)
    if (closetest_line == null) {
        console.log("Heading not alligned with closest line")
    }

    else {
        console.log("closesest ", closetest_line)
        tracking_line = true;
        current_pos.x_track = closetest_line.x_track;
    }
}

else {
    console.log("No heading data")
}


setInterval(TrackPos, 1000);
function TrackPos() {
    if (tracking) {
        console.log("track")
        console.log("Speed = " + current_pos.speed);
        GetLocation();
        map.panTo(new L.LatLng(current_pos.lat, current_pos.lon));
        // map.setZoom(15)
        user_pos.setLatLng([current_pos.lat, current_pos.lon])
    }

    if (tracking_line) {
        DrawActiveCdi(current_pos, scaling)
    }
}


window.onresize = StyleStuff; // No parentathes because idk

StyleStuff(); // Do on load
function StyleStuff() {

    document.getElementById("map").style.height = (window.innerHeight / 2) + "px";
    var offsetHeight = document.getElementById('map').offsetHeight;
    // console.log(offsetHeight)
}




$(".locate_btn").click(function () {
    console.log("Start tracking");
    tracking = true;
    $(".locate_btn").css({ "background-color": "blue" });

})

$(".stop_btn").click(function () {
    console.log("Stop tracking");
    $(".locate_btn").css({ "background-color": "white" });
    tracking = false

})


function GetLocation() {

    console.log("Tracking bool = " + tracking);
    var options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };

    function success(pos) {
        var crd = pos.coords;

        // console.log('Your current position is:');
        // console.log(`Latitude : ${crd.latitude}`);
        // console.log(`Longitude: ${crd.longitude}`);
        // console.log(`More or less ${crd.accuracy} meters.`);

        map.locate({ setView: true, maxZoom: 16 });

        // var user_pos = L.marker([crd.latitude, crd.longitude]).addTo(map);
        // user_pos.bindPopup("You are within " + crd.accuracy.toFixed() + " meters from this point").openPopup();

        // var accuracy_circle = L.circle([crd.latitude, crd.longitude], {
        //     color: 'red',
        //     fillColor: '#f03',
        //     fillOpacity: 0.1,
        //     radius: 500
        // }).addTo(map);

        current_pos = {
            lat: crd.latitude,
            lon: crd.longitude,
            speed: crd.speed,
            altitude: crd.altitude,
            heading: crd.heading,
            accuracy: crd.accuracy
        }

    }

    function error(err) {
        console.warn(`ERROR(${err.code}): ${err.message}`);
    }

    navigator.geolocation.getCurrentPosition(success, error, options);

}
