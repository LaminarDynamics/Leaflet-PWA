// 7-26-22

// Give current position and speed. Get back prediction for location in x time
function GetPredictionPos(positon, interval) {
    var R, brng, d, lat1, lat2, lon1, lon2;
    R = 6378.1;
    brng = toRad(positon.heading);
    d = (positon.speed / 1000) * interval;  // Return in meters


    lat1 = toRad(positon.lat);
    lon1 = toRad(positon.lon);
    lat2 = Math.asin(Math.sin(lat1) * Math.cos(d / R) + Math.cos(lat1) * Math.sin(d / R) * Math.cos(brng));
    lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(d / R) * Math.cos(lat1), Math.cos(d / R) - Math.sin(lat1) * Math.sin(lat2));
    lat2 = toDegrees(lat2);
    lon2 = toDegrees(lon2);

    let predicted_pos = {
        lat: lat2,
        lon: lon2
    }
    console.log("Predicted: ", predicted_pos)
    return predicted_pos;
}


// Converts numeric degrees to radians
function toRad(Value) {
    return Value * Math.PI / 180;
}

// Converts radians to degrees
function toDegrees(radians) {
    var pi = Math.PI;
    return radians * (180 / pi);
}