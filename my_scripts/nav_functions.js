function GetClosestLine(current_pos, kml_lines) {

    let x_tracks = [];

    kml_lines.forEach(line => {

        // Get x_track to each line
        line.bearing = GetBearing(line.point_a, line.point_b);

        if (line.bearing <= 180) { // Get reciprocal bearing
            line.bearing_recip = line.bearing + 180;
        }
        else {
            line.bearing_recip = line.bearing - 180;
        }

        // bearings.push(a_b_bearing);

        let x_track = GetXTrack([current_pos.lat, current_pos.lon], line.bearing, line.point_a, line.point_b);

        line.x_track = x_track;


        if (x_track < 0) { // Remove negatives for easier compairison
            x_track = x_track * -1;
        }
        x_tracks.push(x_track);
    });

    // Get index of smallest value in array
    let min = Math.min(...x_tracks);    // Need to use ... to destructure array for compairison for some reason
    let index_of_smallest = x_tracks.indexOf(min);

    let active_line = kml_lines[index_of_smallest];

    if (current_pos.heading != null) { // Only give closest line if have heading to compare with line heading

        let tolerance = 45; // Check line bearing is withing x degress of heading
        let recip = true;

        // Get difference between line and current heading
        let current_to_line_hdg_dif;    // Difference between current heading and line bearing
        if (current_pos.heading > active_line.bearing) {
            current_to_line_hdg_dif = current_pos.heading - active_line.bearing;
        }
        else {
            current_to_line_hdg_dif = active_line.bearing - current_pos.heading;
        }

        if (current_to_line_hdg_dif > 180) { // Get recip if took long way around compass rose
            current_to_line_hdg_dif -= 360;
        }

        // Fix Negative issues
        if (current_to_line_hdg_dif < 0) {
            current_to_line_hdg_dif = current_to_line_hdg_dif * -1
            recip = false;
        }



        let current_to_line_recip_hdg_dif; // Difference between current heading and line_recip bearing
        if (current_pos.heading > active_line.bearing_recip) {
            current_to_line_recip_hdg_dif = current_pos.heading - active_line.bearing_recip;
        }
        else {
            current_to_line_recip_hdg_dif = active_line.bearing_recip - current_pos.heading;
        }

        if (current_to_line_recip_hdg_dif > 180) { // Get recip if took long way around compass rose
            current_to_line_recip_hdg_dif -= 360;
        }
        // Fix Negative issues
        if (current_to_line_recip_hdg_dif < 0) {
            current_to_line_recip_hdg_dif = current_to_line_recip_hdg_dif * -1;
            recip = true;
        }

        console.log("Difference = ", current_to_line_hdg_dif);
        console.log("RECIP Difference = ", current_to_line_recip_hdg_dif);

        // Closer to normal heading
        if (current_to_line_hdg_dif < current_to_line_recip_hdg_dif) {
            if (current_to_line_hdg_dif < tolerance) {  // Within tolerance
                return [active_line, false]
            }
        }

        // Closer to recip heading
        if (current_to_line_recip_hdg_dif < current_to_line_hdg_dif) {
            if (current_to_line_recip_hdg_dif < tolerance) {    // Within tolerance
                return [active_line, recip]
            }
        }

        if (current_to_line_hdg_dif > tolerance || current_to_line_recip_hdg_dif > tolerance) { // Outside tolerance
            return [null, null];
        }

        else {  // Catch all in case nothing alligned 
            return [null, null]
        }
    }
}



function GetBearing(point_a, point_b) {
    var brng, dLon, lat1, lat2, lon1, lon2, x, y;
    lat1 = Number.parseFloat(point_a[0]);
    lon1 = Number.parseFloat(point_a[1]);
    lat2 = Number.parseFloat(point_b[0]);
    lon2 = Number.parseFloat(point_b[1]);
    dLon = lon2 - lon1;
    x = Math.cos((lat2 * Math.PI) / 180) * Math.sin((dLon * Math.PI) / 180);
    y = Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) - Math.sin((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.cos((dLon * Math.PI) / 180);
    brng = Math.atan2(x, y);
    brng = brng * 180 / Math.PI;

    if (brng < 0) {
        brng = (-360 - brng) * -1 // Same as value %= 360
    }
    return brng;
}


// Get X track of all lines. Closest line is current line
function GetXTrack(current_pos, a_b_bearing, fromm, to) {
    let relative_intercept_bearing = a_b_bearing - 90
    if (relative_intercept_bearing < 0) {
        relative_intercept_bearing = (-360 - relative_intercept_bearing) * -1 // Same as value %= 360
    }

    let new_line_end = AdjustVectorEnd(current_pos, relative_intercept_bearing, 1)
    let desired_line = line(fromm, to)
    let check_line = line(current_pos, new_line_end)

    let intercept_point = intersection(desired_line, check_line)

    let x_track = Haversine(current_pos, intercept_point)

    let right_or_left = GetBearing(current_pos, to)
    right_or_left = right_or_left - a_b_bearing
    if (right_or_left < 0) {
        right_or_left = (-360 - right_or_left) * -1 // Same as value %= 360
    }

    if (right_or_left > 180) { // Give negative x_track if on left side (Helps with cdi left/right logic)
        x_track = x_track * -1
    }
    return x_track
}

function AdjustVectorEnd(particle_pos, direction, magnatude) {
    let line_end = VectorToCartesian(magnatude, direction)
    line_end[0] += particle_pos[0] // Adjust for starting point
    line_end[1] += particle_pos[1]
    return line_end;
}

function VectorToCartesian(magnatude, direction) {
    let x = magnatude * Math.cos((direction * Math.PI) / 180.0)
    let y = magnatude * Math.sin((direction * Math.PI) / 180.0)
    return [x, y]
}

function line(p1, p2) {
    let A = (p1[1] - p2[1])
    let B = (p2[0] - p1[0])
    let C = (p1[0] * p2[1] - p2[0] * p1[1])
    return [A, B, -C]
}

function intersection(L1, L2) {
    let D = L1[0] * L2[1] - L1[1] * L2[0]
    let Dx = L1[2] * L2[1] - L1[1] * L2[2]
    let Dy = L1[0] * L2[2] - L1[2] * L2[0]
    if (D != 0) {
        let x = Dx / D
        let y = Dy / D
        return [x, y]
    }
    else {
        return False
    }
}


/////////// HAVERSINE ///////////////
function Haversine(a, b) { // https://stackoverflow.com/questions/18883601/function-to-calculate-distance-between-two-coordinates 
    let lat1 = a[0];
    let lon1 = a[1];

    let lat2 = b[0];
    let lon2 = b[1];

    // var R = 6371; // km
    var R = 3963; // mile
    var dLat = toRad(lat2 - lat1);
    var dLon = toRad(lon2 - lon1);
    lat1 = toRad(lat1);
    lat2 = toRad(lat2);

    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;

    // Converts numeric degrees to radians
    function toRad(Value) {
        return Value * Math.PI / 180;
    }
}