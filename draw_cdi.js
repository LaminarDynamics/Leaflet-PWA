// 5-3-22

function DrawIdleCdi() {
    let cdi_area = document.querySelector('#cdi_area');
    const domRect = cdi_area.getBoundingClientRect();
    // console.log(domRect)

    // Draw Center Circle at center
    DrawCircleAtCenter(domRect);

    

    // Localizer
    var localizer = document.getElementById('localizer');
    localizer.setAttribute("x1", domRect.width / 2)
    localizer.setAttribute("y1", 0)
    localizer.setAttribute("x2", domRect.width / 2)
    localizer.setAttribute("y2", domRect.height)

    // GlideSlope
    var glideslope = document.getElementById('glidepath');
    glideslope.setAttribute("x1", 0)
    glideslope.setAttribute("y1", domRect.height / 2)
    glideslope.setAttribute("x2", domRect.width)
    glideslope.setAttribute("y2", domRect.height / 2)

}


function DrawCircleAtCenter(domRect) {
    // Draw Center Circle at center
    // console.log("DRawing circle")
    var center_circle = document.getElementById('center_circle');
    center_circle.setAttribute("cx", domRect.width / 2)
    center_circle.setAttribute("cy", domRect.height / 2)
}


function DrawActiveCdi(current_pos, horz_scaling, vert_scaling) {

    // console.log(current_pos)

    let domRect = document.querySelector('#cdi_area');
    const cdi_area = domRect.getBoundingClientRect();

    // Center circle
    DrawCircleAtCenter(cdi_area);
    
    let localizer_center = cdi_area.width / 2;
    let glideslope_center = cdi_area.height / 2;

    let localizer_persent_deflection = current_pos.x_track / horz_scaling;
    let glideslope_persent_deflection = current_pos.altitude_dif_feet / vert_scaling;

    let localizer_pixels_of_deflection = localizer_persent_deflection * cdi_area.width;
    let glideslope_pixels_of_deflection = glideslope_persent_deflection * cdi_area.height;


    let localizer_x = localizer_pixels_of_deflection + localizer_center;
    let glideslope_y = glideslope_pixels_of_deflection + glideslope_center;

    // console.log("localizer X ", localizer_x)
    // console.log("Glideslope Y ", glideslope_y)



    // Localizer
    var localizer = document.getElementById('localizer');
    localizer.setAttribute("x1", localizer_x)
    localizer.setAttribute("y1", 0)
    localizer.setAttribute("x2", localizer_x)
    localizer.setAttribute("y2", cdi_area.height)


    // Glideslope
    var glideslope = document.getElementById('glidepath');
    glideslope.setAttribute("x1", 0)
    glideslope.setAttribute("y1", glideslope_y)
    glideslope.setAttribute("x2", cdi_area.width)
    glideslope.setAttribute("y2", glideslope_y)
}