import React,{
useEffect,
useState
}
from "react";

import AnalyticsCharts from "../analytics/AnalyticsCharts";

import {getAnalytics}
from "../services/analyticsService";

export default function Analytics(){

const [analytics,setAnalytics]=useState(null);

useEffect(()=>{

loadAnalytics();

},[]);

async function loadAnalytics(){

const data=await getAnalytics();

setAnalytics(data);

}

if(!analytics){

return(
<div style={{padding:"40px"}}>
Loading Analytics...
</div>
);

}

const chartData=analytics.snapshots

.slice()

.reverse()

.map((item,index)=>({

frame:index+1,

people:item.people_count,

density:item.density_score,

motion:item.motion_score,

risk:
item.risk_level==="HIGH RISK"
?3
:item.risk_level==="WARNING"
?2
:1

}));

return(

<div>

<h1>Analytics Dashboard</h1>

<p>
Historical AI analytics from processed videos.
</p>

<div
style={{

display:"grid",

gridTemplateColumns:"1fr 1fr",

gap:"20px",

marginTop:"30px"

}}
>

<AnalyticsCharts

title="Crowd Count Trend"

data={chartData}

dataKey="people"

color="#22c55e"

/>

<AnalyticsCharts

title="Density Trend"

data={chartData}

dataKey="density"

color="#3b82f6"

/>

<AnalyticsCharts

title="Motion Trend"

data={chartData}

dataKey="motion"

color="#f59e0b"

/>

<AnalyticsCharts

title="Risk Timeline"

data={chartData}

dataKey="risk"

color="#ef4444"

/>

</div>

</div>

);

}