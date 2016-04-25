Solar Map
==============
---------------------------------
Overview
--------------
Solar Map Software calculates the effective solar radiation on rooftops to aid in Solar Panel installation decision making. For the area directly surrounding the University of Arizona campus, users can select areas on the map and receive approximate dollar savings from solar panel installation. Savings is laid out by month, and by year. 

Raw radiation metadata is calculated and summed by GRASS GIS, based on the coordinates selected by the user.


Features
--------------
- Bing Maps
- Search bar to locate exact addresses
- Clear, colorful display of radiation levels by square meter
- User control over the location and size of the selected areas
- Approximate savings data laid out by month and by year


Software
--------------

**OpenLayers**
- This project utilizes OpenLayers to load, display, and render the map interface for the user. 

**Bing Maps**
- Bing Maps is used to provide an interactive, realistic satellite map, which the radiation data is overlayed onto. 

**GRASS GIS**
- GRASS GIS (Geographic Resources Analysis Support System) software runs on the server, and performs a summation on the radiation metadata within the specified area.

This software is written in Javascript, Python, HTML, and CSS.


Public Use
--------------

This software is available for free to the public at the following URL:

http://ec2-52-39-83-5.us-west-2.compute.amazonaws.com/

The data will eventually be expanded to cover the entire Tucson Basin


License
--------------

The project is licensed under the MIT license.

