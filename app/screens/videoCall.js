import React, {useRef, useEffect, useContext} from 'react';
import {StyleSheet, View, Text, TouchableOpacity, Alert} from 'react-native';

import {
  TwilioVideoLocalView,
  TwilioVideoParticipantView,
  TwilioVideo,
} from 'react-native-twilio-video-webrtc';

import {AppContext, initialState} from '../../App';

const styles = StyleSheet.create({});

export const VideoCallScreen = ({navigation}) => {
  const twilioVideo = useRef(null);
  const {props, setProps} = useContext(AppContext);

  useEffect(() => {
    twilioVideo.current &&
      twilioVideo.current.connect({
        roomName: props.roomName,
        accessToken: props.token,
      });
    setProps({...props, status: 'connecting'});
    return () => {
      _onEndButtonPress();
    };
  }, [twilioVideo, props.token]);

  const _onEndButtonPress = () => {
    twilioVideo.current.disconnect();
    setProps(initialState);
  };

  const _onMuteButtonPress = () => {
    twilioVideo.current
      .setLocalAudioEnabled(!props.isAudioEnabled)
      .then(isEnabled => setProps({...props, isAudioEnabled: isEnabled}));
  };

  const _onFlipButtonPress = () => {
    twilioVideo.current.flipCamera();
  };

  return (
    (props.status === 'connected' || props.status === 'connecting') && (
      <View style={{height: 400, width: 400, backgroundColor: '#900'}}>
        <Text>STATUS: {props.status}</Text>
        {props.status === 'connected' && (
          <View style={styles.grid}>
            {Array.from(props.videoTracks, ([trackSid, trackIdentifier]) => (
              <TwilioVideoParticipantView
                style={{backgroundColor: '#999', width: 400, height: 400}}
                key={trackSid}
                trackIdentifier={trackIdentifier}
              />
            ))}
          </View>
        )}
        <Text>{props.token}</Text>
        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.button} onPress={_onEndButtonPress}>
            <Text style={styles.buttonText}>End</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={_onMuteButtonPress}>
            <Text style={styles.buttonText}>
              {props.isAudioEnabled ? 'Mute' : 'Unmute'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={_onFlipButtonPress}>
            <Text style={styles.buttonText}>Flip</Text>
          </TouchableOpacity>
        </View>
        <TwilioVideo
          ref={twilioVideo}
          onRoomDidConnect={() => {
            setProps({...props, status: 'connected'});
          }}
          onRoomDidDisconnect={() => {
            setProps({...props, status: 'disconnected'});
            navigation.goBack();
          }}
          onRoomDidFailToConnect={error => {
            Alert.alert('Error', error.error);
            setProps({...props, status: 'disconnected'});
            navigation.goBack();
          }}
          onParticipantAddedVideoTrack={({participant, track}) => {
            if (track.enabled) {
              setProps({
                ...props,
                videoTracks: new Map([
                  ...props.videoTracks,
                  [
                    track.trackSid,
                    {
                      participantSid: participant.sid,
                      videoTrackSid: track.trackSid,
                    },
                  ],
                ]),
              });
            }
          }}
          onParticipantRemovedVideoTrack={({track}) => {
            const videoTracks = props.videoTracks;
            videoTracks.delete(track.trackSid);
            setProps({...props, videoTracks});
          }}
        />
      </View>
    )
  );
};
