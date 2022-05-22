import express from "express";
import cors from 'cors';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import bodyParser from "body-parser";

function absPath(relPath: string){
    if (path.isAbsolute(relPath)){
        return relPath;
    };
    return path.join(__dirname, relPath);
}

if (fs.existsSync(absPath('stream'))){
    fs.rmSync(absPath('stream'), {recursive: true});
    fs.mkdirSync(absPath('stream'));
} else {
    fs.mkdirSync(absPath('stream'));
}
let output = '';
let errors = '';
const ffmpegParams = [
    '-f', 's16le', '-ar', '8000', '-i', '-','-c:a', 'aac', '-b:a', '16k', '-ac', '1', '-f', 'dash', '-window_size', '999', '-seg_duration', '1.68', absPath('stream/stream.mpd')
]
const ffmpeg = spawn('ffmpeg', ffmpegParams);
ffmpeg.stdout.on('data', (data) => {
    output += data.toString();
})
ffmpeg.stderr.on('data', (data) => {
    errors += data.toString();
})


const app = express();
const port = 5000; // default port to listen
app.use(cors());
app.use(bodyParser.raw({'type': 'application/mpeg'}))
app.use('/listen', express.static(absPath('stream')))
// define a route handler for the default home page
app.get("/", (req, res) => {
    res.send(`${ffmpegParams}\r\n\r\nErrors:\r\n${errors}\r\nOutput:\r\n${output}`);
});

app.put('/audio', (req, res) => {
    ffmpeg.stdin.write(req.body);
    const seq = Number.parseInt(req.headers.seq as string);
    console.log(`seq ${req.headers.seq} ${new Date(Date.now()).toISOString()} sent at ${req.headers.ts} total secs; ${1.68 * seq}`);
    res.send(JSON.stringify({
        ts: new Date(Date.now()).toISOString()
    }));
});

// start the Express server
app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});

// const readStream = fs.createReadStream('/data/dev/icecast/AesopsFables64kbps_librivox.mp3', {highWaterMark: 4096})
// readStream.on('readable', ()=>{
//     console.log(`${new Date(Date.now()).toISOString()}: ready`);
//     setTimeout(()=>{
//         let chunk: Buffer;
//         if ((chunk = readStream.read(4096)) != null){
//             ffmpeg.stdin.write(chunk);
//             console.log(`${new Date(Date.now()).toISOString()} read ${chunk.byteLength} bytes`);
//         }
//     }, 250);
// });
