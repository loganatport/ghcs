import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { TabNavigator } from './TabNavigator';
import { RecordingScreen } from '../screens/RecordingScreen';
import { PreviewScreen } from '../screens/PreviewScreen';
import { VideoPlayerScreen } from '../screens/VideoPlayerScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const DarkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#0d0d0d',
    card: '#0d0d0d',
    text: '#FFFFFF',
    border: '#1a1a1a',
    notification: '#FF3B30',
    primary: '#FF3B30',
  },
};

export function RootNavigator() {
  return (
    <NavigationContainer theme={DarkTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen
          name="Recording"
          component={RecordingScreen}
          options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="Preview"
          component={PreviewScreen}
          options={{ presentation: 'fullScreenModal', animation: 'fade' }}
        />
        <Stack.Screen
          name="VideoPlayer"
          component={VideoPlayerScreen}
          options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
