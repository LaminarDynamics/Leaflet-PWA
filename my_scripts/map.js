// 5-3-22


var map = L.map('map').setView([39.8283, -98.5795], 3);
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
// DEBUG
// current_pos = {
//     // lat: 40.22,
//     // lon: -112.44,
//     lat: 70.198357,
//     lon: -148.473999,
//     speed: 15,
//     altitude: 0,
//     altitude_feet: 0,
//     heading: 60,
//     accuracy: 15
// }

let horz_scaling = .065;   // Meters total cdi width
let vert_scaling = 100; // Feet total cdi height

// Array of .kmls
let file_paths = ["kmls/sample.kml", "kmls/west.kml", "kmls/east.kml", "kmls/utah_walk.kml", "kmls/slc_line.kml", "kmls/airport_road.kml"];
// let file_paths = ["kmls/airport_road.kml", "kmls/west.kml"];


kml_lines = KmlToArray(file_paths); // Returns array of kml_line objects
// console.log(kml_lines)

file_paths.forEach(kmls => {
    omnivore.kml(kmls).addTo(map);
});


L.edgeScaleBar().addTo(map);

// console.log(kml_lines)
DrawIdleCdi();



let recip_hdg;
let closetest_line;
let tracking_line = false;
let breadcrumbs = false;


function GetX_TrackData() {
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




// setInterval(TrackPos, 1);
//////////////////////////////////  FAKE POSITION THING //////////////////////
// function FakePos() {

//     current_pos = {
//         lat: current_pos.lat,
//         lon: current_pos.lon,
//         speed: 15,
//         altitude: current_pos.altitude,
//         altitude_feet: current_pos.altitude * 3.281,
//         heading: current_pos.heading,
//         accuracy: 15
//     }

//     current_pos.lat = current_pos.lat + 0.0000005;
//     // current_pos.heading = current_pos.heading + 1
//     current_pos.lon = current_pos.lon + 0.000005;
//     current_pos.altitude -= .005
//     // console.log("Pos = ", current_pos)

// }

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

function ShowPredictedPos() {

    let pos_age = (Date.now() - current_pos.timestamp) * 0.001;  // How long ago last update (seconds)


    if (current_pos.timestamp != null && current_pos.speed > 0 && pos_age < 5) { // GPS timestamp and speed for prediction stuff and fresh timestamp get prediction

        prediction = GetPredictionPos(current_pos, pos_age)
        document.getElementById("debug").innerHTML = "POS: " + prediction.lat + " " + prediction.lon;


        // Show predicted circles
        prediction_circle.setLatLng([prediction.lat, prediction.lon]);
        prediction_circle.setRadius(current_pos.accuracy)
        accuracy_circle.setLatLng([prediction.lat, prediction.lon]);
        map.setView([prediction.lat, prediction.lon], 16); // Map lock




        // Update current_pos with predicted location
        current_pos.lat = prediction.lat;
        current_pos.lon = prediction.lon;



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
        // GetLocation(); ///////////////////////////////////////////////////// FAKE POS
        // FakePos();
        map.setView([position.lat, position.lon], 16);
        // map.panTo(new L.LatLng(current_pos.lat, current_pos.lon));
        // map.setZoom(15) // Map autozoom

        if (breadcrumbs == true) {
            user_pos_marker = L.circle([current_pos.lat, current_pos.lon], {  // Dot marker
                color: 'blue',
                fillColor: '#f03',
                fillOpacity: 0.1,
                radius: 25
            }).addTo(map);
        }

        // user_pos_marker.setLatLng([current_pos.lat, current_pos.lon])   // Move marker thing after first position report

        GetX_TrackData();
    }

    if (tracking_line) {
        GetX_TrackData();
        DrawActiveCdi(current_pos, horz_scaling, vert_scaling)
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

        // TrackPos();

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