// 5-3-22

function DrawIdleCdi() {
    let cdi_area = document.querySelector('#cdi_area');
    const domRect = cdi_area.getBoundingClientRect();
    console.log(domRect)

    // Draw Center Circle at center
    var center_circle = document.getElementById('center_circle');
    center_circle.setAttribute("cx", domRect.width / 2)
    center_circle.setAttribute("cy", domRect.height / 2)

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


function DrawActiveCdi(current_pos, scaling) {
    current_pos.x_track = -0.25
    console.log(current_pos)

    let domRect = document.querySelector('#cdi_area');
    const cdi_area = domRect.getBoundingClientRect();
    
    let localizer_center = cdi_area.width / 2;
    let glideslope_center = cdi_area.height / 2;

    let localizer_persent_deflection = current_pos.x_track / scaling;
    let pixels_of_deflection = localizer_persent_deflection * cdi_area.width;

    let localizer_x = pixels_of_deflection + localizer_center;
    console.log("localizer X ", localizer_x)


    // Localizer
    var localizer = document.getElementById('localizer');
    localizer.setAttribute("x1", localizer_x)
    localizer.setAttribute("y1", 0)
    localizer.setAttribute("x2", localizer_x)
    localizer.setAttribute("y2", cdi_area.height)
}