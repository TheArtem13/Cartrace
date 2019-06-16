$(document).ready(function () {
    //if ($('#GetSend').length > 0) {
    //    LetSubscribe(); //На странице отправки
    //}
    var platform = new H.service.Platform({
        'app_id': 'mXNkXSOwvOAspBudBSel',
        'app_code': 'VzRU91lOyH90iOPK1jA4Iw'
    });
    // Obtain the default map types from the platform object:
    var defaultLayers = platform.createDefaultLayers();

    // Instantiate (and display) a map object:
    var map = new H.Map(
        document.getElementById('mapContainer'),
        defaultLayers.normal.map,
        {
            zoom: 12,
            center: { lat: 58.0, lng: 56.2}
        });
    //document.getElementById('getTrips').addEventListener('click', GetTrips(map));
    //var elem = document.getElementById('getTrips');
    document.getElementById('getStops').addEventListener("click", function () { GetStops(map) });
    document.getElementById('getTrips').addEventListener("click", function () { GetTrips(map) });
    // Create the default UI:
    var ui = H.ui.UI.createDefault(map, defaultLayers, 'ru-RU');
    var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
    addDraggableMarker(map, behavior);
    SetBusStops(map);
    GetTraficVolumeChart();
    GetSprosChart();
    GetAnalitycsData();
});
//$(document).on('click', '#getTrips', function () {

//});
//$(document).on('click', '#getStops', function () {
    
//});
$(document).on('click', '#getAnalitycs', function () {
    $('#analitics').show('slow');
});

function SetBusStops(map) {
    $.ajax({
        type: "POST",
        url: 'Home/GetBusStops',
        data: {
        },
        success: function (data) {
            
            var arr = JSON.parse(data);
            arr.forEach(function (element) {
                //для каждой остановки нарисуем иконку на карте
                var svgMarkup = '<svg width="24" height="24" ' +
                    'xmlns="http://www.w3.org/2000/svg">' +
                    '<rect stroke="white" fill="#1b468d" x="1" y="1" width="22" ' +
                    'height="22" /><text x="12" y="18" font-size="12pt" ' +
                    'font-family="Arial" font-weight="bold" text-anchor="middle" ' +
                    'fill="white">H</text></svg>';


                // Create an icon, an object holding the latitude and longitude, and a marker:
                var icon = new H.map.Icon(svgMarkup),
                    coords = { lat: element[0], lng: element[1] },
                    marker = new H.map.Marker(coords, { icon: icon });
                
                // Add the marker to the map and center the map at the location of the marker:
                map.addObject(marker);
                map.setCenter(coords);
            });
            
        }
    });
}
function SetTrips(map) {
    $.ajax({
        type: "POST",
        url: 'Home/GetTrips',
        data: {
        },
        success: function (data) {
            var arr = JSON.parse(data);
            arr.forEach(function (element) {
                //для каждой остановки нарисуем иконку на карте
                var svgMarkup = '<svg width="24" height="24" ' +
                    'xmlns="http://www.w3.org/2000/svg">' +
                    '<rect stroke="white" fill="#' + element[0] +'" x="1" y="1" width="22" ' +
                    'height="22" /><text x="12" y="18" font-size="12pt" ' +
                    'font-family="Arial" font-weight="bold" text-anchor="middle" ' +
                    'fill="' + element[0] +'">' + element[3] +'</text></svg>';


                // Create an icon, an object holding the latitude and longitude, and a marker:
                var icon = new H.map.Icon(svgMarkup),
                    coords = { lat: element[1], lng: element[2] },
                    marker = new H.map.Marker(coords, { icon: icon });

                // Add the marker to the map and center the map at the location of the marker:
                map.addObject(marker);
                map.setCenter(coords);
            });

        }
    });
}
function addDraggableMarker(map, behavior) {

    //var marker = new H.map.Marker({ lat: 42.35805, lng: -71.0636 });
    //// Ensure that the marker can receive drag events
    //marker.draggable = true;
    //map.addObject(marker);

    // disable the default draggability of the underlying map
    // when starting to drag a marker object:
    map.addEventListener('dragstart', function (ev) {
        var target = ev.target;
        if (target instanceof H.map.Marker) {
            behavior.disable();
        }
    }, false);


    // re-enable the default draggability of the underlying map
    // when dragging has completed
    map.addEventListener('dragend', function (ev) {
        var target = ev.target;
        if (target instanceof mapsjs.map.Marker) {
            behavior.enable();
        }
    }, false);

    // Listen to the drag event and move the position of the marker
    // as necessary
    map.addEventListener('drag', function (ev) {
        var target = ev.target,
            pointer = ev.currentPointer;
        if (target instanceof mapsjs.map.Marker) {
            target.setPosition(map.screenToGeo(pointer.viewportX, pointer.viewportY));
        }
    }, false);
}
function GetStops(map) {
    var marks = map.getObjects();
    if (marks.length < 1) {
        SetBusStops(map);
    } else {
        map.removeObjects(marks);
    }
    
    //map.removeAll();
}
function GetTrips(map) {
    var marks = map.getObjects();
    map.removeObjects(marks);
    SetTrips(map);
}
function GetTraficVolumeChart() {
    var buses = [];
    //var passangers = [];
    $.ajax({
        type: "POST",
        url: 'Home/GetTrafficVolume',
        data: {
        },
        success: function (data) {
            var arr = JSON.parse(data);
            //['Shanghai', 24.2],
            //    ['Beijing', 20.8],
            //    ['Karachi', 14.9],
            //arr.forEach(function (index, value) {
            //    buses.push(value.buses);
            //    //passangers.push(value.passangers);
            //})
            Highcharts.chart('container', {
                chart: {
                    type: 'column'
                },
                title: {
                    text: 'Маршруты и загруженность'
                },
                subtitle: {
                    text: ''
                },
                xAxis: {
                    type: 'category',
                    labels: {
                        rotation: -45,
                        style: {
                            fontSize: '13px',
                            fontFamily: 'Verdana, sans-serif'
                        }
                    }
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: ''
                    }
                },
                legend: {
                    enabled: false
                },
                tooltip: {
                    pointFormat: ': <b>{point.y:.1f}</b>'
                },
                series: [{
                    name: 'Маршруты и загруженность',
                    data: arr,
                    dataLabels: {
                        enabled: true,
                        rotation: -90,
                        color: '#FFFFFF',
                        align: 'right',
                        format: '{point.y:.1f}', // one decimal
                        y: 10, // 10 pixels down from the top
                        style: {
                            fontSize: '13px',
                            fontFamily: 'Verdana, sans-serif'
                        }
                    }
                }]
            });
        }
    });
    


    
}
function GetSprosChart() {
    var buses = [];
    var spros = [];
    var provozn = [];

    $.ajax({
        type: "POST",
        url: 'Home/GetSprosVolume',
        data: {
        },
        success: function (data) {
            var arr = JSON.parse(data);
            
            //['68', 800, 1200],
            //    ['Beijing', 20.8],
            //    ['Karachi', 14.9],
            arr.forEach(function (index, value) {
                buses.push(index.bus);
                spros.push(index.spros);
                provozn.push(index.provozn);
                //passangers.push(value.passangers);
            })
            Highcharts.chart('containerSprosAnalitycs', {
                chart: {
                    zoomType: 'xy'
                },
                title: {
                    text: 'Спрос и провозная возможность городского транспорта'
                },
                subtitle: {
                    text: ''
                },
                xAxis: [{
                    //categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    //    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    categories: buses,
                    crosshair: true
                }],
                yAxis: [{ // Primary yAxis
                    labels: {
                        format: '{value}',
                        style: {
                            color: Highcharts.getOptions().colors[1]
                        }
                    },
                    title: {
                        text: '',
                        style: {
                            color: Highcharts.getOptions().colors[1]
                        }
                    }
                }, { // Secondary yAxis
                    title: {
                        text: '',
                        style: {
                            color: Highcharts.getOptions().colors[0]
                        }
                    },
                    labels: {
                        format: '{value}',
                        style: {
                            color: Highcharts.getOptions().colors[0]
                        }
                    },
                    opposite: true
                }],
                tooltip: {
                    shared: true
                },
                legend: {
                    layout: 'vertical',
                    align: 'left',
                    x: 120,
                    verticalAlign: 'top',
                    y: 100,
                    floating: true,
                    backgroundColor:
                        Highcharts.defaultOptions.legend.backgroundColor || // theme
                        'rgba(255,255,255,0.25)'
                },
                series: [{
                    name: 'Провозная способность',
                    type: 'column',
                    yAxis: 1,
                    //data: [49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4],
                    data: provozn,
                    tooltip: {
                        valueSuffix: ''
                    }

                }, {
                    name: 'Спрос',
                    type: 'spline',
                    //data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6],
                    data: spros,
                    tooltip: {
                        valueSuffix: ''
                    }
                }]
            });
        }
    });

    
}
function GetAnalitycsData() {
    $.ajax({
        type: "POST",
        url: 'Home/GetAnalitycsData',
        data: {
        },
        success: function (data) {
            $('#tableContainer').html(data);
        }
    });
}