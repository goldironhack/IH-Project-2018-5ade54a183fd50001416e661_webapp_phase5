
//----------------variables globales-------------

//URL
const URLgeoReferense = "https://services5.arcgis.com/GfwWNkhOj9bNBqoJ/arcgis/rest/services/nycd/FeatureServer/0/query?where=1=1&outFields=*&outSR=4326&f=geojson"; 
const URLneighborhoodNames = "https://data.cityofnewyork.us/resource/xyye-rtrs.json";
const URLcrimes = "https://data.cityofnewyork.us/resource/qgea-i56i.json?$where=cmplnt_fr_dt=%222015-12-31T00:00:00%22";
const URLHomes = "https://data.cityofnewyork.us/resource/q3m4-ttp3.json";
//inicializacion mapa
var map;
var NY = {lat: 40.730610, lng: -73.956242};
var university = {lat: 40.729055, lng: -73.996523};
//names
var names = [];
//alojamiento
var Housings = [];
//crimenes
var crimes_list = [];
var see_crimes = false;
var heatmap;
//distritos
var bronx=false;
var brooklyn=false;
var manhattan=false;
var queens=false;
var statenIsland=false;
var criDistrict;

//----------------funciones para obtener datos de datasets-------------

function getNames(){
    //obteniendo nombres de barrios
    $.get(URLneighborhoodNames, function(data){
        console.log(URLneighborhoodNames);
        //console.log("names",data);
        for(var i =0; i<data.length; i++)
        {
            names[i] = [data[i].name, data[i].the_geom.coordinates[1], data[i].the_geom.coordinates[0]];
        }
        //console.log(names);
    })
}

function getHousing()
{
    //obteniendo datos de hospedajes
    $.get(URLHomes, function(data){
        console.log(URLHomes);
        //console.log("hous",data);
        var i = 0;
        data.forEach(function(){
            Housings[i] = [data[i].latitude, data[i].longitude, data[i].borough, data[i].project_name, data[i].street_name, data[i].house_number];
            i++;
        });
        //console.log("H",Housings);
    })
}

function getCrimes()
{
    //obteniendo datos de crimenes
    criDistrict = [0,0,0,0,0];
    $.get(URLcrimes, function(data){
        console.log(URLcrimes);
        //console.log(data);
        var i = 0;
        data.forEach(function(){
            crimes_list[i] = [data[i].latitude, data[i].longitude];
            switch(data[i].boro_nm){
                case "BRONX":
                    criDistrict[0] += 1;
                    break;
                case "BROOKLYN":
                    criDistrict[1] += 1;
                    break;
                case "MANHATTAN":
                    criDistrict[2] += 1;
                    break;
                case "QUEENS":
                    criDistrict[3] += 1;
                    break;
                case "STATEN ISLAND":
                    criDistrict[4] += 1;
                    break;
            }
            i++;
        });
        //console.log("crimeL",crimes_list);
    })
}

function getDataFromUrl(url){
    //var data = 
    $.get(url, function(data){
        //console.log("get",data);
    })
}

//----------------inicializacion mapa-------------

function initMap(){
    //creacion mapa --------
    map = new google.maps.Map(document.getElementById('mapContainer'), {
        zoom: 11,
        center: NY
    });
    //marca universidad ------- 
    var universityMark = new google.maps.Marker({
        position: university,
        map: map,
        label: "NYU",
        animation: google.maps.Animation.BOUNCE
    })
    //load Geojson
    map.data.loadGeoJson(URLgeoReferense);
    //personalizacion Geojson
    map.data.setStyle(function(feature){
        var c = (Math.random()*(-15000000));
        var stroke = 6;
        c >>>= 0;
        var b = c & 0xFF,
            g = (c & 0xFF00) >>> 8,
            r = (c & 0xFF0000) >>> 16,
            a = ( (c & 0xFF000000) >>> 24 ) / 255 ;
        if(!feature.getProperty('change'))
        {
            stroke = 2;
            color = "rgba(" + [r, g, b, a].join(",") + ")";
        }
        return {
            fillColor: color,
            strokeWeight: stroke,
            strokeColor: color
        };
    });
    //eventos del Geojson
    map.data.addListener('mouseover', function(event) {
        event.feature.setProperty('change', true);
    });
    map.data.addListener('mouseout', function(event) {
        event.feature.setProperty('change', false);
    });
    //iconos de google maps
    var iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';
    //seleccion iconos
    var iconos = {
        Housing:{
            icon: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png'
        }
    };
}

//----------------funcion de los botones-------------

(function () {
    document.getElementById("Housing").addEventListener("click", function () {
        //Creando marcas para hospedajes 
        Housings.forEach( function(Housing){
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(Housing[0],Housing[1]),
                animation: google.maps.Animation.DROP,
                label: "H",
                title: Housing[3]
            });
            var infowindow = new google.maps.InfoWindow({
                content: "street name: "+Housing[4]+", house numbre: "+ Housing[5]
            });
            marker.addListener('click', function() {
                infowindow.open(map, marker);
            });
            Housing.push(marker);
        });
        //activando-desactivando
        Housings.forEach(function(Housing){
            switch(Housing[2]){
                case "Bronx":
                    if(bronx)
                        Housing[6].setMap(map);
                    else
                        Housing[6].setMap(null);
                    break;
                case "Brooklyn":
                    if(brooklyn)
                        Housing[6].setMap(map);
                    else
                        Housing[6].setMap(null);
                    break;
                case "Manhattan":
                    if(manhattan)
                        Housing[6].setMap(map);
                    else
                        Housing[6].setMap(null);
                    break;
                case "Queens":
                    if(queens)
                        Housing[6].setMap(map);
                    else
                        Housing[6].setMap(null);
                    break;
                case "Staten Island":
                    if(statenIsland)
                        Housing[6].setMap(map);
                    else
                        Housing[6].setMap(null);
                    break;
            }
        });
    });
    
    document.getElementById("Crimes").addEventListener("click", function () {
        //Creando puntos para el mapa de calor
        var heatMapData = [];
        crimes_list.forEach(function(crime){
            if(crime[0]!==undefined && crime[1]!==undefined)
                heatMapData.push(new google.maps.LatLng(crime[0],crime[1]));
        });
        //creando mapa de calor
        heatmap = new google.maps.visualization.HeatmapLayer({
          data: heatMapData,
          opacity: 1
        });
        heatmap.setMap(map);
        //activando-desactivando
        if(see_crimes)
        {
            heatmap.setMap(null);
            see_crimes = false; 
        }
        else
        {
            heatmap.setMap(map);
            see_crimes = true; 
        }
    });
    
    document.getElementById("graficar").addEventListener("click", function () {
        graficar();
    });
})();

//----------------funciones inicializacion pagina-------------

$(document).ready( function(){
    getHousing();
    getDataFromUrl(URLgeoReferense);
    getNames();
    getCrimes();
});

//----------------funciones checkoks-------------

function chBronx(){
    bronx= !bronx;
}
function chBrooklyn(){
    brooklyn = !brooklyn;
}
function chManhattan(){
    manhattan = !manhattan;
}
function chQueens(){
    queens = !queens;
}
function chStatenIsland(){
    statenIsland = !statenIsland;
}

//----------------graficacion-------------

function graficar(){
    var crimCanvas = document.getElementById("tortaCriminal");
    Chart.defaults.global.defaultFontFamily = "Lato";
    Chart.defaults.global.defaultFontSize = 18;
    console.log(criDistrict);
    var criData = {
        labels: [
            "The Bronx",
            "Brooklyn",
            "Manhattan",
            "Queens",
            "Staten Island"
        ],
        datasets: [
            {
                data: criDistrict,
                backgroundColor: [
                    "#FF6384",
                    "#63FF84",
                    "#84FF63",
                    "#8463FF",
                    "#6384FF"
                ]
            }]
    };
    var pieChart = new Chart(crimCanvas, {
      type: 'pie',
      data: criData
    });
}
