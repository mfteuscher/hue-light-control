import './App.css';
import { useEffect, useState, useRef } from 'react';
import { AppBar, CardContent, FormControlLabel, Slider, Switch, Toolbar } from '@mui/material';
import { Container } from '@mui/system';
import LightbulbCircleIcon from '@mui/icons-material/LightbulbCircle';
import { Grid, Button, Card, CardActionArea, Typography } from '@mui/material';
import axios from 'axios';
import Wheel from '@uiw/react-color-wheel';
import { hsvaToRgba, rgbaToHsva } from '@uiw/color-convert'
import LightSelector from './LightSelector';



function App() {
  const hueUsername = 'XWGu880YHThw6OCqZVyafYvXZwVioXsALfhNBiPz';
  const hueBridgeAPI = `http://192.168.1.126/api/${hueUsername}`;
  const [lights, setLights] = useState([]);
  const [currLight, setCurrLight] = useState(1);
  const [power, setPower] = useState(true);
  const [hsva, setHsva] = useState({ h: 0, s: 0, v: 100, a: 1 });
  const [brightness, setBrightness] = useState(100);
  const [temp, setTemp] = useState(153);
  const [colorloop, setColorloop] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const continueLooping = useRef(false);

  const colorloopActive = () => colorloop === 'colorloop';

  const timeout = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const chaosMode = async () => {
    let i = 0;
    while (continueLooping.current) {
      await timeout(500);
      await randomAction(lights[i % lights.length]);
      ++i;
    }
  }

  function generateRandom(min = 0, max = 100) {
    let difference = max - min;
    let rand = Math.random();
    rand = Math.floor( rand * difference);
    rand = rand + min;

    return rand;
}
  const randomAction = async (bulbNumber) => {
    await axios.put(`${hueBridgeAPI}/lights/${bulbNumber}/state`, {effect: 'none'});

    let randomNumber = generateRandom(1,4);
    let body = {};
    switch(randomNumber) {
      case 1: 
        let randomX = Math.random();
        let randomY = Math.random();
        body = {xy: [randomX, randomY]};
        break;
      case 2:
        let randomBrightness = generateRandom(0, 254);
        body = {bri: randomBrightness};
        break;
      case 3: 
        let randomTemp = generateRandom(153, 500);
        body = {ct: randomTemp};
        break;
      case 4:
        body = {effect: 'colorloop'};
        break;
      
    }
    console.log(body);
    
    return axios.put(`${hueBridgeAPI}/lights/${bulbNumber}/state`, body);
  }


  useEffect(() => {
    const getLights = async () => {
      const { data } = await axios.get(`${hueBridgeAPI}/lights`);
      setLights(Object.getOwnPropertyNames(data));
      setCurrLight(Object.getOwnPropertyNames(data)[0]);
    }
    getLights();
  }, [])

  useEffect(() => {
    const getLightData = async () => {
      setInitialLoad(true);
      const { data } = await axios.get(`${hueBridgeAPI}/lights/${currLight}`);
      const { state } = data;
      setPower(state.on);
      setBrightness(state.bri / 254 * 100);
      const x = state.xy[0];
      const y = state.xy[1];
      let z = 1.0 - x - y;
      let Y = state.bri;
      let X = (Y / y) * x;
      let Z = (Y / y) * z;
      let r = X * 1.656492 - Y * 0.354851 - Z * 0.255038;
      console.log(r);
      let g = -X * 0.707196 + Y * 1.655397 + Z * 0.036152;
      let b = X * 0.051713 - Y * 0.121364 + Z * 1.011530;
      r = r <= 0.0031308 ? 12.92 * r : (1.0 + 0.055) * Math.pow(r, (1.0 / 2.4)) - 0.055;
      g = g <= 0.0031308 ? 12.92 * g : (1.0 + 0.055) * Math.pow(g, (1.0 / 2.4)) - 0.055;
      b = b <= 0.0031308 ? 12.92 * b : (1.0 + 0.055) * Math.pow(b, (1.0 / 2.4)) - 0.055;
      const newHsva = rgbaToHsva({ r, g, b, a: 1 });
      setHsva({ h: newHsva.h, s: newHsva.s, v: 100, a: 1 });
      setTemp(state.ct);
      setColorloop(state.effect);
      setInitialLoad(false);
    }
    getLightData();
  }, [currLight]);

  useEffect(() => {
    if (!initialLoad)
      axios.put(`${hueBridgeAPI}/lights/${currLight}/state`, { "on": power })
  }, [power])

  useEffect(() => {
    if (!initialLoad) {
      console.log('changing colorloop');
      axios.put(`${hueBridgeAPI}/lights/${currLight}/state`, { "effect": colorloop })
    }
  }, [colorloop])

  useEffect(() => {
    if (!initialLoad) {
      console.log('changing brightness');
      axios.put(`${hueBridgeAPI}/lights/${currLight}/state`, { "bri": brightness / 100 * 254 })
    }
  }, [brightness])

  useEffect(() => {
    if (!initialLoad) {
      console.log('changing temp');
      axios.put(`${hueBridgeAPI}/lights/${currLight}/state`, { ct: temp });
    }
  }, [temp])

  useEffect(() => {
    if (!initialLoad) {
      console.log('changing color');
      const rgb = hsvaToRgba(hsva);
      let red = (rgb.r > 0.04045) ? Math.pow((rgb.r + 0.055) / (1.0 + 0.055), 2.4) : (rgb.r / 12.92);
      let green = (rgb.g > 0.04045) ? Math.pow((rgb.g + 0.055) / (1.0 + 0.055), 2.4) : (rgb.g / 12.92);
      let blue = (rgb.b > 0.04045) ? Math.pow((rgb.b + 0.055) / (1.0 + 0.055), 2.4) : (rgb.b / 12.92);
      let X = red * 0.4124 + green * 0.3576 + blue * 0.1805;
      let Y = red * 0.2126 + green * 0.7152 + blue * 0.0722;
      let Z = red * 0.0193 + green * 0.1192 + blue * 0.9505;
      let x = X / (X + Y + Z);
      let y = Y / (X + Y + Z);
      let brightness = Y;
      setBrightness(brightness);
      try {
        axios.put(`${hueBridgeAPI}/lights/1/state`, { xy: [x, y] })
      } catch (e) {
        console.error(e);
      }
    } else setInitialLoad(false);
  }, [hsva])

  return (
    <div className="App">
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar>
            <LightbulbCircleIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
            <span>Phillips Hue Lightbulb Control</span>
          </Toolbar>
        </Container>
      </AppBar>
      <main>
        <Container sx={{ maxWidth: "700px", paddingBottom: '25px' }}>
          <Container sx={{ marginY: '10px', minHeight: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LightSelector lightArray={lights} currLight={currLight} setLight={setCurrLight} />
          </Container>
          <Grid container justifyContent="center" alignItems="center" sx={{ height: '100%' }}>
            <Grid item container sx={{ marginBottom: '20px' }}>
              <Grid xs={6} item justifyContent="center" alignItems="center">
                <FormControlLabel control={<Switch checked={power} onChange={e => setPower(e.target.checked)} />} label="Power" />
              </Grid>
              <Grid xs={6} item>
                <FormControlLabel control={<Switch sx={{'& .css-jsexje-MuiSwitch-thumb': {background: `linear-gradient(
    90deg,
    rgba(255, 0, 0, 1) 0%,
    rgba(255, 154, 0, 1) 10%,
    rgba(208, 222, 33, 1) 20%,
    rgba(79, 220, 74, 1) 30%,
    rgba(63, 218, 216, 1) 40%,
    rgba(47, 201, 226, 1) 50%,
    rgba(28, 127, 238, 1) 60%,
    rgba(95, 21, 242, 1) 70%,
    rgba(186, 12, 248, 1) 80%,
    rgba(251, 7, 217, 1) 90%,
    rgba(255, 0, 0, 1) 100%
)`}}} checked={colorloop === 'colorloop'} onChange={e => setColorloop(e.target.checked ? 'colorloop' : 'none')} />} label="Color Loop" />
              </Grid>
            </Grid>
            <Grid item container >
              <Grid xs={12} md={6} item sx={{ display: 'flex', marginBottom: '20px', flexDirection: 'column' }} justifyContent="center" alignItems="center">
                <Typography>Hue and Saturation</Typography><br />
                <Wheel color={hsva} onChange={color => { if (!colorloopActive()) setHsva({ ...hsva, ...color.hsva }) }} />
              </Grid>
              <Grid xs={12} md={6} container item sx={{ marginBottom: '20px' }}>
                <Grid xs={12} item sx={{ display: 'flex', marginX: '20px', flexDirection: 'column' }} justifyContent="center">
                  <Typography>Brightness</Typography>
                  <Slider
                    disabled={colorloopActive ? false : true}
                    valueLabelDisplay="auto"
                    value={brightness}
                    step={10}
                    onChange={(_event, newValue) => setBrightness(newValue)}
                    defaultValue={30} />
                </Grid>
                <Grid xs={12} item sx={{ display: 'flex', marginX: '20px', flexDirection: 'column' }} justifyContent="center">
                  <Typography>Temperature</Typography>
                  <Slider aria-label="Temperature"
                    disabled={colorloopActive ? false : true}
                    valueLabelDisplay="auto"
                    value={temp}
                    step={10}
                    min={153}
                    max={500}
                    onChange={(_event, newValue) => setTemp(newValue)}
                    defaultValue={30} />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} sx={{display: 'flex'}} justifyContent="center">
              <Card sx={{ minWidth: '300px', minHeight: '100px' }} >
                <CardActionArea className="rainbow" sx={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}  onClick={() => {
                  continueLooping.current = !continueLooping.current;
                  chaosMode();
                }}>
                  <Typography variant="h3" >Chaos Mode</Typography>
                </CardActionArea>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </main>
    </div>
  );
}

export default App;
