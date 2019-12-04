var application_name ='Joblist';
var jobList=[];
var cluster_info,clusterDescription;
var hostList;
var serviceList = ["Temperature","Memory_usage","Fans_speed","Power_consum","Job_scheduling"];
var serviceList_selected = [{"text":"Temperature","index":0},{"text":"Memory_usage","index":1},{"text":"Fans_speed","index":2},{"text":"Power_consum","index":3}];

var serviceListattr = ["arrTemperature","arrMemory_usage","arrFans_health","arrPower_usage","arrJob_scheduling"];
var serviceLists = [{"text":"Temperature","id":0,"enable":true,"sub":[{"text":"CPU1 Temp","id":0,"enable":true,"idroot":0,"angle":5.585053606381854,"range":[3,98]},{"text":"CPU2 Temp","id":1,"enable":true,"idroot":0,"angle":0,"range":[3,98]},{"text":"Inlet Temp","id":2,"enable":true,"idroot":0,"angle":0.6981317007977318,"range":[3,98]}]},{"text":"Memory_usage","id":1,"enable":true,"sub":[{"text":"Memory usage","id":0,"enable":true,"idroot":1,"angle":1.5707963267948966,"range":[0,99]}]},{"text":"Fans_speed","id":2,"enable":true,"sub":[{"text":"Fan1 speed","id":0,"enable":true,"idroot":2,"angle":2.4870941840919194,"range":[1050,17850]},{"text":"Fan2 speed","id":1,"enable":true,"idroot":2,"angle":2.923426497090502,"range":[1050,17850]},{"text":"Fan3 speed","id":2,"enable":true,"idroot":2,"angle":3.3597588100890845,"range":[1050,17850]},{"text":"Fan4 speed","id":3,"enable":true,"idroot":2,"angle":3.796091123087667,"range":[1050,17850]}]},{"text":"Power_consum","id":3,"enable":true,"sub":[{"text":"Power consumption","id":0,"enable":true,"idroot":3,"angle":4.71238898038469,"range":[0,200]}]}];
var serviceLists_or = [{"text":"Temperature","id":0,"enable":true,"sub":[{"text":"CPU1 Temp","id":0,"enable":true,"idroot":0,"angle":5.585053606381854,"range":[3,98]},{"text":"CPU2 Temp","id":1,"enable":true,"idroot":0,"angle":0,"range":[3,98]},{"text":"Inlet Temp","id":2,"enable":true,"idroot":0,"angle":0.6981317007977318,"range":[3,98]}]},{"text":"Memory_usage","id":1,"enable":true,"sub":[{"text":"Memory usage","id":0,"enable":true,"idroot":1,"angle":1.5707963267948966,"range":[0,99]}]},{"text":"Fans_speed","id":2,"enable":true,"sub":[{"text":"Fan1 speed","id":0,"enable":true,"idroot":2,"angle":2.4870941840919194,"range":[1050,17850]},{"text":"Fan2 speed","id":1,"enable":true,"idroot":2,"angle":2.923426497090502,"range":[1050,17850]},{"text":"Fan3 speed","id":2,"enable":true,"idroot":2,"angle":3.3597588100890845,"range":[1050,17850]},{"text":"Fan4 speed","id":3,"enable":true,"idroot":2,"angle":3.796091123087667,"range":[1050,17850]}]},{"text":"Power_consum","id":3,"enable":true,"sub":[{"text":"Power consumption","id":0,"enable":true,"idroot":3,"angle":4.71238898038469,"range":[0,200]}]}];
var serviceFullList = serviceLists2serviceFullList(serviceLists);

srcpath = '../HiperView/';


let jobMap_opt = {
    margin:{top:50,bottom:20,left:50,right:20},
    width: 1000,
    height:500,
    node:{
        r: 5,
    },
    job: {
        r: 10,
        r_inside: 2,
    },user:{
        r: 10,
    },
    radaropt : {
        // summary:{quantile:true},
        mini:true,
        levels:6,
        gradient:true,
        w:40,
        h:40,
        showText:false,
        margin: {top: 0, right: 0, bottom: 0, left: 0},
    },
}
let jobMap_runopt = {
    compute:{type:'radar',clusterJobID:true,clusterJobID_info:{groupBy:1800000},clusterNode:true,},
    graphic:{colorBy:'group'},
    histodram:{resolution:11},
    mouse:{auto:true, lensing: false}
}
function zoomtoogle(event) {
    let oldvval = d3.select(event).classed('lock');
    jobMap.zoomtoogle(!oldvval);
    d3.select(event).classed('lock',!oldvval);
}
function distance(a, b){
    let dsum = 0;
    a.forEach((d,i)=> {dsum +=(d-b[i])*(d-b[i])});
    return Math.round(Math.sqrt(dsum)*Math.pow(10, 10))/Math.pow(10, 10);
}
function getClusterName (name,index){
    return (sampleS[name].arrcluster||[])[index];
}
function islastimestep(index){
    if(isRealtime)
        return false;
    else
        return index>sampleS.timespan.length-1;
}

// overide getjoblist
function getJoblist (iteration,reset){
    try {
        iteration = iteration||lastIndex
        if (reset===true || reset===undefined)
            jobList = [];
        jobList = sampleJobdata.filter(s=>new Date(s.startTime)<sampleS.timespan[iteration]&&(s.endTime?new Date(s.endTime)>sampleS.timespan[iteration]:true));
        //draw userlist data
        TSneplot.drawUserlist(query_time);
    }catch(e){}
}
function current_userData () {
    let jobByuser = d3.nest().key(function(uD){return uD.user}).entries( jobList);
    jobByuser.forEach(d=>d.unqinode= _.chain(d.values).map(d=>d.nodes).flatten().uniq().value());
    return jobByuser;
}
function systemFormat() {
    jobList=[];
    serviceList = ["Temperature","Memory_usage","Fans_speed","Power_consum","Job_scheduling"];
    serviceList_selected = [{"text":"Temperature","index":0},{"text":"Memory_usage","index":1},{"text":"Fans_speed","index":2},{"text":"Power_consum","index":3}];

    serviceListattr = ["arrTemperature","arrMemory_usage","arrFans_health","arrPower_usage","arrJob_scheduling"];
    serviceLists = [{"text":"Temperature","id":0,"enable":true,"sub":[{"text":"CPU1 Temp","id":0,"enable":true,"idroot":0,"angle":5.585053606381854,"range":[3,98]},{"text":"CPU2 Temp","id":1,"enable":true,"idroot":0,"angle":0,"range":[3,98]},{"text":"Inlet Temp","id":2,"enable":true,"idroot":0,"angle":0.6981317007977318,"range":[3,98]}]},{"text":"Memory_usage","id":1,"enable":true,"sub":[{"text":"Memory usage","id":0,"enable":true,"idroot":1,"angle":1.5707963267948966,"range":[0,99]}]},{"text":"Fans_speed","id":2,"enable":true,"sub":[{"text":"Fan1 speed","id":0,"enable":true,"idroot":2,"angle":2.4870941840919194,"range":[1050,17850]},{"text":"Fan2 speed","id":1,"enable":true,"idroot":2,"angle":2.923426497090502,"range":[1050,17850]},{"text":"Fan3 speed","id":2,"enable":true,"idroot":2,"angle":3.3597588100890845,"range":[1050,17850]},{"text":"Fan4 speed","id":3,"enable":true,"idroot":2,"angle":3.796091123087667,"range":[1050,17850]}]},{"text":"Power_consum","id":3,"enable":true,"sub":[{"text":"Power consumption","id":0,"enable":true,"idroot":3,"angle":4.71238898038469,"range":[0,200]}]}];
    serviceFullList = serviceLists2serviceFullList(serviceLists);
    serviceListattrnest = [
        {key:"arrTemperature", sub:["CPU1 Temp","CPU2 Temp","Inlet Temp"]},
        {key:"arrMemory_usage", sub:["Memory usage"]},
        {key:"arrFans_health", sub:["Fan1 speed","Fan2 speed","Fan3 speed","Fan4 speed"]},
        {key:"arrPower_usage", sub:["Power consumption"]}];
    serviceAttr = {arrTemperature: {key: "Temperature", val: ["arrTemperatureCPU1","arrTemperatureCPU2"]},
        arrMemory_usage: {key: "Memory_usage", val: ["arrMemory_usage"]},
        arrFans_health: {key: "Fans_speed", val: ["arrFans_speed1","arrFans_speed2"]},
        arrPower_usage:{key: "Power_consumption", val: ["arrPower_usage"]}};
    thresholds = [[3,98], [0,99], [1050,17850],[0,200] ];
}

function generateDataSurvey(INS,TIMES,TASK){
    var cluster = [[44,20,5.101402755487004,9870,9870,9870,10010,90.3125,57],
        [64,17,40.01604935698356,9310,8890,9310,8890,98.75,77],
        [45,14,95.14767492756947,8890,8890,8750,8890,93.75,57],
        [27,11,3.5725451778977426,10920,10850,10920,10850,40.3125,29],
        [76,17,3.1129499551868602,10920,11060,11130,11060,97.8125,87]
    ];
    var INSTANCE = INS;
    var TIMESTEP = TIMES;
    var VARNUM = 9;
    var CLUSTERNUM = cluster.length-1;

    var ROW = TASK?TIMESTEP:INSTANCE;
    var COLLUM = TASK?INSTANCE:TIMESTEP;
    var MARK = Math.round(Math.random()*(ROW-1));
    console.log('MARK: ',MARK)
    var instance_name = d3.range(0,INSTANCE).map(d=>''+(d+1));
    var var_name = ["CPU2 Temp","Inlet Temp","Memory usage","Fan1 speed","Fan2 speed","Fan3 speed","Fan4 speed","Power consumption","CPU1 Temp"];

    var startTime = new Date('Jan 01 2019 1:00:00');
    var timescale = d3.scaleTime().domain([startTime,new Date(+startTime+60*60*1000)]).range([0,1]);

// make header
    var listheader = ['timestamp'];

// generate data
    var LOWLIMIT,HIGHLIMIT;
    switch(COLLUM) {
        case 10:
            LOWLIMIT = 3;
            HIGHLIMIT = 5;
            break;
        case 30:
            LOWLIMIT = 6;
            HIGHLIMIT = 10;
            break;
        case 50:
            LOWLIMIT = 8;
            HIGHLIMIT = 15;
            break;
        default:
            LOWLIMIT = ROW/12;
            HIGHLIMIT = ROW/6;
            break;
    }
    function ranint(n){
        return Math.round(Math.random()*n);
    }
    var matrix = d3.range(0,ROW).map((r)=>{
        var clustern = r!==MARK?ranint(LOWLIMIT):HIGHLIMIT;
        var randc = d3.range(0,clustern).map(d=>{
            return{cnum:ranint(CLUSTERNUM),pos:ranint(COLLUM-3)+1};
        }).sort((a,b)=>a.pos-b.pos);
        console.log(randc.length)
        if (r===MARK){
            do {
                var key = false;
                var old = undefined;
                randc.forEach(r => {
                    if (r.cnum===old) {
                        key=true;
                        r.cnum = cc();
                    }
                    old = r.cnum;

                    function cc() {
                        let tem = ranint(CLUSTERNUM)
                        while (tem === old)
                            tem = ranint(CLUSTERNUM)
                        return tem;
                    }
                })
                old = undefined;
                randc.forEach(r => {
                    if (r.pos===old) {
                        key = true;
                        r.pos = cc();
                    }
                    old = r.pos;

                    function cc() {
                        let tem = ranint(ranint(COLLUM - 3) + 1)
                        while (tem === old)
                            tem = ranint(ranint(COLLUM - 3) + 1)
                        return tem;
                    }
                })
                randc.sort((a, b) => a.pos - b.pos)
            }while(key)
        }else{
            randc = _.uniqBy(randc,'pos')
        }
            return randc;
    });

    if (!TASK){
        var old=[];
        matrix = d3.range(0,TIMESTEP).map(t=>d3.range(0,INSTANCE).map(i=>{
            if (!t) {
                old[i] = ranint(CLUSTERNUM);
                return old[i];
            }
            if (matrix[i][0]&&t===matrix[i][0].pos){
                old[i] = matrix[i].shift().cnum;
            }
                return old[i];
        }));
    }else{
        var old=[];
        matrix = d3.range(0,TIMESTEP).map(t=>d3.range(0,INSTANCE).map(i=>{
            if (!t) {
                old[i] = ranint(CLUSTERNUM);
                return old[i];
            }
            if (matrix[t][0]&&i===matrix[t][0].pos){
                old[i] = cc();
                function cc (){
                    let tem = ranint(CLUSTERNUM)
                    while(tem===old[i])
                        tem = ranint(CLUSTERNUM)
                    return tem;
                }
                matrix[t].shift();
            }
            return old[i];
        }));
    }

    let output = [];

    d3.range(0,TIMESTEP).forEach(t=>{
        let temp = {};
        temp[listheader[0]] = d3.isoFormat(timescale.invert(t));
        instance_name.forEach((ins,insi)=>{
            var_name.forEach((v,vi)=>{
                temp[`${ins}-${v}`] = cluster[matrix[t][insi]][vi];
            })
        })
        output.push(temp);
    });
    return output
}