export async function getLyrics(
  artist: string,
  title: string
): Promise<string> {
  const res = await fetch(
    `https://api.lyrics.ovh/v1/${encodeURIComponent(
      artist
    )}/${encodeURIComponent(title)}`
  );

  if (!res.ok) throw new Error('Lyrics not found');

  const data = await res.json();
  return data.lyrics;
}


export function splitLyrics(lyrics: string) {
  return lyrics
    .split('\n')
    .filter(Boolean)
    .map((line, i) => ({
      time: i * 3,
      endTime: i * 3 + 3,
      text: line,
    }));
}

export async function getChords(song: string) {
  const res = await fetch(
    `https://ultimateguitar.com/search.php?search_type=title&value=${encodeURIComponent(song)}`
  );

  return res.text(); // parse chords from HTML
}


export async function getTabs(song: string) {
  const res = await fetch(
    `https://www.songsterr.com/a/ra/songs.json?pattern=${encodeURIComponent(song)}`
  );

  return res.json();
}
