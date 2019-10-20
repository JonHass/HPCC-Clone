function get_string(val,i){
    switch(i) {
        case 0:
            for (let j =0;j<3;j++)
                val[j]= val[j]===null?d3.scaleLinear().range(thresholds[i])(0.5):val[j];
            return `CPU1 Temp ${val[0]} OK CPU2 Temp ${val[1]} OK Inlet Temp ${val[2]} OK`;
        case 1:
            for (let j =0;j<1;j++)
                val[j]= val[j]===null?d3.scaleLinear().range(thresholds[i])(0.5):val[j];
            return `OK - Average CPU load is normal! :: CPU Load: ${val[0]}`
        case 2:
            for (let j =0;j<1;j++)
                val[j]= val[j]===null?d3.scaleLinear().range(thresholds[i])(0.5):val[j];
            return `OK - Memory usage is normal! :: Usage Percentage = ${val[0]} :: Total Memory: 191.908G :: Used Memory: 177.675G`
        case 3:
            for (let j =0;j<4;j++)
                val[j]= val[j]===null?d3.scaleLinear().range(thresholds[i])(0.5):val[j];
            return `FAN_1 ${val[0]} RPM OK FAN_2 ${val[1]} RPM OK FAN_3 ${val[2]} RPM OK FAN_4 ${val[3]} RPM OK`
        default:
            for (let j =0;j<1;j++)
                val[j]= (val[j]===null?d3.scaleLinear().range(thresholds[i])(0.5):val[j])*3.2;
            return `OK - The average power consumed in the last one minute = ${val[0]} W` //3.2
    }
}
let newD = {};
d3.range(59,62).forEach((d,i)=>{
    hosts.forEach(h=>{
        if (!newD[h.name])
            newD[h.name]={};
        serviceListattr.forEach((s,si)=>{
            if (!newD[h.name][s])
                newD[h.name][s] = [];
            newD[h.name][s].push({
                result:{'query-time': + new Date(dataa.timespan[d])},
                data:{
                    service:{
                        host_name: h.name,
                        plugin_output: get_string((dataa[h.name][s]||[])[d]||[null,null,null],si)
                    }
                }
            });
        });
    })
})
console.log(JSON.stringify((newD)))