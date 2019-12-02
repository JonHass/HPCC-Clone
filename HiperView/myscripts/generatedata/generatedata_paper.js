// var cluster = [[44,20,5.101402755487004,9870,9870,9870,10010,90.3125,57],[64,17,40.01604935698356,9310,8890,9310,8890,98.75,77],[32,13,52.25733163807657,9100,9100,8960,9100,44.0625,39],[45,14,95.14767492756947,8890,8890,8750,8890,93.75,57],[48,18,41.820038768576616,12460,12390,12390,12390,95.625,58],[41,14,33.156512495570794,16800,16590,16730,16730,101.5625,49],[3,3,60.10588406944995,1050,1050,1050,1050,0,3],[27,11,3.5725451778977426,10920,10850,10920,10850,40.3125,29],[76,17,3.1129499551868602,10920,11060,11130,11060,97.8125,87]];
var cluster = [[44,20,5.101402755487004,9870,9870,9870,10010,90.3125,57],
    [64,17,40.01604935698356,9310,8890,9310,8890,98.75,77],
    [45,14,95.14767492756947,8890,8890,8750,8890,93.75,57],
    [27,11,3.5725451778977426,10920,10850,10920,10850,40.3125,29],
    [76,17,3.1129499551868602,10920,11060,11130,11060,97.8125,87]
];
var set = [30,10,50];
set.forEach(INS=>{
    set.forEach(TIMES=> {
        var INSTANCE = INS;
        var TIMESTEP = TIMES;
        var VARNUM = 9;
        var CLUSTERNUM = cluster.length-1;

        var COLLUM_MARK = Math.round(Math.random()*(TIMESTEP/5-1) +1 )*5;
        var ROW_MARK = Math.round(Math.random()*(INSTANCE-1));
        if (TIMESTEP>10)
            COLLUM_MARK = Math.round(Math.random()*(TIMESTEP/5-1) +1 )*5;
        else
            COLLUM_MARK = Math.round(Math.random()*(TIMESTEP-3)) +1;

        var instance_name = d3.range(0,INSTANCE).map(d=>'instance_'+d);
        var var_name = ["CPU2 Temp","Inlet Temp","Memory usage","Fan1 speed","Fan2 speed","Fan3 speed","Fan4 speed","Power consumption","CPU1 Temp"];

        var startTime = new Date('Jan 01 2019 1:00:00');
        var timescale = d3.scaleTime().domain([startTime,new Date(+startTime+60*60*1000)]).range([0,1]);

// make header
        var csv_header = 'timestamp,'+instance_name.map(i=>var_name.map(v=>`${i}-${v}`).join(',')).join(',');
        var csv_c = csv_header;
        var csv_r = csv_header;

// generate data
        var h_c = {};
        var h_r = {};

        instance_name.forEach(ins=>(h_c[ins]=[Math.round(Math.random()*CLUSTERNUM)],h_c[ins].clusterc=[h_c[ins][0]]));
        instance_name.forEach(ins=>(h_r[ins]=[Math.round(Math.random()*CLUSTERNUM)],h_r[ins].clusterc=[h_r[ins][0]]));

        console.log('COLLUM_MARK:'+COLLUM_MARK);
        var MINSUB = Math.min(INSTANCE,TIMESTEP);
        var LOWLIMIT_r = 0.2*INSTANCE;
        var HIGHLIMIT_r = LOWLIMIT_r +  (2+Math.random()*4);
        var timeArr=d3.range(0,TIMESTEP).map(t=>{return {clusterc:[]}});
        instance_name.forEach(ins=>{
            d3.range(0,TIMESTEP-1).forEach((t,ti_c)=>{
                var ti=ti_c+1;
                if (((Math.random()<(1/INSTANCE)&& timeArr[ti].clusterc.length<LOWLIMIT_r )||((Math.random()<(2/INSTANCE))&&ti===COLLUM_MARK&& timeArr[ti].clusterc.length<HIGHLIMIT_r))) {
                    h_c[ins][ti] = Math.round(Math.random() * CLUSTERNUM);
                    if (h_c[ins][ti]!==_.last(timeArr[ti].clusterc))
                        timeArr[ti].clusterc.push(h_c[ins][ti]);
                }else
                    h_c[ins][ti] = h_c[ins][ti-1];
            })
        });
        console.log('ROW_MARK:'+ROW_MARK);
        var LOWLIMIT_c = 0.2*TIMESTEP+1;
        var HIGHLIMIT_c = LOWLIMIT_c +  (1+Math.random()*0.2);

        instance_name.forEach((ins,insi)=>{
            d3.range(0,TIMESTEP-1).forEach((t,ti_c)=>{
                var ti=ti_c+1;
                if ((Math.random()<(2/TIMES)&& h_r[ins].clusterc.length<LOWLIMIT_c)||((Math.random()<(10/TIMES))&&insi===ROW_MARK&& h_r[ins].clusterc.length<HIGHLIMIT_c)) {
                    h_r[ins][ti] = Math.round(Math.random() * CLUSTERNUM);
                    if (h_r[ins][ti]!==_.last(h_r[ins].clusterc))
                        h_r[ins].clusterc.push(h_r[ins][ti]);
                }else
                    h_r[ins][ti] = h_r[ins][ti-1];

            })
        });

        d3.range(0,TIMESTEP).forEach(t=>{
            csv_c += '\n'+d3.isoFormat(timescale.invert(t))+','+instance_name.map(ins=>var_name.map((v,vi)=>{
                return cluster[h_c[ins][t]][vi];
            }).join(',')).join(',');
            csv_r += '\n'+d3.isoFormat(timescale.invert(t))+','+instance_name.map(ins=>var_name.map((v,vi)=>{
                return cluster[h_r[ins][t]][vi];
            }).join(',')).join(',');
        });

        download_csv(csv_c,'b');
        download_csv(csv_r,'a');
        function download_csv(csv,task) {
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
            hiddenElement.target = '_blank';
            hiddenElement.download = `csvUserStudy_${INSTANCE}_${TIMESTEP}_${task}.csv`;
            hiddenElement.click();
        }

    })
})



function generateobject(count,instance,timestep,task,type) {
    return  {
        questions: [
            {
                type: "html",
                name: "info",
                html: `<table><body><row><td><img src='images/${instance}_${timestep}_${task?'b':'a'}_${type?'b':'t'}.PNG' width='100%' height='auto' /></td><td style='padding:20px'></td></row></body></table>`
            },
            {
                type: "radiogroup",
                name: `q${count}`,
                title: task?"Find the most dynamic time point (the timestamps, when many instances change their status)":"Find the most dynamic instance (the instance that exhibits multiple statuses over time).",
                choices: d3.range(0,instance).map(d=>`instance_${d}`),
                correctAnswer: "Group 2"
            }
        ]
    }
}
var set = [10,30,50];
var question = [];
var count = 0;
set.forEach(ins=>{
   set.forEach(time=>{
       d3.range(0,2).forEach(ta=>{
           d3.range(0,2).forEach(ty=>{
               question.push( generateobject(count,ins,time,ta,ty))
               count++;
           })
       })
   })
});