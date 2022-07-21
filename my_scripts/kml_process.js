// 5-1-22
// 5-3-22
// 5-5-22



function KmlToArray(file_paths) {
    let lines_data = [];


    file_paths.forEach(kml_file => {




        readTextFile(kml_file)

        parser = new DOMParser();
        xmlDoc = parser.parseFromString(demo_data, "text/xml");
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


        function readTextFile(file) {
            var rawFile = new XMLHttpRequest();
            rawFile.open("GET", file, false);
            rawFile.onreadystatechange = function () {
                if (rawFile.readyState === 4) {
                    if (rawFile.status === 200 || rawFile.status == 0) {
                        var allText = rawFile.responseText;
                        // alert(allText);
                        demo_data = allText;
                    }
                }
            }
            rawFile.send(null);
        }

    });

    return lines_data;
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