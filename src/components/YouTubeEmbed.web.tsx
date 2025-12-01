import React from 'react';

interface YouTubeEmbedProps {
  videoId: string;
  onPlay?: () => void;
}

const wrapperStyle: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  borderRadius: 12,
  overflow: 'hidden',
  backgroundColor: '#000000',
};

const iframeStyle: React.CSSProperties = {
  width: '100%',
  height: '315px',
  border: '0',
};

const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({ videoId, onPlay }) => {
  return (
    <div
      className="youtube-wrapper"
      style={{
        ...wrapperStyle,
        cursor: onPlay ? 'pointer' : 'default',
      }}
      onClick={onPlay}
    >
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={iframeStyle}
      />
    </div>
  );
};

export default YouTubeEmbed;

