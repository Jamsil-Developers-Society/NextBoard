import React, {useRef, useState, useEffect} from 'react';
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
  Path as SkiaPath,
  useCanvasRef,
} from '@shopify/react-native-skia';
import type {SkPath} from '@shopify/react-native-skia';
import {SafeAreaView} from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';


interface DrawPath {
  path: SkPath;
  color: string;
  strokeWidth: number;
  points: {x: number; y: number}[]; // 추가
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
  const canvasHeightRef = useRef<number>(0); // 캔버스 실제 높이 저장
  const {height: windowHeight} = useWindowDimensions();
  const canvasLayout = useRef({y: 0});
  const route = useRoute();
  //const { id, roomId } = route.params as { id: string; roomId?: number };
  const [userList, setUserList] = useState<{ id: string; name: string }[]>([]);


  useEffect(() => {
    const socket = new WebSocket('wss://nextboard-api.hooiam.net/ws');

    socketRef.current = socket;

    socket.onopen = () => {
      console.log('WebSocket 연결됨');

      // 유저 정보 전송
      socket.send(JSON.stringify({
        type: 'join',
        //user_id: id,
        //room_id: roomId, // roomId가 없을 경우 undefined
      }));

      socket.onmessage = event => {
        const message = JSON.parse(event.data);
        const data = JSON.parse(event.data);
      
        if (data.type === 'user_list') {
          setUserList(data.users); // [{ id: 'abc', name: '홍길동' }, ...]
        }
          


        if (message.type === 'draw') {
          const {color, strokeWidth, point} = message;

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
        }
      };
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

  const [, forceUpdate] = useState(0);
  // 상태 값의 최신 참조를 위한 ref 추가
  const modeRef = useRef(mode);
  const colorRef = useRef(color);
  const lineWidthRef = useRef(lineWidth);
  // 상태가 바뀔 때마다 ref를 갱신
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    colorRef.current = color;
  }, [color]);

  useEffect(() => {
    lineWidthRef.current = lineWidth;
  }, [lineWidth]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: e => {
        const {pageX, pageY} = e.nativeEvent;
        const x = pageX;
        const y = pageY - canvasLayout.current.y;

        const path = Skia.Path.Make();
        path.moveTo(x, y);

        currentPath.current = {
          path,
          color: modeRef.current === 'pen' ? colorRef.current : '#ffffff',
          strokeWidth: lineWidthRef.current,
          points: [{x, y}],
        };
      },
      onPanResponderMove: e => {
        const {pageX, pageY} = e.nativeEvent;
        const x = pageX;
        const y = pageY - canvasLayout.current.y;

        if (currentPath.current) {
          currentPath.current.path.lineTo(x, y);
          currentPath.current.points.push({x, y});

          if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(
              JSON.stringify({
                command: 'draw_board',
                type: 'draw',
                //user_id: id,
                //room_id: roomId, // roomId가 없을 경우 undefined
                color: currentPath.current.color,
                strokeWidth: currentPath.current.strokeWidth,
                point: {x, y},
              }),
            );
          }

          //canvasRef.current?.redraw();
          // ✅ 실시간 갱신 유도
          forceUpdate(n => n + 1);
        }
      },
      onPanResponderRelease: () => {
        if (currentPath.current) {
          const finalizedPath = currentPath.current;
          setPaths(prev => [...prev, finalizedPath]);
          currentPath.current = null;
        }
      },
    }),
  ).current;

  const clearCanvas = () => {
    pathsRef.current = [];
    setPaths([]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View
        style={{flex: 1}}
        onLayout={e => {
          canvasLayout.current.y = e.nativeEvent.layout.y;
        }}>
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

         {/* 오른쪽 사이드바 추가 */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 100,
            height: '100%',
            backgroundColor: '#f0f0f0',
            borderLeftWidth: 1,
            borderColor: '#ccc',
            padding: 10,
          }}
        >
          <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>접속 유저</Text>
          {userList.map((user) => (
            <Text key={user.id} style={{ marginBottom: 5 }}>
              {user.name}
            </Text>
          ))}
        </View>

        {/* 터치 감지를 위한 오버레이 */}
        <View
          style={StyleSheet.absoluteFill}
          {...panResponder.panHandlers}
          pointerEvents="box-only" // 🔥 핵심!
        />
      </View>

      <View style={styles.controls}>
        <Text style={styles.label}>펜 색상</Text>
        <View style={styles.colorPalette}>
          {['#000000', '#ff0000', '#00aa00', '#0000ff'].map(c => (
            <TouchableOpacity
              key={c}
              style={[
                styles.colorSwatch,
                {backgroundColor: c},
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
          style={{width: '100%'}}
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
  safeArea: {
    flex: 1,
    backgroundColor: '#fff', // 배경색 지정
  },
  canvasWrapper: {
    flex: 1,
  },
  container: {flex: 1, backgroundColor: '#fff'},
  canvas: {flex: 1},
  controls: {
    padding: 10,
    backgroundColor: '#eee',
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  colorPalette: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  colorSwatch: {
    width: 30,
    height: 30,
    marginRight: 10,
    borderRadius: 15,
  },
  selectedColor: {
    borderWidth: 2,
    borderColor: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
});
