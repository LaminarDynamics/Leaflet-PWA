// 5-1-22

function KmlToArray(file_path) {
        readTextFile(file_path)
       
        parser = new DOMParser();
        xmlDoc = parser.parseFromString(demo_data, "text/xml");
        let number_of_lines = xmlDoc.getElementsByTagName("Document")[0].getElementsByTagName("Folder").length;

        let lines_data = [];
        
        for (let i = 0; i < number_of_lines; i++) { // Seperate into multi-dementional array of points defining each line 
            let item = xmlDoc.getElementsByTagName("Document")[0].getElementsByTagName("Folder")[i];
            let run_name = item.getElementsByTagName("name")[0].textContent
            let placemark_data = item.getElementsByTagName("Placemark")[0];    
            let line_string = placemark_data.getElementsByTagName("LineString")[0];
            let coords = line_string.getElementsByTagName("coordinates")[0].textContent;

            coords = coords.trim();
            let line_ends = coords.split(" ");
            lines_data.push([run_name, line_ends[0], line_ends[1]])
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


        return lines_data;
}