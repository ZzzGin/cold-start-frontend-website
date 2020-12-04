import { 
  Container, Typography, Switch, FormControlLabel, Input, 
  FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText,
  Box, Tab, Tabs 
} from '@material-ui/core';
import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import theme from './themes/darkTheme'
import { ThemeProvider, makeStyles } from '@material-ui/core/styles'
import TimeChart from './Chart/TimeChart'
import { API, graphqlOperation } from 'aws-amplify'
import { listColdStartSummariesAfterTimestamp } from './graphql/queries'
import InfoIcon from '@material-ui/icons/Info';
import TimelineIcon from '@material-ui/icons/Timeline';
import BarChartIcon from '@material-ui/icons/BarChart';
import InfoPage from './Info';
import HistoryChart from './Chart/HistoryChart';

import PropTypes from 'prop-types';

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

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 300,
    },
  },
};


function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`wrapped-tabpanel-${index}`}
      aria-labelledby={`wrapped-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography component={'span'} >{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `wrapped-tab-${index}`,
    'aria-controls': `wrapped-tabpanel-${index}`,
  };
}

var timeRangeCache = {};

function App() {

  const classes = useStyles();
  const [tabValue, setTabValue] = React.useState('one');

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const [selectedProviders, setSelectedProviders] = React.useState([]);
  const [selectedRuntimes, setSelectedRuntimes] = React.useState([]);
  const [selectedMemSizes, setSelectedMemSizes] = React.useState([]);
  const [selectWarm, setSelectWarm] = React.useState(false);
  const [partitionKeys, setPartitionKeys] = React.useState([]);


  const handleSelectedProviderChange = (event) => {
    setSelectedProviders(event.target.value);
  };
  const handleSelectedRuntimesChange = (event) => {
    setSelectedRuntimes(event.target.value);
  };
  const handleSelectedMemSizesChange = (event) => {
    setSelectedMemSizes(event.target.value);
  };
  const handleWarmSwitchChange = (event) => {
    setSelectWarm(event.target.checked);
  }


  const processItemToTimeRange = (item) => {

    const config = JSON.parse(item.Configs).M;
    const cold = JSON.parse(item.Summary).Cold;
    const warm = JSON.parse(item.Summary).Warm;

    const coldData = {};
    const coldTimeRange = {};
    for(var cKey in cold){

      coldTimeRange[cKey.toString()] = cold[cKey]*1000;

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
    const warmTimeRange = {};
    for(var wKey in warm){

      warmTimeRange[wKey.toString()] = warm[wKey]*1000;

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

    const configData = {};
    for (var cfgKey in config) {
      if (cfgKey === 'CodeSize' || cfgKey === 'MemorySize') {
        configData[cfgKey] = parseInt(config[cfgKey].N);
      }
      else {
        configData[cfgKey] = config[cfgKey].S;
      }
    }

    var maxTime = parseFloat(coldData["Lambda"]);

    const result = {};
    result["ColdData"] = coldData;
    result["ColdTimeRange"] = coldTimeRange;
    result["WarmData"] = warmData;
    result["WarmTimeRange"] = warmTimeRange;
    result["ConfigData"] = configData;
    result["MaxTime"] = maxTime;

    return result;
  }

  React.useEffect(() => {
  
    const fetchDataForBenchmark = async partitionKeyList => {
      for (var pk of partitionKeyList){
        if (!(pk in timeRangeCache)) {
          const nowRoundToDate = Math.floor(Date.now()/86400/1000)*86400;
          const oneDayBeforeRoundToDate = nowRoundToDate - 86400;
          const result = await API.graphql(graphqlOperation(listColdStartSummariesAfterTimestamp, { 
            PK: pk,
            SK_from: oneDayBeforeRoundToDate,
            SK_to: nowRoundToDate
          }));
          const items = result.data.listColdStartSummariesAfterTimestamp.items;
          timeRangeCache[pk] = processItemToTimeRange(items[items.length-1]);
        }
      };
      // console.log(timeRangeCache);
      const sortedPartitionKeyList = partitionKeyList;
      sortedPartitionKeyList.sort((a, b) => {
        return parseInt(timeRangeCache[b]["MaxTime"]) - parseInt(timeRangeCache[a]["MaxTime"])
      })
      // console.log(partitionKeyList);
      setPartitionKeys(partitionKeyList);
    };

    const partitionKeyList = []
    selectedProviders.forEach(provider => {
      selectedRuntimes.forEach(runtime => {
        selectedMemSizes.forEach(memSize => {
          const obj = runtimeList.find(rt => rt.humanReadableName === runtime);
          partitionKeyList.push('SUMMARY|' + provider + '|' + obj.label + '|' + memSize);
        })
      })
    })
    fetchDataForBenchmark(partitionKeyList);

  }, [selectedProviders, selectedRuntimes, selectedMemSizes, tabValue])

  return (
    <div>
      <ThemeProvider theme={theme}>
        <AppBar position="fixed">
          <Toolbar>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="wrapped label tabs example">
            <Tab value="one" label="Info" icon={<InfoIcon />} {...a11yProps('one')}/>
            <Tab value="two" label="Benchmark" icon={<BarChartIcon />} {...a11yProps('two')} />
            <Tab value="three" label="History" icon={<TimelineIcon />} {...a11yProps('three')} />
          </Tabs>
          </Toolbar>
        </AppBar>

        <Toolbar />

        <TabPanel value={tabValue} index="one">
          <Container maxWidth="md">
             <InfoPage />
          </Container>
        </TabPanel> 
        <TabPanel value={tabValue} index="two">
          {/* Filters */}
          <Container maxWidth="md">
            <FormControl className={classes.formControl}>
              <InputLabel id="providers-checkbox-label">Providers</InputLabel>
              <Select
                labelId="providers-checkbox-label"
                id="providers-checkbox"
                multiple
                value={selectedProviders}
                onChange={handleSelectedProviderChange}
                input={<Input />}
                renderValue={(selected) => selected.join(', ')}
                MenuProps={MenuProps}
              >
                {providerList.map((provider) => (
                  <MenuItem key={provider} value={provider}>
                    <Checkbox checked={selectedProviders.indexOf(provider) > -1} />
                    <ListItemText primary={provider} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl className={classes.formControl}>
              <InputLabel id="runtimes-checkbox-label">Runtimes</InputLabel>
              <Select
                labelId="runtimes-checkbox-label"
                id="runtimes-checkbox"
                multiple
                value={selectedRuntimes}
                onChange={handleSelectedRuntimesChange}
                input={<Input />}
                renderValue={(selected) => selected.join(', ')}
                MenuProps={MenuProps}
              >
                {runtimeList.map((runtime) => (
                  <MenuItem key={runtime.humanReadableName} value={runtime.humanReadableName}>
                    <Checkbox checked={selectedRuntimes.indexOf(runtime.humanReadableName) > -1} />
                    <ListItemText primary={runtime.humanReadableName} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl className={classes.formControl}>
              <InputLabel id="mem-sizes-checkbox-label">Mem Size (mb)</InputLabel>
              <Select
                labelId="mem-sizes-checkbox-label"
                id="mem-size-checkbox"
                multiple
                value={selectedMemSizes}
                onChange={handleSelectedMemSizesChange}
                input={<Input />}
                renderValue={(selected) => selected.join(', ')}
                MenuProps={MenuProps}
              >
                {memSizeList.map((memSize) => (
                  <MenuItem key={memSize} value={memSize}>
                    <Checkbox checked={selectedMemSizes.indexOf(memSize) > -1} />
                    <ListItemText primary={memSize} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Container>
          
          {/* Switch */}
          <Container maxWidth="md">
            <FormControlLabel
              control={<Switch checked={selectWarm} onChange={handleWarmSwitchChange} />}
              label={selectWarm? "Warmed Invocation" : "Cold Start"}
            />
          </Container>

          {
            partitionKeys.map( pk => (
              <Container key={pk}>
                <TimeChart dataSet={timeRangeCache[pk]} pk={pk} warm={selectWarm}/>
              </Container>
            ))
          }
        </TabPanel>
        <TabPanel value={tabValue} index="three">
          <Container maxWidth='md'>
            <HistoryChart />
          </Container>
        </TabPanel>
      </ThemeProvider>
    </div>
  );
}

export default App;