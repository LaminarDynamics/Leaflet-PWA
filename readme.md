# Leaflet .kml Line Following Thing

This is an attempt to graphically display a map with a .kml file overlay. 

The logic code then determines which .kml the user is closest to and then gives the offset of the user from the line in the form of a graphical CDI. Ideally this will be used to keep an aircraft within the lateral scale limits of a .kml line as well as show any deviations from the altitude of the closest .kml line. 

It's written in web languages to allow it to be run on JavaScript capable devices ideally to use their built in GPS systems. 

The display currently is dynamically sized to allow for use on a variety of devices. However the dynamic sizing is creating significant issues in properly rendering the CDI and the user's current positon. 

There are MANY things to fix and add. Included is: 

* Getting the stupid thing to function without freaking out.
* Allowing the user to add selected .kml files on load.
* Wrapping it all in a PWA for better (Non-browser looking) aesthetics and better offline functionality. 

This project is an inefficient, eye hurting, brain rotting disaster. But I'm having a lot of fun. So whatever! 

C#, Python, and JavaScript naming conventions are mixed throughout. I regret nothing.

Some of the code is even commented. 

Proceed at your own risk.

The current live version of this monstrosity can be viewed [here](https://codeopossum.com/gps_new23/map.html) ~~Its not a virus this time, honest~~

![image](screenshots/scc_7-26-22.png)

Apperance as of 7-26-22