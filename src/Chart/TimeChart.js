import React from "react";
import {
	Chart,
	Interval,
	Coord,
    Interaction,
    Axis
} from "bizcharts";
import { 
    Typography
} from '@material-ui/core';

const TimeChart = ({dataSet, pk, warm}) => {

    // console.log(dataSet);
    // console.log(pk);
    // console.log(warm);

    var coldData = [];
    var warmData = [];
    try {
        coldData = [
            {
                label: "Total: " + dataSet["ColdData"]["Lambda"],
                timerange: [dataSet["ColdTimeRange"]["AWS::Lambda::start"], 
                            dataSet["ColdTimeRange"]["AWS::Lambda::end"]]
            },
            {
                label: "Function: " + dataSet["ColdData"]["Function"],
                timerange: [dataSet["ColdTimeRange"]["AWS::Lambda::Function::start"], 
                            dataSet["ColdTimeRange"]["AWS::Lambda::Function::end"]]
            },
            {
                label: "Initialization: " + dataSet["ColdData"]["Initialization"],
                timerange: [dataSet["ColdTimeRange"]["AWS::Lambda::Function::Initialization::start"], 
                            dataSet["ColdTimeRange"]["AWS::Lambda::Function::Initialization::end"]]
            },
            {
                label: "Invocation: " + dataSet["ColdData"]["Invocation"],
                timerange: [dataSet["ColdTimeRange"]["AWS::Lambda::Function::Invocation::start"], 
                            dataSet["ColdTimeRange"]["AWS::Lambda::Function::Invocation::end"]]
            },
            {
                label: "Overhead: " + dataSet["ColdData"]["Overhead"],
                timerange: [dataSet["ColdTimeRange"]["AWS::Lambda::Function::Overhead::start"], 
                            dataSet["ColdTimeRange"]["AWS::Lambda::Function::Overhead::end"]]
            }
        ]
        warmData = [
            {
                label: "Total: " + dataSet["WarmData"]["Lambda"],
                timerange: [dataSet["WarmTimeRange"]["AWS::Lambda::start"], 
                            dataSet["WarmTimeRange"]["AWS::Lambda::end"]]
            },
            {
                label: "Function: " + dataSet["WarmData"]["Function"],
                timerange: [dataSet["WarmTimeRange"]["AWS::Lambda::Function::start"], 
                            dataSet["WarmTimeRange"]["AWS::Lambda::Function::end"]]
            },
            {
                label: "Initialization: 0",
                timerange: [dataSet["WarmTimeRange"]["AWS::Lambda::Function::Initialization::start"], 
                            dataSet["WarmTimeRange"]["AWS::Lambda::Function::Initialization::end"]]
            },
            {
                label: "Invocation: " + dataSet["WarmData"]["Invocation"],
                timerange: [dataSet["WarmTimeRange"]["AWS::Lambda::Function::Invocation::start"], 
                            dataSet["WarmTimeRange"]["AWS::Lambda::Function::Invocation::end"]]
            },
            {
                label: "Overhead: " + dataSet["WarmData"]["Overhead"],
                timerange: [dataSet["WarmTimeRange"]["AWS::Lambda::Function::Overhead::start"], 
                            dataSet["WarmTimeRange"]["AWS::Lambda::Function::Overhead::end"]]
            }
        ]
    }
    catch (err) {
        return null;
    }

    const scale = {
        "timerange": {
          type: "linear",
          min: 0,
          max: parseFloat(dataSet["MaxTime"]),
        },
      }

    return (
        <div>
            <Typography variant="h6">
                {pk}
            </Typography>
        {
            !warm ? (
                <div >
                    <Chart height={100} data={coldData} forceFit scale={scale}>
                        <Interval position="label*timerange" />
                        <Coord transpose={true} />
                        <Interaction type="active-region" />
                        <Axis name="label" />
                        <Axis name="timerange" />
                    </Chart>
                </div>
            ) : (
                <div >      
                    <Chart height={100} data={warmData} autoFit>
                        <Interval position="label*timerange" />
                        <Coord transpose={true} />
                        <Interaction type="active-region" />
                        <Axis name="label" />
                        <Axis name="timerange" />
                    </Chart>
                </div>
            )
        }
        </div>
    );
};

export default TimeChart;