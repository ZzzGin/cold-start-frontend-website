import React from "react";
import { 
    FormControl, InputLabel, Select, MenuItem, Paper
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { API, graphqlOperation } from 'aws-amplify';
import { listColdStartSummariesAfterTimestamp } from '../graphql/queries';
import {
	Chart,
	Geom,
	Axis,
	Tooltip,
	Legend,
	Slider
} from "bizcharts";

const providerList = [
    'AWS'
]
const runtimeList = [
    {humanReadableName: '.NET Core 3.1', label: 'dotnetcore3.1'},
    {humanReadableName: 'Go 1.x', label: 'go1.x'},
    {humanReadableName: 'Java 11 (Corretto)', label: 'java11'},
    {humanReadableName: 'Node.js 12.x', label: 'nodejs12.x'},
    {humanReadableName: 'Python 3.8', label: 'python3.8'},
    {humanReadableName: 'Ruby 2.7', label: 'ruby2.7'}
]
const memSizeList = [
    '128',
    '512',
    '1024',
    '2048'
]
const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

const useStyles = makeStyles((theme) => ({
    formControl: {
      marginRight: theme.spacing(5),
      minWidth: 150,
      maxWidth: 300,
    },
    noLabel: {
      marginTop: theme.spacing(3),
    },
    root: {
      flexGrow: 1,
      backgroundColor: theme.palette.background.paper,
    }
  }));

const HistoryChart = () => {

    const classes = useStyles();

    const cols = {
        month: {
            range: [0.05, 0.95],
        },
        revenue: {
            min: 0,
        },
    };

    const [selectedSingleProvider, setSelectedSingleProvider] = React.useState("");
    const [selectedSingleRuntime, setSelectedSingleRuntime] = React.useState("");
    const [selectedSingleMemSize, setSelectedSingleMemSize] = React.useState("");
    const [dataLake, setDataLake] = React.useState([]);
    const handleSingleProviderChange = (event) => {
        setSelectedSingleProvider(event.target.value);
    }
    const handleSingleRuntimeChange = (event) => {
        setSelectedSingleRuntime(event.target.value);
    }
    const handleSingleMemSizeChange = (event) => {
        setSelectedSingleMemSize(event.target.value);
    }

    const processItemToTimeRange = (item) => {

        const cold = JSON.parse(item.Summary).Cold;
        const warm = JSON.parse(item.Summary).Warm;
    
        const coldData = {};
        for(var cKey in cold){
    
          const keyArray = cKey.toString().split(":")
          const label = keyArray[keyArray.length-3]
          const value = cold[cKey]
          if (label in coldData) {
            let v = Math.abs(coldData[label]-value)*1000;
            v = v.toFixed(3)
            coldData[label] = v;
          }
          else{
            coldData[label] = value;
          }
        }
    
        const warmData = {};
        for(var wKey in warm){
    
          const keyArray = wKey.toString().split(":")
          const label = keyArray[keyArray.length-3]
          const value = warm[wKey]
          if (label in warmData) {
            let v = Math.abs(warmData[label]-value)*1000;
            v = v.toFixed(3)
            warmData[label] = v;
          }
          else{
            warmData[label] = value;
          }
        }
    
        var date = new Date(item.SK * 1000);
        var humanReadableDate = date.getDate();
        var humanReadableMonth = date.getMonth();

        const result = [
            {
                date: months[humanReadableMonth] + " " + humanReadableDate,
                label: "C-Total",
                time: parseFloat(coldData["Lambda"])
            },
            {
                date: months[humanReadableMonth] + " " + humanReadableDate,
                label: "C-Function",
                time: parseFloat(coldData["Function"])
            },
            {
                date: months[humanReadableMonth] + " " + humanReadableDate,
                label: "C-Init",
                time: parseFloat(coldData["Initialization"])
            },
            {
                date: months[humanReadableMonth] + " " + humanReadableDate,
                label: "C-Invoke",
                time: parseFloat(coldData["Invocation"])
            },
            {
                date: months[humanReadableMonth] + " " + humanReadableDate,
                label: "C-Overhead",
                time: parseFloat(coldData["Overhead"])
            },
            {
                date: months[humanReadableMonth] + " " + humanReadableDate,
                label: "W-Total",
                time: parseFloat(warmData["Lambda"])
            },
            {
                date: months[humanReadableMonth] + " " + humanReadableDate,
                label: "W-Function",
                time: parseFloat(warmData["Function"])
            },
            {
                date: months[humanReadableMonth] + " " + humanReadableDate,
                label: "W-Invoke",
                time: parseFloat(warmData["Invocation"])
            },
            {
                date: months[humanReadableMonth] + " " + humanReadableDate,
                label: "W-Overhead",
                time: parseFloat(warmData["Overhead"])
            },
        ];
    
        return result;
    }

    React.useEffect(() => {
        const fetchDataForHistory = async () => {
            const nowRoundToDate = Math.floor(Date.now()/86400/1000)*86400;
            const sixteenDayBeforeRoundToDate = nowRoundToDate - 60*86400;
            const result = await API.graphql(graphqlOperation(listColdStartSummariesAfterTimestamp, { 
                PK: 'SUMMARY|' + selectedSingleProvider + '|' + selectedSingleRuntime + '|' + selectedSingleMemSize,
                SK_from: sixteenDayBeforeRoundToDate,
                SK_to: nowRoundToDate
            }));
            
            var processedItems = []
            for (var item of result.data.listColdStartSummariesAfterTimestamp.items) {
                processedItems = processedItems.concat(processItemToTimeRange(item));
            }
            setDataLake(processedItems);
        };

        if (selectedSingleProvider==="" || selectedSingleRuntime==="" || selectedSingleMemSize==="") return;
        fetchDataForHistory();
    }, [selectedSingleProvider, selectedSingleRuntime, selectedSingleMemSize]);

    return (
        <>
        <div>
            <FormControl className={classes.formControl}>
                <InputLabel id="provider-simple-select-label">Provider</InputLabel>
                <Select
                    labelId="provider-simple-select-label"
                    id="provider-simple-select"
                    value={selectedSingleProvider}
                    onChange={handleSingleProviderChange}
                >
                {providerList.map((provider) => (
                <MenuItem value={provider} key={provider}>{provider}</MenuItem>
                ))}
                </Select>
            </FormControl>
            <FormControl className={classes.formControl}>
                <InputLabel id="runtime-simple-select-label">Runtime</InputLabel>
                <Select
                    labelId="runtime-simple-select-label"
                    id="runtime-simple-select"
                    value={selectedSingleRuntime}
                    onChange={handleSingleRuntimeChange}
                >
                {runtimeList.map((runtime) => (
                <MenuItem value={runtime.label} key={runtime.label}>{runtime.humanReadableName}</MenuItem>
                ))}
                </Select>
            </FormControl>
            <FormControl className={classes.formControl}>
                <InputLabel id="memsize-simple-select-label">Mem Size (mb)</InputLabel>
                <Select
                    labelId="memsize-simple-select-label"
                    id="memsize-simple-select"
                    value={selectedSingleMemSize}
                    onChange={handleSingleMemSizeChange}
                >
                {memSizeList.map((memsize) => (
                <MenuItem value={memsize} key={memsize}>{memsize}</MenuItem>
                ))}
                </Select>
            </FormControl>
        </div>
        <div style={{marginTop: "20px"}}>

        </div>
        <Paper elevation={3}>
            <div style={{ padding: "20px" }
                }>
                    <Chart height={600} data={dataLake} scale={cols} forceFit>
                        <Legend position='top-left'/>
                        <Axis name="date" />
                        <Axis
                            name="time"
                            label={{
                                formatter: (val) => `${val} ms`,
                            }}
                        />
                        < Tooltip
                            crosshairs={{
                                type: "y",
                            }}
                        />
                        < Geom type="line" position="date*time" size={2} color={"label"} />
                        <Geom
                            type="point"
                            position="date*time"
                            size={4}
                            shape={"circle"}
                            color={"label"}
                            style={{
                                stroke: "#fff",
                                lineWidth: 1,
                            }}
                        />
                        <Slider />
                    </Chart>
                </div>
            </Paper>
        </>
    )

}

export default HistoryChart;