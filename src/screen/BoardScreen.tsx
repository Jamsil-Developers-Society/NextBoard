import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Button,
  Text,
  TouchableOpacity,
  StyleSheet,
  PanResponder,
  useWindowDimensions,
} from 'react-native';
import Slider from '@react-native-community/slider';
import {
  Canvas,
  Path,
  Skia,
  useCanvasRef,
} from '@shopify/react-native-skia';
import type { SkPath } from '@shopify/react-native-skia';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';

interface DrawPath {
  path: SkPath;
  color: string;
  strokeWidth: number;
  points: { x: number; y: number }[];
}

const BoardScreen: React.FC = () => {
  const [color, setColor] = useState('#000000');
  const [mode, setMode] = useState<'pen' | 'eraser'>('pen');
  const [lineWidth, setLineWidth] = useState(4);
  const pathsRef = useRef<DrawPath[]>([]);
  const [paths, setPaths] = useState<DrawPath[]>([]);
  const currentPath = useRef<DrawPath | null>(null);
  const canvasRef = useCanvasRef();
  const socketRef = useRef<WebSocket | null>(null);
  const canvasLayout = useRef({ y: 0 });
  const { height: windowHeight } = useWindowDimensions();
  const route = useRoute();
  const [userList, setUserList] = useState<{ id: string; name: string }[]>([]);
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  // 최신 상태 참조를 위한 ref
  const modeRef = useRef(mode);
  const colorRef = useRef(color);
  const lineWidthRef = useRef(lineWidth);
  const [, forceUpdate] = useState(0);

  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { colorRef.current = color; }, [color]);
  useEffect(() => { lineWidthRef.current = lineWidth; }, [lineWidth]);

  // WebSocket 연결
  useEffect(() => {
    const socket = new WebSocket('wss://nextboard-api.hooiam.net/ws');
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('WebSocket 연결됨');
      socket.send(JSON.stringify({ type: 'join' }));
    };

    socket.onmessage = event => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'user_list') {
          setUserList(data.users || []);
        }

        if (data.type === 'chat') {
          setChatMessages(prev => [...prev, data.message]);
        }

        if (data.type === 'draw') {
          const { color, strokeWidth, point } = data;
          // 필요한 속성이 모두 있는지 확인
          if (color && strokeWidth && point) {
            const newPath = Skia.Path.Make();
            newPath.moveTo(point.x, point.y);
            newPath.lineTo(point.x + 0.1, point.y + 0.1);

            const newDrawPath: DrawPath = {
              path: newPath,
              color,
              strokeWidth,
              points: [point],
            };

            setPaths(prev => [...prev, newDrawPath]);
          } else {
            console.error('Draw 메시지에 필요한 데이터가 누락되었습니다:', data);
          }
        }
      } catch (err) {
        console.error('메시지 파싱 오류:', err);
      }
    };

    socket.onerror = e => {
      console.error('WebSocket 오류:', e);
    };

    socket.onclose = () => {
      console.log('WebSocket 연결 종료');
    };

    return () => {
      socket.close();
    };
  }, []);

  // 그림 그리기 동작
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: e => {
        const { pageX, pageY } = e.nativeEvent;
        const x = pageX;
        const y = pageY - canvasLayout.current.y;

        const path = Skia.Path.Make();
        path.moveTo(x, y);

        currentPath.current = {
          path,
          color: modeRef.current === 'pen' ? colorRef.current : '#ffffff',
          strokeWidth: lineWidthRef.current,
          points: [{ x, y }],
        };
      },
      onPanResponderMove: e => {
        const { pageX, pageY } = e.nativeEvent;
        const x = pageX;
        const y = pageY - canvasLayout.current.y;

        if (currentPath.current) {
          currentPath.current.path.lineTo(x, y);
          currentPath.current.points.push({ x, y });

          if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(
              JSON.stringify({
                command: 'draw_board',
                type: 'draw',
                color: currentPath.current.color,
                strokeWidth: currentPath.current.strokeWidth,
                point: { x, y },
              })
            );
          }

          forceUpdate(n => n + 1);
        }
      },
      onPanResponderRelease: () => {
        if (currentPath.current) {
          setPaths(prev => [...prev, currentPath.current!]); // 새로운 배열을 생성합니다.
          currentPath.current = null;
        }
      },
    })
  ).current;

  const clearCanvas = () => {
    pathsRef.current = [];
    setPaths([]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View
        style={{ flex: 1 }}
        onLayout={e => {
          canvasLayout.current.y = e.nativeEvent.layout.y;
        }}
      >
        <Canvas ref={canvasRef} style={styles.canvas}>
          {paths.map((p, i) => (
            <Path
              key={i}
              path={p.path}
              color={p.color}
              style="stroke"
              strokeWidth={p.strokeWidth}
            />
          ))}
          {currentPath.current && (
            <Path
              path={currentPath.current.path}
              color={currentPath.current.color}
              style="stroke"
              strokeWidth={currentPath.current.strokeWidth}
            />
          )}
        </Canvas>

        {/* 오른쪽 유저 리스트 */}
        <View style={styles.sidebar}>
          <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>접속 유저</Text>
          {userList.map(user => (
            <Text key={user.id} style={{ marginBottom: 5 }}>
              {user.name}
            </Text>
          ))}
        </View>

        {/* 터치 오버레이 */}
        <View
          style={StyleSheet.absoluteFill}
          {...panResponder.panHandlers}
          pointerEvents="box-only"
        />
      </View>

      <View style={styles.controls}>
          {/* 채팅 영역 */}
        <View style={styles.chatContainer}>
          {chatMessages.slice(-3).map((msg, idx) => (
            <Text key={idx} style={styles.chatMessage}>{msg}</Text>
          ))}
        </View>

        <Text style={styles.label}>펜 색상</Text>
        <View style={styles.colorPalette}>
          {['#000000', '#ff0000', '#00aa00', '#0000ff'].map(c => (
            <TouchableOpacity
              key={c}
              style={[
                styles.colorSwatch,
                { backgroundColor: c },
                c === color && styles.selectedColor,
              ]}
              onPress={() => setColor(c)}
            />
          ))}
        </View>

        <Text style={styles.label}>굵기: {lineWidth}px</Text>
        <Slider
          minimumValue={1}
          maximumValue={20}
          step={1}
          value={lineWidth}
          onValueChange={setLineWidth}
          style={{ width: '100%' }}
        />

        <View style={styles.buttonRow}>
          <Button title="펜" onPress={() => setMode('pen')} />
          <Button title="지우개" onPress={() => setMode('eraser')} />
          <Button title="전체 지우기" onPress={clearCanvas} />
          <Button title="유저 초대" onPress={() => console.log('invite')} />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default BoardScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  canvas: { flex: 1 },
  sidebar: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 100,
    height: '100%',
    backgroundColor: '#f0f0f0',
    borderLeftWidth: 1,
    borderColor: '#ccc',
    padding: 10,
  },
  controls: { padding: 10, backgroundColor: '#eee' },
  label: { fontWeight: 'bold', marginBottom: 4 },
  colorPalette: { flexDirection: 'row', marginBottom: 10 },
  colorSwatch: {
    width: 30,
    height: 30,
    marginRight: 10,
    borderRadius: 15,
  },
  selectedColor: { borderWidth: 2, borderColor: '#333' },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
chatContainer: {
  backgroundColor: '#fff',
  padding: 5,
  marginBottom: 5,
  borderRadius: 5,
  borderWidth: 1,
  borderColor: '#ccc',
},
chatMessage: {
  fontSize: 14,
  color: '#333',
},

});
