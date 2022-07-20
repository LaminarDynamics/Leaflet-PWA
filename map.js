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
let current_pos = {};
// DEBUG
current_pos = {
    lat: 40.22,
    lon: -112.44,
    speed: 15,
    altitude: 2481,
    altitude_feet: 8100,
    heading: 350,
    accuracy: 15
}
let horz_scaling = .25;   // Meters total cdi width
let vert_scaling = 100; // Feet total cdi height

// Array of .kmls
let file_paths = ["../kmls/sample.kml", "../kmls/west.kml", "../kmls/east.kml", "../kmls/utah_walk.kml", "../kmls/slc_line.kml"];

kml_lines = KmlToArray(file_paths); // Returns array of kml_line objects

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




setInterval(TrackPos, 10);
//////////////////////////////////  FAKE POSITION THING //////////////////////
function FakePos() {

    current_pos = {
        lat: current_pos.lat,
        lon: current_pos.lon,
        speed: 15,
        altitude: current_pos.altitude,
        altitude_feet: current_pos.altitude * 3.281,
        heading: current_pos.heading,
        accuracy: 15
    }

    current_pos.lat = current_pos.lat + 0.00001;
    // current_pos.heading = current_pos.heading + 1
    current_pos.lon = current_pos.lon - 0.00001;
    current_pos.altitude -= .005
    // console.log("Pos = ", current_pos.lat)

}

let user_pos_marker = L.circle([current_pos.lat, current_pos.lon], {  // Dot marker
    color: 'blue',
    fillColor: '#f03',
    fillOpacity: 0.1,
    radius: 25
}).addTo(map);

function TrackPos() {
    if (tracking) {
        // let user_pos_marker;
        // console.log("track")
        // console.log("Speed = " + current_pos.speed);
        GetLocation(); ///////////////////////////////////////////////////// FAKE POS
        // FakePos();
        map.panTo(new L.LatLng(current_pos.lat, current_pos.lon));
        // map.setZoom(15) // Map autozoom

        if (breadcrumbs == true) {
            user_pos_marker = L.circle([current_pos.lat, current_pos.lon], {  // Dot marker
                color: 'blue',
                fillColor: '#f03',
                fillOpacity: 0.1,
                radius: 25
            }).addTo(map);
        }

        user_pos_marker.setLatLng([current_pos.lat, current_pos.lon])   // Move marker thing after first position report


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

        // map.locate({ setView: true, maxZoom: 16 });

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
            altitude_feet: crd.altitude * 3.281,
            heading: crd.heading,
            accuracy: crd.accuracy
        }

    }

    function error(err) {
        console.warn(`ERROR(${err.code}): ${err.message}`);
    }

    navigator.geolocation.getCurrentPosition(success, error, options);

}
