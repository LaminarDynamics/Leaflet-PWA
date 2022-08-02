// 5-3-22

var map = L.map('map').setView([61.86, -151.0], 3); // AK
// var map = L.map('map').setView([39.8283, -98.5795], 3); // Lower 48
// var user_pos = L.marker([0, 0]).addTo(map);
var tiles = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    maxZoom: 18,
    // attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
    //     'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox/' + 'dark' + '-v9',
    tileSize: 512,
    zoomOffset: -1
}).addTo(map);


let tracking = false;
let current_pos = {
    lat: 0,
    lon: 0
};


let horz_scaling = .065;   // Meters total cdi width
let vert_scaling = 100; // Feet total cdi height

// Array of .kmls
// let file_paths = ["kmls/sample.kml", "kmls/west.kml", "kmls/east.kml", "kmls/utah_walk.kml", "kmls/slc_line.kml", "kmls/airport_road.kml"];
let file_paths = ["kmls/airport_road.kml", "kmls/brooks1.kml", "kmls/brooks2.kml", "kmls/barrow.kml"];



kml_lines = KmlToArray(file_paths); // Returns array of kml_line objects
// console.log(kml_lines)

file_paths.forEach(kmls => {
    omnivore.kml(kmls).addTo(map);
});


L.edgeScaleBar().addTo(map);

DrawIdleCdi();


let recip_hdg;
let closetest_line;
let tracking_line = false;
let breadcrumbs = false;


function GetX_TrackData(current_pos) {
    if (current_pos.heading != null) { // Only give closest line if have heading to compare with line heading
        [closetest_line, recip_hdg] = GetClosestLine(current_pos, kml_lines)
        if (closetest_line == null) {
            console.log("Heading not alligned with closest line")
            tracking_line = false;
        }

        else {
            // console.log("closesest ", closetest_line)
            tracking_line = true;
            current_pos.x_track = closetest_line.x_track;
            if (recip_hdg == true) { // To reverse CDI in recip_hdg 
                // console.log("Reversing")
                current_pos.x_track = current_pos.x_track * -1
            }
            current_pos.altitude_dif_feet = current_pos.altitude_feet - closetest_line.altitude_feet;
            // console.log(current_pos)
        }
    }

    else {
        console.log("No heading data")
        tracking_line = false;
    }
}


let user_pos_marker = L.circle([current_pos.lat, current_pos.lon], {  // Dot marker
    color: 'green',
    fillColor: '#f03',
    fillOpacity: .7,
    radius: 25
}).addTo(map);

let accuracy_circle = L.circle([current_pos.lat, current_pos.lon], {  // Accuracy circle
    color: 'blue',
    fillColor: '#f03',
    fillOpacity: 0.1,
    radius: 25
}).addTo(map);

let prediction;

var prediction_circle = L.circle([0, 0], {
    color: 'blue',
    fillColor: 'blue',
    fillOpacity: 0.5,
    radius: 10
}).addTo(map);

let trend_line = L.polyline([[0, 0], [1, 1]], {
    color: 'red'
}).addTo(map);

function ShowPredictedPos() {
    let pos_age = (Date.now() - current_pos.timestamp) * 0.001;  // How long ago last update (seconds)

    if (current_pos.timestamp != null && current_pos.speed > 0 && pos_age < 5) { // GPS timestamp and speed for prediction stuff and fresh timestamp get prediction
        prediction = GetPredictionPos(current_pos, pos_age)
        // document.getElementById("debug").innerHTML = "POS: " + prediction.lat + " " + prediction.lon;

        // Show predicted circles
        prediction_circle.setLatLng([prediction.lat, prediction.lon]);
        prediction_circle.setRadius(current_pos.accuracy)
        accuracy_circle.setLatLng([prediction.lat, prediction.lon]);
        // map.setView([prediction.lat, prediction.lon], 16); // Map lock

        // Show track/trend line
        prediction.heading = current_pos.heading; // Need these for calculations
        prediction.altitude_feet = current_pos.altitude_feet;   // Need these for calculations
        prediction.speed = current_pos.speed;   // Need these for calculations
        let trend_line_end = TrendLine(prediction, 10); // Starting point and length in seconds
        let trend_line_points = [
            [prediction.lat, prediction.lon],
            [trend_line_end.lat, trend_line_end.lon]
        ];
        trend_line.setLatLngs(trend_line_points);

        // Hide plain GPS circles
        user_pos_marker.setRadius(0);
        // accuracy_circle.setRadius(0);


        // PLOT IT!
        TrackPos();
    }
    else {
        PlainGPS();
    }

    function PlainGPS() {   // Show plain GPS pos if not enough good data to make prediction
        user_pos_marker.setLatLng([current_pos.lat, current_pos.lon]);
        console.log("PLAIN")
        // accuracy_circle.setLatLng([current_pos.lat, current_pos.lon]);
        // accuracy_circle.setRadius(current_pos.accuracy)
    }

}

function TrackPos() {
    if (tracking) {
        // map.setView([current_pos.lat, current_pos.lon], 16);

        if (breadcrumbs == true) {
            user_pos_marker = L.circle([current_pos.lat, current_pos.lon], {  // Dot marker
                color: 'blue',
                fillColor: '#f03',
                fillOpacity: 0.1,
                radius: 25
            }).addTo(map);
        }

        GetX_TrackData(current_pos);
    }

    if (tracking_line) {
        // Which data to send to X_track and CDI calculators for display

        // Actual
        // GetX_TrackData(current_pos);
        // DrawActiveCdi(current_pos, horz_scaling, vert_scaling)

        // Prediction
        GetX_TrackData(prediction);
        DrawActiveCdi(prediction, horz_scaling, vert_scaling)
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
    GetLocation();
    setInterval(ShowPredictedPos, 5)
})

$(".stop_btn").click(function () {
    console.log("Stop tracking");
    $(".locate_btn").css({ "background-color": "white" });
    tracking = false

})


function GetLocation() {

    var options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };

    function success(pos) {
        var crd = pos.coords;

        current_pos = {
            lat: crd.latitude,
            lon: crd.longitude,
            speed: crd.speed,
            speed_mph: pos.coords.speed * 2.23694,
            altitude: crd.altitude,
            altitude_feet: crd.altitude * 3.281,
            heading: crd.heading,
            accuracy: crd.accuracy,
            accuracy_feet: pos.coords.accuracy * 3.281,
            timestamp: pos.timestamp,
            human_timestamp: GetLocalTimestamp(pos.timestamp),
        }
        $("#coords").text(`LAT: ${Math.round(current_pos.lat * 1000) / 1000} ----- LON: ${Math.round(current_pos.lon * 1000) / 1000} (+/- ${Math.round(crd.accuracy)} meters)`)
        $("#alt").text(`ALT: ${Math.round(current_pos.altitude_feet)}`)
        $("#speed").text(`Speed: ${Math.round(current_pos.speed_mph)}`)
        $("#heading").text(`Heading: ${Math.round(current_pos.heading)}`)
        $("#timestamp").text(`Time: ${current_pos.human_timestamp}`)

    }

    function error(err) {
        console.warn(`ERROR(${err.code}): ${err.message}`);
        alert(`ERROR(${err.code}): ${err.message}`);
    }

    navigator.geolocation.watchPosition(success, error, options);
}

function GetLocalTimestamp(gps_timestamp) {
    const dateObject = new Date(gps_timestamp);
    const humanDateFormat = dateObject.toLocaleString();
    return humanDateFormat;
}