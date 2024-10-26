import "react-native-gesture-handler";

import React from "react";
import LoginScreen from "./components/LoginScreen";
import SignupScreen from "./components/SignupScreen";
import GetImageScreen from "./components/GetImageScreen";
import ResultScreen from "./components/ResultScreen";
import ActivityScreen from "./components/ActivityScreen";
import HistoryScreen from "./components/HistoryScreen";
import LogoutScreen from "./components/LogoutScreen";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { NativeBaseProvider } from "native-base";

const Stack = createStackNavigator();
const App = () => {
  return (
    <NativeBaseProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Signup"
            component={SignupScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="GetImage"
            component={GetImageScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Result"
            component={ResultScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Activity"
            component={ActivityScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="History"
            component={HistoryScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Logout"
            component={LogoutScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </NativeBaseProvider>
  );
};

export default App;
