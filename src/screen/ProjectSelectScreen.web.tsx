import React, {useEffect, useRef, useState} from 'react';
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
  Modal,
  Pressable,
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
  const navigation = useNavigation<RoomSelectNavigationProp>();

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [projectName, setProjectName] = useState('');

  const inputRef = useRef<TextInput>(null);

  const onPressModalOpen = () => {
    console.log('팝업을 여는 중입니다.');
    setIsModalVisible(true);
  };

  const onPressModalClose = () => {
    setIsModalVisible(false);
  };

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

  useEffect(() => {
    if (isModalVisible) {
      // Modal 애니메이션이 끝난 뒤 포커스 주기 (딜레이를 주면 안전)
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isModalVisible]);

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
        <TouchableOpacity style={styles.bigButton} onPress={onPressModalOpen}>
          <Text style={styles.bigButtonText}>프로젝트 생성</Text>
        </TouchableOpacity>
      </View>
      <Modal animationType="slide" visible={isModalVisible} transparent={true}>
        {/* 백드롭: 화면 전체 덮고 클릭 시 닫기 */}
        <Pressable style={styles.backdrop} onPress={onPressModalClose}>
          {/* 모달 콘텐츠: 내부 클릭은 닫기 이벤트 버블링 방지 */}
          <Pressable
            style={styles.modalView}
            onPress={e => e.stopPropagation()}>
            <View>
              <Text style={styles.modalTextStyle}>
                생성할 프로젝트의 이름을 입력해 주세요.
              </Text>
            </View>
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={projectName}
              onChangeText={setProjectName}
              autoCapitalize="none"
            />
            <Button title="생성" />

            <Pressable onPress={onPressModalClose}>
              <Text>취소</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default ProjectSelectScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    flexDirection: 'row', // ✅ row로 변경
    // alignItems/justifyContent는 빼거나 기본값으로
  },
  innerContainer: {
    flex: 1, // ✅ 남은 영역 전부 차지
    alignItems: 'center', // ✅ 가로 중앙
    justifyContent: 'center', // ✅ 세로 중앙
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
    // marginTop: 16,
    backgroundColor: '#6366f1',
    // paddingVertical: 12,
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
    // position: 'absolute',       // ❌ 제거
    // top: 0,
    // left: 0,
    width: '30%', // ✅ 고정 폭 컬럼
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
  bigButton: {
    width: 200, // 버튼 너비
    height: 60, // 버튼 높이
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  bigButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // 반투명 검정
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ✅ 모달 박스 (가운데 뜨도록 marginTop 제거)
  modalView: {
    // marginTop: 230,  // ❌ 제거
    margin: 30,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    // 선택: 너비 제어
    // width: '80%', maxWidth: 420,
  },

  modalTextStyle: {
    color: '#17191c',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 50,
  },
});
