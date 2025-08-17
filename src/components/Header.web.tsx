// components/BackButton.tsx
import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Button,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {RootStackParamList} from '../types/RootStackParamList';

import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

type HeaderProps = {
  id: number | null;
  setId: (id: number | null) => void;
  name: string | null;
  setName: (name: string | null) => void;
};

export type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Login'
>;

const Header = ({id, setId, name, setName}: HeaderProps) => {
  // const navigation = useNavigation();
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const isLoggedIn = id != null && !!name?.trim();

  return (
    <View style={styles.header}>
      {/* {id != null && name != null && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            removeItem('id');
            removeItem('name');
            navigation.navigate('Login');
          }}>
          <Text style={styles.text}>로그아웃</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          removeItem('id');
          removeItem('name');
          navigation.navigate('Login');
        }}>
        <Text style={styles.text}>캐시 삭제</Text>
      </TouchableOpacity>
      <Text>헤더입니다.</Text> */}
      {/* <TouchableOpacity
        style={styles.button}
        onPress={() => {
          // removeItem('id');
          // removeItem('name');
          setId(0);
          setName('');
          navigation.navigate('Login');
        }}>
        <Text style={styles.text}>캐시 삭제</Text>
      </TouchableOpacity> */}
      {isLoggedIn && (
        <View>
          <Text style={styles.text}>
            로그인: {name} (ID: {id})
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              // removeItem('id');
              // removeItem('name');
              setId(null);
              setName(null);
              navigation.navigate('Login');
            }}>
            <Text style={styles.text}>로그아웃</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 10,
  },
  text: {
    fontSize: 16,
    color: '#6366f1', // indigo
  },
  header: {
    width: '100%',
    height: '8%',
    backgroundColor: '#00b7ffff',
    color: '#6366f1', // indigo
  },
});

export default Header;
