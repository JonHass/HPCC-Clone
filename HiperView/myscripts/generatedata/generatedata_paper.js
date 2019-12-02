var cluster = [[0.5684210526315789,0.43157894736842106,0.17894736842105263,0.05152932076249499,0.525,0.525,0.525,0.5333333333333333,0.4515625],[0.7789473684210526,0.6421052631578947,0.14736842105263157,0.4042025187574097,0.49166666666666664,0.4666666666666667,0.49166666666666664,0.4666666666666667,0.49375],[0.37894736842105264,0.30526315789473685,0.10526315789473684,0.5278518347280462,0.4791666666666667,0.4791666666666667,0.4708333333333333,0.4791666666666667,0.2203125],[0.5684210526315789,0.4421052631578947,0.11578947368421053,0.9610876255310047,0.4666666666666667,0.4666666666666667,0.4583333333333333,0.4666666666666667,0.46875],[0,0,0,0,0,0,0,0,0],[0.5789473684210527,0.47368421052631576,0.15789473684210525,0.4224246340260264,0.6791666666666667,0.675,0.675,0.675,0.478125],[0.4842105263157895,0.4,0.11578947368421053,0.33491426763202825,0.9375,0.925,0.9333333333333333,0.9333333333333333,0.5078125],[0,0,0,0.6071301421156561,0,0,0,0,0],[0.2736842105263158,0.25263157894736843,0.08421052631578947,0.036086314928260026,0.5875,0.5833333333333334,0.5875,0.5833333333333334,0.2015625],[0.8842105263157894,0.7684210526315789,0.14736842105263157,0.03144393894128142,0.5875,0.5958333333333333,0.6,0.5958333333333333,0.4890625]];
var INSTANCE = 10;
var TIMESTEP = 10;
var VARNUM = 9;

var COLLUM_MARK = Math.round(Math.random()*(TIMESTEP/5-1) +1 )*5;
var ROW_MARK = Math.round(Math.random()*INSTANCE);
if (TIMESTEP>10)
    COLLUM_MARK = Math.round(Math.random()*(TIMESTEP/5-1) +1 )*5;
else
    COLLUM_MARK = Math.round(Math.random()*(TIMESTEP-3)) +1;

var instance_name = d3.range(0,INSTANCE).map(d=>'h'+d);
var var_name = d3.range(0,VARNUM).map(d=>'m'+d);

var startTime = new Date('Jan 2019');
var timescale = d3.scaleTime().domain([startTime,new Date(startTime+60*60*1000)]).range([0,1]);

// make header
var csv_header = 'timespan,'+instance_name.map(i=>var_name.map(v=>`${i}_${v}`).join(',')).join(',');
var csv_c = csv_header;
var csv_r = csv_header;

// generate data
var h_c = {};
var h_r = {};

instance_name.forEach(ins=>h_c[ins]=[Math.round(Math.random()*VARNUM)]);
instance_name.forEach(ins=>h_r[ins]=[Math.round(Math.random()*VARNUM)]);

console.log('COLLUM_MARK:'+COLLUM_MARK)
instance_name.forEach(ins=>{
    d3.range(0,TIMESTEP-1).forEach((t,ti_c)=>{
        var ti=ti_c+1;
        if (Math.random()<0.2||ti===COLLUM_MARK)
            h_c[ins][ti] = Math.round(Math.random()*VARNUM);
        else
            h_c[ins][ti] = h_c[ins][ti-1];

    })
});
console.log('ROW_MARK:'+ROW_MARK);
instance_name.forEach((ins,insi)=>{
    d3.range(0,TIMESTEP-1).forEach((t,ti_c)=>{
        var ti=ti_c+1;
        if (Math.random()<0.2||insi===ROW_MARK)
            h_r[ins][ti] = Math.round(Math.random()*VARNUM);
        else
            h_r[ins][ti] = h_r[ins][ti-1];

    })
});

d3.range(0,TIMESTEP).forEach(t=>{
    csv_c += '\n'+timescale.invert(t)+','+instance_name.map(ins=>var_name.map((v,vi)=>{
        return cluster[h_c[ins][t]][vi];
    }));
    csv_r += '\n'+timescale.invert(t)+','+instance_name.map(ins=>var_name.map((v,vi)=>{
        return cluster[h_r[ins][t]][vi];
    }));
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


