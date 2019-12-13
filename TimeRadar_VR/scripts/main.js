var container, camera, scene, renderer_css3d, effect, clock, controls;
var raycaster, mouse, pointer;
var cameraHolder;

var json;
var hostObj = {};
var timeObj = {};

// selected
var selectedTimestamp = 1;

var ROOM_SIZE = 1;
var RACK_NUM = 10;
var HOST_NUM = 60;
var CPU_NUM = 2;
var TS_NUM;
var INTERSECTED;
var CP_SPEED = 0.01;

var color, opa;
var arrColor = ['#110066','#4400ff', '#00cccc', '#00dd00','#ffcc44', '#ff0000', '#660000'];
// var arrDom;
var isInit = true;
var fillHost;
var updateTimestamp;
var move_timer;

var SERVICE = { arrTemperature__1: { key: "arrTemperature__1", value: "Temperature1", dom: [0,98], sp_pos: 5 },
                arrTemperature__2: { key: "arrTemperature__2", value: "Temperature2", dom: [0,98], sp_pos: 6 },
                arrCPU_load: { key: "arrCPU_load", value: "CPU_load", dom: [0,10], sp_pos: 0 },
                arrMemory_usage: { key: "arrMemory_usage", value: "Memory_usage", dom: [0,99], sp_pos: 3 },
                arrFans_health__1: { key: "arrFans_health__1", value: "Fans_speed1", dom: [1050,17850], sp_pos: 1 },
                arrFans_health__2: { key: "arrFans_health__2", value: "Fans_speed2", dom: [1050,17850], sp_pos: 2 },
                arrPower_usage: { key: "arrPower_usage", value: "Power_usage", dom: [0,200], sp_pos: 4 },
            };

var SCORE = { outlyingScore: 0.4,
                clumpyScore: 0,
                convexScore: 0,
                monotonicScore: 0,
                skewedScore: 0,
                skinnyScore: 0,
                sparseScore: 0,
                striatedScore: 0,
                stringyScore: 0
            };


var niceOffset = false;

// D3
var oldhostclicked;
var svg;
var rectip;
var maxstack = 7;

var quanah;
var cpu_marker;
var tooltip;
var service_control_panel;
var time_control_panel;
var score_control_panel;
var timeradar_zone;
var scatter_plot_matrix;
var foo;
var parallel_set;
var lever;
var FONT = 'media/fonts/helvetiker_regular.typeface.json';

// HPCC
var hosts = [];
var hostResults = {};
var links =[];
var node,link;

var simulation, link, node;
var dur = 400;  // animation duration
var startDate = new Date("4/1/2018");
var endtDate = new Date("1/1/2019");
var today = new Date();

var maxHostinRack= 60;
var h_rack = 950;
var width = 200;
var w_rack = (width-23)/10-1;
var w_gap =0;
var node_size = 6;
var sHeight=200;  // Summary panel height
var top_margin = sHeight+80;  // Start rack spiatial layout


var users = [];
var racks = [];

var xTimeScale;
var baseTemperature = 60;

var interval2;
var simDuration = 1;
var numberOfMinutes = 6*60;
var isRealtime = false;
if (isRealtime){
    simDuration = 1000;
    numberOfMinutes = 6*60;
}

var charType = "Heatmap";
var undefinedValue = undefined;
//***********************
let iterationstep = 1;
let cluster_info;
let clustercalWorker;
let distance;
var thresholds = [[3,98], [0,10], [0,99], [1050,17850],[0,200] ];
var initialService = "Temperature";
var selectedService = "arrTemperature__1";
var arrThresholds
serviceList.pop()
// let processResult = processResult_old;
var isScagnostic = false;

// Controls
var objects = [];
var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var canJump = false;
var prevTime = performance.now();
var velocity = new THREE.Vector3();
var direction = new THREE.Vector3();

init();

function init()
{
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    initD3();
    loadJSON(function(){
        TS_NUM = json["compute-1-1"]["arrCPU_load"].length;

        initScene();
        initCamera();
        initLight();
        initInteractions();

        initRoom();
        initControlPanel();
        initQuanah();
        initParallelSet();
        initTimeRadar();

        if(isScagnostic)
            initScatterPlotMatrix();

        window.addEventListener( 'mousedown', onMouseDown, false );
        window.addEventListener( 'touchstart', onDocTouch, false );
        window.addEventListener( 'touchend', onDocRelease, false );
        window.addEventListener( 'mousemove', onMouseMove, false );
        animate();
    });

}

function loadJSON(calback)
{
    srcpath = "../HiperView/"
    d3.json(srcpath+'data/hotslist_Quanah.json').then(function(data){
        hostList = data;
        inithostResults();
        let choice = "influxdbSat27Apr";

        if (choice.includes('influxdb')) {
            db = "influxdb";
            realTimesetting(false, "influxdb", true);
        } else {
            db = "nagios";
            realTimesetting(false, undefined, true);
        }
        d3.json(srcpath+"data/" + choice + ".json").then(function (data) {
            d3.json(srcpath + "data/" + choice + "_removemetric_job_compact.json").then(function (job) {
                loadata(data, job);
            }).catch(err => loadata(data, undefined));
        })
        function loadata(data,job){
            data['timespan'] = data.timespan.map(d=>new Date(d3.timeFormat('%a %b %d %X CDT %Y')(new Date(d.replace('Z','')))));
            sampleS = data;
            sampleJobdata = job || [];
            json = {};
            recalculateCluster( {clusterMethod: 'leaderbin',normMethod:'l2',bin:{startBinGridSize: 4,range: [9,10]}},function(){
                cluster_info.forEach(d=>(d.arr=[],d.__metrics.forEach(e=>(e.minval=undefined,e.maxval=undefined))));
                hosts.forEach(h=>{
                    json[h.name] = {};
                    sampleS[h.name].arrcluster = sampleS.timespan.map((t,i)=>{
                        serviceLists.map(a=> ((sampleS[h.name][serviceListattr[a.id]]||[])[i]||d3.range(0,a.sub.length).map(v=>null)).map((v,vi)=>
                        {
                            var value = v===null?undefined:v;
                            if(!json[h.name][serviceListattr[a.id]]) {
                                json[h.name][serviceListattr[a.id]] = [];
                                hostResults[h.name][serviceListattr[a.id]] = [];
                            }if(!json[h.name][serviceListattr[a.id]][i]) {
                                json[h.name][serviceListattr[a.id]][i] = [];
                                hostResults[h.name][serviceListattr[a.id]][i] = [];
                            }
                            json[h.name][serviceListattr[a.id]][i][vi] = value;
                            hostResults[h.name][serviceListattr[a.id]][i][vi] = value;
                            return  d3.scaleLinear().domain(a.sub[0].range)(value)||0;
                        }));
                        let axis_arr = _.flatten(serviceLists.map(a=> ((sampleS[h.name][serviceListattr[a.id]]||[])[i]||d3.range(0,a.sub.length).map(v=>null)).map(v=> d3.scaleLinear().domain(a.sub[0].range)(v===null?undefined:v)||0)));
                        let index = 0;
                        let minval = Infinity;
                        cluster_info.forEach((c,i)=>{
                            const val = distance(c.__metrics.normalize,axis_arr);
                            if(minval>val){
                                index = i;
                                minval = val;
                            }
                        });
                        cluster_info[index].total = 1 + cluster_info[index].total||0;
                        cluster_info[index].__metrics.forEach((m,i)=>{
                            if (m.minval===undefined|| m.minval>axis_arr[i])
                                m.minval = axis_arr[i];
                            if (m.maxval===undefined|| m.maxval<axis_arr[i])
                                m.maxval = axis_arr[i];
                        });
                        return index;
                        // return cluster_info.findIndex(c=>distance(c.__metrics.normalize,axis_arr)<=c.radius);
                    })
                });
                cluster_info.forEach(c=>c.mse = ss.sum(c.__metrics.map(e=>(e.maxval-e.minval)*(e.maxval-e.minval))));
                // loading data
                hosts.forEach(h=> {
                    // Compute RACK list
                    var rackIndex = isContainRack(racks, h.hpcc_rack);
                    if (rackIndex >= 0) {  // found the user in the users list
                        racks[rackIndex].hosts.push(h);
                    }
                    else {
                        var obj = {};
                        obj.id = h.hpcc_rack;
                        obj.hosts = [];
                        obj.hosts.push(h);
                        racks.push(obj);
                    }
                    // Sort RACK list
                    racks = racks.sort(function (a, b) {
                        if (a.id > b.id) {
                            return 1;
                        }
                        else return -1;
                    })
                })

                for (var i = 0; i < racks.length; i++)
                {
                    racks[i].hosts.sort(function (a, b) {
                        if (a.hpcc_node > b.hpcc_node) {
                            return 1;
                        }
                        else return -1;
                    })

                }
                calback();
            });
        }
    });
}

// INITS

function initD3()
{
    svg = d3.select("#svgplace").append("svg").attr("width", 2).attr("height",2);
    rectip = svg.append('rect').attr('id','placetip').attr('x',0).attr('y',0).attr('width',2).attr('height',2)
        .style('opacity',0)
        .on("click",function(d,i){
            mouseoverNode(d)});
}

function initCamera()
{
    cameraHolder = document.querySelector('a-entity').object3D;
    cameraHolder.name = "cameraHolder";

    document.querySelector('a-camera').object3D.name = "hppc_camera_group";
    camera = document.querySelector('a-camera').object3D.children[1];
    camera.type = "hpcc_camera"
    camera.name = "camera";

    pointer = camera.el.lastElementChild.object3D.children[0];

    pointer.material.depthTest = false;
    pointer.name = "pointer";
}

function initScene()
{
    scene = document.querySelector('a-scene').object3D;
    scene.name = "hpcc";
}

function initLight()
{
    var light1 = document.getElementById("light1").object3D;
    var light2 = document.getElementById("light2").object3D;
    var light3 = document.getElementById("light3").object3D;

    var height = ROOM_SIZE*2;

    light1.position.set( ROOM_SIZE*-1, ROOM_SIZE, ROOM_SIZE );
    light2.position.set( ROOM_SIZE*3, ROOM_SIZE, ROOM_SIZE );
    light3.position.set( ROOM_SIZE*7, ROOM_SIZE, ROOM_SIZE );
    
}

function initInteractions()
{
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
}

function initRoom()
{
    var height = ROOM_SIZE * 2.5;
    var width = ROOM_SIZE * 12;
    var depth = ROOM_SIZE * 4;
    var geometry = new THREE.BoxGeometry( width, height, depth );

    var textures = ["whiteblockwall","whiteblockwall","whiteceiling","silvermetalmeshfloor","whiteblockwall","whiteblockwall"];
    
    var repeats = [ [width,height],
                    [width,height],
                    [width*2,width],
                    [width*2,width],
                    [width*2,height],
                    [width*2,height]];

    var materials = [null,null,null,null,null,null];

    for( var i=0; i<6; i++ )
    {
        var texture = new THREE.TextureLoader().load( "media/textures/" + textures[i] + ".jpg" );
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(repeats[i][0],repeats[i][1]);
        materials[i] = new THREE.MeshPhongMaterial( { color: 0xffffff, side: THREE.BackSide, map: texture } );
    }

    var room = new THREE.Mesh( geometry, materials );
    room.position.set( ROOM_SIZE*3, ROOM_SIZE/1.25, ROOM_SIZE );
    room.name = "hpcc_room";
    room.type = "room";
    scene.add( room );

    initLever();
}

function initLever()
{
    lever = new THREE.Group();
    lever.name = "hpcc_lever";

    // lever case
    var back_geometry = new THREE.BoxGeometry( ROOM_SIZE/20, ROOM_SIZE/10, ROOM_SIZE/80 );
    var back_material = new THREE.MeshPhongMaterial( { color: 0x555555 } );
    var back = new THREE.Mesh( back_geometry, back_material );
    back.name = "lever-case";
    lever.add( back );

    // rotation pivot
    var pivot = new THREE.Object3D();
    pivot.name = "lever-pivot";

    // lever tube
    var tube_geometry = new THREE.CylinderGeometry( ROOM_SIZE/200, ROOM_SIZE/200, ROOM_SIZE/15, 16 );
    var tube_material = new THREE.MeshPhongMaterial( { color: 0xaaaaaa } );
    var tube = new THREE.Mesh( tube_geometry, tube_material );
    tube.name = "lever-tube";
    tube.position.set( 0, 0, ROOM_SIZE/30 );
    tube.rotation.set( Math.PI/2, 0, 0 );
    pivot.add( tube );

    // lever handle
    var handle_geometry = new THREE.SphereGeometry( ROOM_SIZE/70, 16, 16 );
    var handle_material = new THREE.MeshPhongMaterial( { color: 0xff0000 } );
    var handle = new THREE.Mesh( handle_geometry, handle_material );
    handle.position.set( 0, 0, ROOM_SIZE/15 );
    handle.name = "lever-handle";
    pivot.add( handle );

    addLeverLabel( "Scatter Plot", ROOM_SIZE/10, lever );
    addLeverLabel( "Parallel Set", ROOM_SIZE/-8, lever );


    // set rotation and position
    lever.add( pivot );
    lever.pivot = pivot;
    pivot.rotation.set( Math.PI/-4, 0, 0 );
    lever.position.set( ROOM_SIZE * 4.75, ROOM_SIZE / 10, ROOM_SIZE*-1 );
    scene.add( lever );

    function addLeverLabel( text, y, obj )
    {
        var loader = new THREE.FontLoader();
        var material_text = new THREE.MeshBasicMaterial( { color: 0x000000 } );

        loader.load( 'media/fonts/helvetiker_regular.typeface.json', function ( font ) {

            var geometry = new THREE.TextGeometry( text, {
                font: font,
                size: ROOM_SIZE/30,
                height: 0,
                curveSegments: 12,
                bevelEnabled: false
            } );

            var textMesh = new THREE.Mesh( geometry, material_text );
            textMesh.position.set( ROOM_SIZE/-9, y, ROOM_SIZE/100 );
            textMesh.name = "lever-label-"+text;
            obj.add( textMesh );
        } );

    }

}

function initHPCC()
{
    for (var att in hostList.data.hostlist)
    {
        var h = {};
        h.name = att;
        h.hpcc_rack = +att.split("-")[1];
        h.hpcc_node = +att.split("-")[2].split(".")[0];
        h.index = hosts.length;

        // to contain the historical query results
        hostResults[h.name] = {};
        hostResults[h.name].index = h.index;
        hostResults[h.name].arr = [];
        hostResults[h.name].arrTemperature = [];  
        hostResults[h.name].arrCPU_load = [];
        hostResults[h.name].arrMemory_usage = [];
        hostResults[h.name].arrFans_health= [];
        hostResults[h.name].arrPower_usage= [];
        hosts.push(h);
        // console.log(att+" "+h.hpcc_rack+" "+h.hpcc_node);

        // Compute RACK list
        var rackIndex = isContainRack(racks, h.hpcc_rack);
        if (rackIndex >= 0) {  // found the user in the users list
            racks[rackIndex].hosts.push(h);
        }
        else {
            var obj = {};
            obj.id = h.hpcc_rack;
            obj.hosts = [];
            obj.hosts.push(h);
            racks.push(obj);
        }
        // Sort RACK list
        racks = racks.sort(function (a, b) {
            if (a.id > b.id) {
                return 1;
            }
            else return -1;
        })
    }

    for (var i = 0; i < racks.length; i++) {
        racks[i].hosts.sort(function (a, b) {
            if (a.hpcc_node > b.hpcc_node) {
                return 1;
            }
            else return -1;
        })

    }

    hosts.sort(function (a, b) {
        if (a.hpcc_rack*1000+a.hpcc_node > b.hpcc_rack*1000+b.hpcc_node) {
            return 1;
        }
        else return -1;
    });

    function isContainRack(array, id)
    {
        var foundIndex = -1;
        for(var i = 0; i < array.length; i++) {
            if (array[i].id == id) {
                foundIndex = i;
                break;
            }
        }
        return foundIndex;
    }
}

function initTimeRadar() {
    let presetPosition = {}
    scene.updateMatrixWorld();
    for (let r in hostObj)
    {
        for (let h in hostObj[r])
        {
            presetPosition[`compute-${r}-${h}`] = hostObj[r][h][1].matrixWorld;
        }
    }
    console.log(presetPosition)
    timeradar_zone = new TimeRadar3D();
    timeradar_zone.graphicopt({width: ROOM_SIZE,height:ROOM_SIZE,deep:ROOM_SIZE,presetPosition:presetPosition}).init(hosts)
}

function initScatterPlotMatrix()
{
    var hostkeys = Object.keys(json);
    var datas = [], s, ranges = [], selectedSPServices = [], datakeys = [];
    var element = Object.keys( SERVICE );
    // element.pop();
    // element.pop();
    // element.pop();
    // element.pop();

    var slist = [];

    for( x in element )
    {
        for( y in element )
        {
            for( z in element )
            {
                var s = [ element[x], element[y], element[z] ].sort();

                if( isRepeated( s, slist ) )
                    continue;
                else
                    slist.push( s.toString() );

                selectedSPServices.push(s);
                var data = [];
                var datakey = {};

                for( var h=0; h<hostkeys.length; h++ )
                {
                    datakey[hostkeys[h]] = h;
                    data.push( [0,0,0] );
                }

                datakeys.push( datakey );
                datas.push( data );
                ranges.push([SERVICE[s[0]]["dom"],
                            SERVICE[s[1]]["dom"],
                            SERVICE[s[2]]["dom"]] );
            }
        }
    }

    // building scatter plot matrix ----------------------------------------------------
    scatter_plot_matrix = new ScatterPlotMatrix( selectedSPServices, ranges, 6, hostkeys, datas, 0.25, false, datakeys );
    scatter_plot_matrix.graph.position.set( ROOM_SIZE * 7, ROOM_SIZE * -0.9, ROOM_SIZE * 2.99 );
    scatter_plot_matrix.graph.rotation.set( 0, Math.PI, 0 );
    scene.add( scatter_plot_matrix.graph );
    scatter_plot_matrix.graph.visible = true;

    function isRepeated( a, A )
    {
        if( a[0] == a[1] | a[0] == a[2] | a[1] == a[2] )
            return true;

        a = a.toString();
        for( var r=0; r<A.length; r++ )
        {
            if( a == A[r] )
                return true;
        }
        return false;
    }
}

function initParallelSet()
{
    var table = [Object.keys(SERVICE)];
    var tmp = [];

    // building data
    for( var host in json )
    {
        tmp = [];
        for( var s=0; s<table[0].length; s++ )
        {
            if( json[host][table[0][s]] )
                tmp.push(json[host][table[0][s]][0]);
            else
                tmp.push(undefined);
        }
        table.push(tmp);
    }

    parallel_set = new ParallelSet( 0.25, FONT, table, "arrTemperature__1", [], table[0] );
    parallel_set.graph.position.set( ROOM_SIZE * 4.75, -0.15, -0.65 );
    parallel_set.graph.rotation.set( 0, -Math.PI/2, 0 );
    scene.add( parallel_set.graph );
    parallel_set.graph.visible = false;
}

// Extra

function geAllIdsByName( parent, name )
{
    var match = [];
    for( var c=0; c<parent.children.length; c++ )
        if( parent.children[c].name == name )
            match.push(parent.children[c].id);

    return match;
}

// Animate & Render

function animate()
{
    requestAnimationFrame( animate );
    animateControlPanel();
    animateTooltip();
}

function render()
{
    renderer_css3d.render( scene, camera );
}

function realTimesetting (option,db,init,data){
    isRealtime = option;
    if (option){
        processData = eval('processData_'+db);
        simDuration = 200;
        simDurationinit = 200;
        numberOfMinutes = 26*60;
    }else{
        processData = db?eval('processData_'+db):processData_old;
        simDuration =0;
        simDurationinit = 0;
        numberOfMinutes = 26*60;
    }
}

function recalculateCluster (option,calback) {
    group_opt = option;
    distance = group_opt.normMethod==='l1'?distanceL1:distanceL2
    if (clustercalWorker)
        clustercalWorker.terminate();
    clustercalWorker = new Worker ('../TimeRadar/src/script/worker/clustercal.js');
    clustercalWorker.postMessage({
        binopt:group_opt,
        sampleS:sampleS,
        hosts:hosts,
        serviceFullList: serviceFullList,
        serviceLists:serviceLists,
        serviceList_selected:serviceList_selected,
        serviceListattr:serviceListattr
    });
    clustercalWorker.addEventListener('message',({data})=>{
        if (data.action==='done') {
            cluster_info = data.result;
            clusterDescription = {};
            recomendName (cluster_info);
            recomendColor (cluster_info);
            if (!calback) {
                // handle_clusterinfo();
            }
            clustercalWorker.terminate();
            if (calback)
                calback();
        }
    }, false);

}