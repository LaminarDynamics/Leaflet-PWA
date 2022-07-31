// 7-30-22


function PlayBackBtn() {
    ReadText();
    setInterval(InterateJson, 1000);
    setInterval(ShowPredictedPos, 250);
}



let file_text;
let file_counter = 0;
let fresh_json;

function ReadText() {
    fetch("kmls/back.txt")
        .then(response => response.text())
        .then(text => Do(text))
    // outputs the content of the text file
}


function Do(my_text) {
    file_text = my_text.split("\n");
    // console.log(file_text);

    // file_text.forEach(place => {
    //     fresh_json = JSON.parse(place);
    //     // console.log(fresh_json);
    // });
}


function InterateJson() {
    let current_item = JSON.parse(file_text[file_counter]);
    file_counter++;
    // console.log(current_item)
    current_pos = {
        lat: current_item.lat,
        lon: current_item.lon,
        alt: current_item.alt,
        alt_feet: current_item.alt_feet,
        speed: current_item.speed_mph / 2.237,
        speed_mph : current_item.speed_mph,
        accuracy: current_item.accuracy_feet / 3.281,
        accuracy_feet: current_item.accuracy_feet,
        heading: current_item.heading,
        // timestamp: current_item.time,
        timestamp : Date.now(),
        human_timestamp: current_item.human_timestamp,
        speed_mph: current_item.speed_mph
    }
    // console.log("Pos=====", current_pos)
}