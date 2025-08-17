// components/BackButton.tsx
import React, {useState} from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Pressable,
  Button,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types/RootStackParamList';

export type ProScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'BoardSelectScreen'
>;

type ProjectItemProps = {
  project_id: number;
  name: string;
};

const ProjectItem = ({project_id, name}: ProjectItemProps) => {
  const navigation = useNavigation<ProScreenNavigationProp>();
  const [isHovered, setIsHovered] = useState(false);
  const [gearHovered, setGearHovered] = useState(false);

  const handleSettings = () => {
    Alert.alert('프로젝트 설정 변경 클릭');
  };

  return (
    // <TouchableOpacity
    //   style={styles.button}
    //   onPress={() =>
    //     navigation.navigate('BoardSelectScreen', {board_id: project_id})
    //   }>
    //   <Text style={styles.text}>{name}</Text>
    // </TouchableOpacity>
    <Pressable
      style={[
        styles.button,
        isHovered && styles.buttonHovered, // ✅ hover 시 스타일 변경
      ]}
      onPress={() =>
        navigation.navigate('BoardSelectScreen', {board_id: project_id})
      }
      onHoverIn={() => setIsHovered(true)} // ✅ 마우스 들어옴
      onHoverOut={() => setIsHovered(false)} // ✅ 마우스 나감
    >
      <Text style={[styles.text, isHovered && styles.textHovered]}>{name}</Text>
      {/* 오른쪽: 설정(톱니바퀴) 버튼 */}
      <Pressable
        style={[styles.gearBtn, gearHovered && styles.gearBtnHovered]}
        onPress={handleSettings}
        onHoverIn={() => setGearHovered(true)}
        onHoverOut={() => setGearHovered(false)}
        hitSlop={8}>
        <Button title="asdfg" />
      </Pressable>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 10,
  },
  buttonHovered: {
    backgroundColor: '#e0e7ff', // 연한 인디고 배경
  },
  text: {
    fontSize: 16,
    color: '#6366f1', // indigo
  },
  textHovered: {
    color: '#4338ca', // 더 진한 indigo
  },
  gearBtn: {
    padding: 8,
    borderRadius: 6,
    // 웹일 때 포인터 커서 주고 싶다면(react-native-web)
    // @ts-ignore
    cursor: 'pointer',
  },
  gearBtnHovered: {
    backgroundColor: '#eef2ff',
  },
});

export default ProjectItem;
