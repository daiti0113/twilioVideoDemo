import React, {useState} from 'react';
import {StatusBar, Dimensions} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {RegisterScreen} from './app/screens/regsiter';
import {VideoCallScreen} from './app/screens/videoCall';

const Stack = createStackNavigator();
export const initialState = {
  isAudioEnabled: true,
  status: 'disconnected',
  participants: new Map(),
  videoTracks: new Map(),
  userName: '',
  roomName: '',
  token: '',
};

export const AppContext = React.createContext(initialState);

const dimensions = Dimensions.get('window');

export default () => {
  const [props, setProps] = useState(initialState);

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <AppContext.Provider value={{props, setProps}}>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Video Call" component={VideoCallScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AppContext.Provider>
    </>
  );
};
