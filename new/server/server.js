const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");

const app = express();
app.use(cors());

app.get("/audio", (req, res) => {
  const videoId = req.query.id;
  if (!videoId) return res.status(400).send("Missing id");

  const url = `https://www.youtube.com/watch?v=${videoId}`;

  // Correct headers for MP3 streaming
  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Accept-Ranges", "bytes");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Cache-Control", "no-store");
  // Use spawn instead of exec (exec has a 1MB buffer limit!)
  const process = spawn("c:\\tools\\yt-dlp.exe", [
    "-f", "bestaudio",
    "--audio-format", "mp3",
    "-o", "-",
    url
  ]);

  process.stdout.pipe(res);

  process.stderr.on("data", (data) => {
    console.log("yt-dlp:", data.toString());
  });

  process.on("close", () => {
    res.end();
  });
});
app.get("/captions", (req, res) => {
  const videoId = req.query.id;
  if (!videoId) return res.status(400).send("Missing id");

  const url = `https://www.youtube.com/watch?v=${videoId}`;

 const process = spawn("c:\\tools\\yt-dlp.exe", [
  "--js-runtime", "node",
  "--write-subs",
  "--write-auto-subs",
  "--sub-langs", "en,en-US,en-GB,en-CA,en-IN,a.en",
  "--sub-format", "json3",
  "--skip-download",
  "-o", "-",
  url
]);

  let output = "";

  process.stdout.on("data", chunk => {
    output += chunk.toString();
  });

  process.stderr.on("data", err => {
    console.log("yt-dlp:", err.toString());
  });

  process.on("close", () => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-store");

    if (!output.trim()) {
      return res.status(404).send("No English captions found");
    }

    res.send(output);
  });
});

app.get("/lyrics-cache/:songId.json", (req, res) => {
  const file = path.join("lyrics-cache", `${req.params.songId}.json`);
  if (!fs.existsSync(file)) return res.status(404).end();
  res.sendFile(path.resolve(file));
});

app.post("/analyze-lyrics", async (req, res) => {
  const { songId, lyrics } = req.body;

  const analyzed = await generateTimingAndPitch(lyrics);

  fs.writeFileSync(
    path.join("lyrics-cache", `${songId}.json`),
    JSON.stringify(analyzed, null, 2)
  );

  res.json({ success: true });
});



app.listen(3001, () => {
  console.log("YouTube audio proxy running on http://localhost:3001");
});
