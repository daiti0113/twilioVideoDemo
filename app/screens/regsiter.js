import React, {useEffect, useContext} from 'react';
import {
  checkMultiple,
  request,
  requestMultiple,
  PERMISSIONS,
  RESULTS,
} from 'react-native-permissions';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {AppContext} from '../../App';

const styles = StyleSheet.create({});

export const RegisterScreen = ({navigation}) => {
  const {props, setProps} = useContext(AppContext);
  useEffect(() => {
    _checkPermissions();
  }, []);
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.form}>
          <View style={styles.formGroup}>
            <Text style={styles.text}>User Name</Text>
            <TextInput
              style={styles.textInput}
              autoCapitalize="none"
              value={props.userName}
              onChangeText={text => setProps({...props, userName: text})}
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.text}>Room Name</Text>
            <TextInput
              style={styles.textInput}
              autoCapitalize="none"
              value={props.roomName}
              onChangeText={text => setProps({...props, roomName: text})}
            />
          </View>
          <View style={styles.formGroup}>
            <TouchableOpacity
              disabled={false}
              style={styles.button}
              onPress={() => {
                _checkPermissions(() => {
                  fetch(
                    `https://token-service-4651-dev.twil.io/token?identity=${props.userName}`,
                  )
                    .then(response => {
                      if (response.ok) {
                        response.text().then(jwt => {
                          const res = JSON.parse(jwt);
                          setProps({...props, token: res.accessToken});
                          navigation.navigate('Video Call');
                          return true;
                        });
                      } else {
                        response.text().then(error => {
                          Alert.alert(error);
                        });
                      }
                    })
                    .catch(error => {
                      console.log('error', error);
                      Alert.alert('API not available');
                    });
                });
              }}>
              <Text style={styles.buttonText}>Connect to Video Call</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const _checkPermissions = callback => {
  const iosPermissions = [PERMISSIONS.IOS.CAMERA, PERMISSIONS.IOS.MICROPHONE];
  const androidPermissions = [
    PERMISSIONS.ANDROID.CAMERA,
    PERMISSIONS.ANDROID.RECORD_AUDIO,
  ];
  checkMultiple(
    Platform.OS === 'ios' ? iosPermissions : androidPermissions,
  ).then(statuses => {
    const [CAMERA, AUDIO] =
      Platform.OS === 'ios' ? iosPermissions : androidPermissions;
    if (
      statuses[CAMERA] === RESULTS.UNAVAILABLE ||
      statuses[AUDIO] === RESULTS.UNAVAILABLE
    ) {
      Alert.alert('Error', 'Hardware to support video calls is not available');
    } else if (
      statuses[CAMERA] === RESULTS.BLOCKED ||
      statuses[AUDIO] === RESULTS.BLOCKED
    ) {
      Alert.alert(
        'Error',
        'Permission to access hardware was blocked, please grant manually',
      );
    } else {
      if (
        statuses[CAMERA] === RESULTS.DENIED &&
        statuses[AUDIO] === RESULTS.DENIED
      ) {
        requestMultiple(
          Platform.OS === 'ios' ? iosPermissions : androidPermissions,
        ).then(newStatuses => {
          if (
            newStatuses[CAMERA] === RESULTS.GRANTED &&
            newStatuses[AUDIO] === RESULTS.GRANTED
          ) {
            callback && callback();
          } else {
            Alert.alert('Error', 'One of the permissions was not granted');
          }
        });
      } else if (
        statuses[CAMERA] === RESULTS.DENIED ||
        statuses[AUDIO] === RESULTS.DENIED
      ) {
        request(statuses[CAMERA] === RESULTS.DENIED ? CAMERA : AUDIO).then(
          result => {
            if (result === RESULTS.GRANTED) {
              callback && callback();
            } else {
              Alert.alert('Error', 'Permission not granted');
            }
          },
        );
      } else if (
        statuses[CAMERA] === RESULTS.GRANTED ||
        statuses[AUDIO] === RESULTS.GRANTED
      ) {
        callback && callback();
      }
    }
  });
};
