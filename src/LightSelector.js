import { Card, CardActionArea, Grid } from "@mui/material";
import './App.css';

const LightBulbIcon = () => {
    return <div>
        <svg width="32px" height="32px" viewBox="0 0 32 32" version="1.1">
            <title>bulbFlood</title>
            <desc>Created with Sketch.</desc>
            <defs></defs>
            <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <g fill="#101010">
                    <path d="M8.1699,10.0847 C10.2199,10.7047 13.1699,10.9997 15.9999,10.9997 C18.8299,10.9997 21.7799,10.7047 23.8299,10.0847 L20.2109,14.3627 C19.8609,14.7747 19.6629,15.2937 19.6459,15.8337 L19.5019,20.9477 C19.4859,21.4647 19.0799,21.8807 18.5639,21.9157 C17.7739,21.9687 16.9199,21.9997 15.9999,21.9997 C15.0799,21.9997 14.2269,21.9687 13.4369,21.9157 C12.9199,21.8807 12.5139,21.4647 12.4979,20.9477 L12.3549,15.8337 C12.3369,15.2937 12.1389,14.7747 11.7889,14.3627 L8.1699,10.0847 Z M25,6.653 L25,6.654 L25,7.344 L25,7.345 L25,7.346 L25,7.604 C25,7.956 24.938,8.302 24.819,8.628 C23.554,9.278 20.542,10 16,10 C11.458,10 8.446,9.278 7.181,8.628 C7.063,8.301 7,7.956 7,7.604 L7,7.346 L7,7.344 L7,6.654 L7,6.653 C7,6.472 7.06,6.292 7.18,6.122 C8.01,4.912 11.65,4 16,4 C20.97,4 25,5.188 25,6.653 Z M13,22.862 C14.041,22.963 15.187,23 16,23 C16.813,23 17.959,22.963 19,22.862 L18.499,25.97 C18.473,26.188 18.367,26.39 18.199,26.543 L17.732,26.967 C17.701,26.996 17.672,27.027 17.645,27.059 L17.151,27.642 C16.961,27.868 16.672,28 16.365,28 L16,28 L15.635,28 C15.328,28 15.039,27.868 14.849,27.642 L14.355,27.059 C14.328,27.027 14.299,26.996 14.268,26.967 L13.801,26.543 C13.633,26.39 13.527,26.188 13.501,25.97 L13,22.862 Z"></path>
                </g>
            </g>
        </svg>
    </div>
}

export default function LightSelector({ lightArray, currLight, setLight }) {
    return (<Grid container justifyContent="center" spacing={2}>
        {lightArray.map(lightNum => (
            <Grid key={lightNum} item>
                <Card sx={{ width: '100px', height: '100px'}}>
                    <CardActionArea className={lightNum === currLight ? "active-button" : ''} width="100%" sx={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems:"space-evenly" }} onClick={() => setLight(lightNum)}>
                    <LightBulbIcon />
                        {lightNum}
                    </CardActionArea>
                </Card>
            </Grid>
        ))}
    </Grid>);
}
