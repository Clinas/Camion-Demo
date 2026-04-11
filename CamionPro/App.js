import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { StoreProvider } from './src/context/StoreContext';

import HomeScreen from './src/screens/HomeScreen';
import SourceSelectScreen from './src/screens/SourceSelectScreen';
import ScannerScreen from './src/screens/ScannerScreen';
import SummaryScreen from './src/screens/SummaryScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <StoreProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator 
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="SourceSelect" component={SourceSelectScreen} />
          <Stack.Screen name="Scanner" component={ScannerScreen} />
          <Stack.Screen name="Summary" component={SummaryScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </StoreProvider>
  );
}
