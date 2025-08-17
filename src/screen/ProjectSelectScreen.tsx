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
import ProjectItem from '../components/ProjectItem';

export type RoomSelectNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'BoardSelectScreen'
>;

type ProjectSelectScreenProps = {
  id: number | null;
  name: string | null;
};

const ProjectSelectScreen = ({id, name}: ProjectSelectScreenProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigation = useNavigation<RoomSelectNavigationProp>();

  // const user_id = (async () => {
  //   const raw = await getItem('id');
  //   const parsed = parseInt(raw ?? '', 10);
  //   return isNaN(parsed) ? 0 : parsed;
  // })();

  const handleCreate = async () => {
    navigation.navigate('BoardSelectScreen', {});
  };

  const handleJoin = async (boardId: number) => {
    navigation.navigate('BoardSelectScreen', {board_id: boardId});
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.projectListBar}>
        <View style={styles.projectListBarHeader}>
          <Text style={styles.projectListBarHeaderText}>프로젝트 리스트</Text>
        </View>
        <View>
          <ProjectItem project_id={1} name="asdfg" />
        </View>
        <View>
          <ProjectItem project_id={2} name="테스트 입니다" />
        </View>
      </View>
      <View style={styles.innerContainer}>
        <Button onPress={handleCreate} title="프로젝트 생성"></Button>
        {/* <Button onPress={handleJoin} title="방 참여"></Button> */}
      </View>
    </SafeAreaView>
  );
};

export default ProjectSelectScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerContainer: {
    width: '80%',
    top: 0,
    right: 0,
    // maxWidth: 290,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
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
  projectListBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '30%',
    height: '100%',
    backgroundColor: '#616161ff',
    borderLeftWidth: 1,
    borderColor: '#ccc',
    padding: 10,
  },
  projectListBarHeader: {
    borderBottomWidth: 3,
    borderBottomColor: '#00000088',
  },
  projectListBarHeaderText: {
    fontSize: 24,
  },
});
