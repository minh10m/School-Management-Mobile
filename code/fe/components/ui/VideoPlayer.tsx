import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import YoutubePlayer from 'react-native-youtube-iframe';

interface VideoPlayerProps {
  url: string;
  autoPlay?: boolean;
  loop?: boolean;
}

// Sub-component cho trình phát Native (expo-video)
const NativeVideoPlayer = ({ url, autoPlay, loop }: VideoPlayerProps) => {
  const player = useVideoPlayer({ uri: url, useCaching: true }, (player) => {
    player.loop = loop ?? false;
    player.bufferOptions = {
      preferredForwardBufferDuration: 2,
      waitsToMinimizeStalling: true,
    };
    if (autoPlay) {
      player.play();
    }
  });

  const { status } = player;

  const openInBrowser = async () => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (e) {
      console.error(e);
    }
  };

  if (status === 'error') {
    return (
      <View className="w-full aspect-video bg-gray-900 items-center justify-center rounded-2xl p-4">
        <Ionicons name="alert-circle-outline" size={40} color="#EF4444" />
        <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-white mt-2 text-xs text-center">
          Không thể phát trực tiếp định dạng video này
        </Text>
        <TouchableOpacity 
          onPress={openInBrowser}
          className="mt-4 bg-white/10 px-4 py-2 rounded-xl flex-row items-center border border-white/20"
        >
          <Ionicons name="open-outline" size={16} color="white" />
          <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-white text-xs ml-2">
            Mở qua trình duyệt ngoài
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="w-full h-full">
      <VideoView
        player={player}
        style={styles.video}
        allowsFullscreen
        allowsPictureInPicture
        contentFit="contain"
      />
      {status === 'loading' && (
        <View className="absolute inset-0 items-center justify-center bg-black/20">
          <ActivityIndicator size="large" color="#136ADA" />
        </View>
      )}
    </View>
  );
};

export const VideoPlayer = ({ url, autoPlay = false, loop = false }: VideoPlayerProps) => {
  const [playing, setPlaying] = useState(autoPlay);

  // Hàm trích xuất ID từ link YouTube
  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const youtubeId = getYoutubeId(url);

  return (
    <View className="w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-lg">
      {youtubeId ? (
        <YoutubePlayer
          height={'100%'}
          play={playing}
          videoId={youtubeId}
          onChangeState={(state: string) => {
             if (state === 'ended' && loop) setPlaying(true);
          }}
        />
      ) : (
        <NativeVideoPlayer url={url} autoPlay={autoPlay} loop={loop} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  video: {
    width: '100%',
    height: '100%',
  },
});
