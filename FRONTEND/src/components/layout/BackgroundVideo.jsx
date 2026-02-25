
const BackgroundVideo = ({ src }) => {
  return (
    <>
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-60"
      >
        <source src={src} type="video/mp4" />
      </video>
      {/* Cinematic Tint */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
    </>
  );
};

export default BackgroundVideo;