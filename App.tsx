import React, {useEffect, useState} from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
// import {Colors, Header} from 'react-native/Libraries/NewAppScreen';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import Header from './src/components/Header';

// 👇 Login 스크린 import (만약 상대 경로 다르면 수정)
import Login from './src/screen/Login';
import Signup from './src/screen/SignUp';
import BoardScreen from './src/screen/BoardScreen';
import ProjectSelectScreen from './src/screen/ProjectSelectScreen';
import BoardSelectScreen from './src/screen/BoardSelectScreen';
// import BoardScreen from './src/screen/BoardScreen_2';

const Stack = createNativeStackNavigator();

// const HomeScreen = ({navigation}: any) => {
//   const isDarkMode = useColorScheme() === 'dark';
//   const backgroundStyle = {
//     backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
//   };

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       navigation.navigate('Login');
//     }, 5000);
//     return () => clearTimeout(timer);
//   }, [navigation]);

//   return (
//     <View style={[{flex: 1}, backgroundStyle]}>
//       <StatusBar
//         barStyle={isDarkMode ? 'light-content' : 'dark-content'}
//         backgroundColor={backgroundStyle.backgroundColor}
//       />
//       <ScrollView style={backgroundStyle}>
//         <View style={{padding: '5%'}}>
//           <Header />
//           <Text style={{marginTop: 20, fontSize: 18}}>
//             5초 후 로그인 화면으로 이동합니다.
//           </Text>
//         </View>
//       </ScrollView>
//     </View>
//   );
// };

const App = () => {
  const [id, setId] = useState<number | null>(null);
  const [name, setName] = useState<string | null>(null);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Header id={id} setId={setId} name={name} setName={setName} />
          <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{headerShown: false}}>
            {/* <Stack.Screen name="Home" component={HomeScreen} /> */}
            <Stack.Screen name="Login">
              {props => (
                <Login
                  {...props}
                  id={id}
                  setId={setId}
                  name={name}
                  setName={setName}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Signup" component={Signup} />
            <Stack.Screen name="BoardScreen" component={BoardScreen} />
            <Stack.Screen name="ProjectSelectScreen">
              {props => <ProjectSelectScreen {...props} id={id} name={name} />}
            </Stack.Screen>
            <Stack.Screen name="BoardSelectScreen">
              {props => <BoardSelectScreen {...props} id={id} name={name} />}
            </Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
