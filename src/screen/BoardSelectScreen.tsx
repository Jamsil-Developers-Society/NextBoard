import React, {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
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
import {getItem} from '../utils/Storage';

import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../types/RootStackParamList';

export type RoomSelectNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'BoardScreen'
>;

const BoardSelectScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigation = useNavigation<RoomSelectNavigationProp>();

  const user_id = (async () => {
    const raw = await getItem('id');
    const parsed = parseInt(raw ?? '', 10);
    return isNaN(parsed) ? 0 : parsed;
  })();

  const handleCreate = async () => {
    // navigation.navigate('BoardScreen', {id: await user_id});
    navigation.navigate('BoardScreen');
  };

  const handleJoin = async () => {
    // navigation.navigate('BoardScreen', {id: await user_id, roomId: 1});
    navigation.navigate('BoardScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <Button onPress={handleCreate} title="프로젝트 생성"></Button>
        {/* <Button onPress={handleJoin} title="방 참여"></Button> */}
      </View>
    </SafeAreaView>
  );
};

export default BoardSelectScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerContainer: {
    width: '90%',
    maxWidth: 290,
  },
  heading: {
    fontSize: 32,
    fontWeight: '600',
    color: '#1f2937', // coolGray.800
  },
  subheading: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563', // coolGray.600
    marginTop: 4,
  },
  formGroup: {
    marginTop: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  linkRight: {
    alignSelf: 'flex-end',
    marginTop: 6,
  },
  linkText: {
    fontSize: 12,
    color: '#6366f1', // indigo.500
    fontWeight: '500',
  },
  button: {
    marginTop: 16,
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  footer: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#4b5563',
  },
  footerLink: {
    marginLeft: 4,
  },
});
