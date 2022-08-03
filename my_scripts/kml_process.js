// 5-1-22
// 5-3-22
// 5-5-22

let my_data;
let lines_data = [];


function KmlsToArray(kml_files_to_textify) {    
    kml_files_to_textify.forEach(kml_file => {
        // console.log("Loading: ", kml_file)
        ReadKmlFile(kml_file);  // Turn kml files to text
    });

    return lines_data;  // Return all the work from this stupid js file
}


function KmlTextToObjects(kml_text) {     // Function takes kml text and parses to objects then adds to lines_data array

    parser = new DOMParser();
   
    xmlDoc = parser.parseFromString(kml_text, "text/xml");
    let number_of_lines = xmlDoc.getElementsByTagName("Document")[0].getElementsByTagName("Folder").length;

    if (number_of_lines > 1) {
        for (let i = 0; i < number_of_lines; i++) { // Seperate into multi-dementional array of points defining each line 
            let item = xmlDoc.getElementsByTagName("Document")[0].getElementsByTagName("Folder")[i];
            let run_name = item.getElementsByTagName("name")[0].textContent
            let placemark_data = item.getElementsByTagName("Placemark")[0];
            let line_string = placemark_data.getElementsByTagName("LineString")[0];
            let coords = line_string.getElementsByTagName("coordinates")[0].textContent;

            coords = coords.trim();
            let line_ends = coords.split(" ");
            // lines_data.push([run_name, line_ends[0], line_ends[1]])

            lines_data.push(SplitCoordinateData([run_name, line_ends[0], line_ends[1]]));
        }
    }


    else {
        let item = xmlDoc.getElementsByTagName("Document")[0];
        let placemark_data = item.getElementsByTagName("Placemark")[0];
        let line_string = placemark_data.getElementsByTagName("LineString")[0];
        let coords = line_string.getElementsByTagName("coordinates")[0].textContent;
        coords = coords.trim();
        let line_ends = coords.split(" ");

        lines_data.push(SplitCoordinateData(["Single Line", line_ends[0], line_ends[1]]));
        // console.log(lines_data)
    }

}



function ReadKmlFile(file) {
    fetch(file)
        .then(response => response.text())
        .then(text => Do(text))
    // outputs the content of the text file

    function Do(my_text) {
        my_data = my_text;
        if (my_data != "") {
            KmlTextToObjects(my_data);   // Send kml text to function 
        }
    }
}



function SplitCoordinateData(line) {
    let line_object = {}

    line_object.line_name = line[0];

    line_object.lat1 = line[1].split(",")[1];
    line_object.lon1 = line[1].split(",")[0];
    line_object.lat2 = line[2].split(",")[1];
    line_object.lon2 = line[2].split(",")[0];

    line_object.altitude = line[1].split(",")[2];
    line_object.altitude_feet = line_object.altitude * 3.281;

    line_object.point_a = [line_object.lat1, line_object.lon1];
    line_object.point_b = [line_object.lat2, line_object.lon2];

    return line_object;
}