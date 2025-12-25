import YouTube from "react-youtube";

const YouTubePlayer = ({ videoId, playing }: any) => {
  return (
    <div className="aspect-video mb-6">
      <YouTube
        videoId={videoId}
        opts={{
          width: "100%",
          height: "100%",
          playerVars: {
            autoplay: playing ? 1 : 0,
          },
        }}
      />
    </div>
  );
};

export default YouTubePlayer;
