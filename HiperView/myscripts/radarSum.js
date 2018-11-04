// Ngan - Oct 31 2018


var radarsize  = 230;
var bin = binnerN().startBinGridSize(30).isNormalized(false).minNumOfBins(4).maxNumOfBins(15);

d3.radar = function () {
    let startBinGridSize=30,
        isNormalized =false,
        BinRange = [4,15],
        arr = [],
        maxstack= 4;
    let radarTimeline ={};
    let indexdata =[];
    let bin = binnerN().startBinGridSize(startBinGridSize).isNormalized(isNormalized).minNumOfBins(BinRange[0]).maxNumOfBins(BinRange[1]);
    let svg;
    let xscale = d3.scaleLinear().domain([0, 7]).range([0, 1000]);


    radarTimeline.draw = function(index){
        if (index >= maxstack) index = maxstack;
        let radarchart = svg.append("g")
            .attr("class","radar"+index+" box"+index+" graphsum")
            .datum(index)
            .attr("transform", function (d) {
                return "translate(" + xscale(index) + "," + 10 + ")";
            });


        handledata(index);
        bin.data(dataSpider3.map(d=>{
            var dd = d.map(k=>k.value);
            dd.data = d.name;
            return dd;}))
            .calculate();
        var keys = dataSpider3[0].map(d=>d.axis);
        dataSpider3.length = 0;
        console.log(bin.bins.length);
        var distance = function(a, b){
            let dsum = 0;
            a.forEach((d,i)=> {dsum +=(d-b[i])*(d-b[i])});
            return Math.round(Math.sqrt(dsum)*Math.pow(10, 10))/Math.pow(10, 10);};
        dataSpider3 = bin.bins.map(d=>
        {   var temp = bin.normalizedFun.scaleBackPoint(d.val).map((e,i)=>{return {axis:keys[i],value:e}});
            temp.bin ={val: bin.normalizedFun.scaleBackPoints(d),
                name:d.map(f=>f.data),
                distance: d3.max(d.map(function(p){return distance(d.val, p)}))};
            return temp;});
        let radarChartsumopt  = {
            w: radarsize -5,
            h: radarsize +20,
            radiuschange: false,
            dotRadius:2,
            maxValue: 0.5,
            levels: levelsR,
            roundStrokes: true,
            color: color2,
            showText: false,
            bin :   true,
            legend: [{},
                {},
                {},
                {5: thresholds[1][1]},
                {5: thresholds[2][1]},
                {5: thresholds[3][1]},
                {5: thresholds[3][1]},
                {5: thresholds[3][1]},
                {5: thresholds[3][1]},
                {5: thresholds[4][1]}]
        };
        RadarChart(".radar"+index, dataSpider3, radarChartsumopt,"");

        if (index >= maxstack) radarTimeline.shift();

    };

    radarTimeline.shift = function (){
        var radarchart = svg.selectAll(".graphsum").transition().duration(500)
            .attr("transform", function (d) {
                return "translate(" + xscale(d-1) + "," + 10 + ")";
            }).on("end", function(d) {
                if (d==0)
                    d3.select(this).remove();
                else
                    d3.select(this).datum(d=>d-1).attr("class",d=>("radar"+d+" box"+d+" graphsum"));
            });
    };

    function handledata(index){
        // Summarynode

        dataSpider3 = [];

        //dataSpider2.name = 'Summary '+d3.timeFormat('%H:%M %d %b %Y')(r.arr[0].result.query_time);
        if (arr.length>0){
            for (var i=0;i<arr.length;i++){
                var arrServices = arr[i];
                var arr1 = [];
                for (var a=0;a<axes.length;a++){
                    var obj ={};
                    obj.axis = axes[a];
                    if (a==0)
                        obj.value = arrServices[0].a[0];
                    else if (a==1)
                        obj.value = arrServices[0].a[1];
                    else if (a==2)
                        obj.value = arrServices[0].a[2];
                    else if (a==3)
                        obj.value = arrServices[1].a[0];
                    else if (a==4)
                        obj.value = arrServices[2].a[0];
                    else if (a==5)
                        obj.value = arrServices[3].a[0];
                    else if (a==6)
                        obj.value = arrServices[3].a[1];
                    else if (a==7)
                        obj.value = arrServices[3].a[2];
                    else if (a==8)
                        obj.value = arrServices[3].a[3];
                    else if (a==9)
                        obj.value = arrServices[4].a[0];
                    arr1.push(obj);
                }
                arr1.name = arr[i].name;
                arr1.indexSamp = index;
                dataSpider3.push(arr1);

                // Standardize data for Radar chart
                for (var j=0; j<dataSpider3[i].length;j++){
                    if (dataSpider3[i][j].value == undefinedValue || isNaN(dataSpider3[i][j].value))
                        dataSpider3[i][j].value = -15;
                    else if (j==3){   ////  Job load ***********************
                        var scale = d3.scaleLinear()
                            .domain([thresholds[1][0],thresholds[1][1]])
                            .range([thresholds[0][0],thresholds[0][1]]);

                        dataSpider3[i][j].value =  scale(dataSpider3[i][j].value);
                    }
                    else if (j==5 || j==6 || j==7 || j==8){   ////  Fans SPEED ***********************
                        var scale = d3.scaleLinear()
                            .domain([thresholds[3][0],thresholds[3][1]])
                            .range([thresholds[0][0],thresholds[0][1]]); //interpolateHsl interpolateHcl interpolateRgb

                        dataSpider3[i][j].value =  scale(dataSpider3[i][j].value);
                    }
                    else if (j==9){   ////  Power Consumption ***********************
                        var scale = d3.scaleLinear()
                            .domain([thresholds[4][0],thresholds[4][1]])
                            .range([thresholds[0][0],thresholds[0][1]]); //interpolateHsl interpolateHcl interpolateRgb
                        dataSpider3[i][j].value =  scale(dataSpider3[i][j].value);
                    }
                }
            }
        }
    }

    radarTimeline.data = function (_) {
        return arguments.length ? (arr = _, radarTimeline) : arr;

    };

    radarTimeline.BinRange = function (_) {
        return arguments.length ? (BinRange = _, radarTimeline) : BinRange;

    };

    radarTimeline.svg = function (_) {
        return arguments.length ? (svg = _, radarTimeline) : svg;

    };

    radarTimeline.scale = function (_) {
        return arguments.length ? (xscale = _, radarTimeline) : xscale;

    };

    radarTimeline.maxstack = function (_) {
        return arguments.length ? (maxstack = _, radarTimeline) : maxstack;

    };
    return radarTimeline;
};