import React, {useRef, useState, useEffect} from 'react';
import {
  View,
  Button,
  Text,
  TouchableOpacity,
  StyleSheet,
  PanResponder,
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

interface DrawPath {
  path: SkPath;
  color: string;
  strokeWidth: number;
  points: { x: number; y: number }[]; // 추가
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

  useEffect(() => {
  const socket = new WebSocket('ws://your.server.address/ws/path');
  
  socketRef.current = socket;

  socket.onopen = () => {
    console.log('WebSocket 연결됨');
    
    socket.onmessage = event => {
      const message = JSON.parse(event.data);
      
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

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: e => {
        const {locationX, locationY} = e.nativeEvent;
        const path = Skia.Path.Make();
        path.moveTo(locationX, locationY);

        currentPath.current = {
          path,
          color: mode === 'pen' ? color : '#ffffff',
          strokeWidth: lineWidth,
          points: [{x: locationX, y: locationY}], // 추가
        };
      },
      onPanResponderMove: (e, gestureState) => {
        const {locationX, locationY} = e.nativeEvent;
        const point = {x: locationX, y: locationY};
        if (currentPath.current) {
          currentPath.current.path.lineTo(point.x, point.y);
          currentPath.current.points.push(point);
        
          // 🔴 서버로 전송
          if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            const data = {
              type: 'draw',
              color: currentPath.current.color,
              strokeWidth: currentPath.current.strokeWidth,
              point,
            };
            socketRef.current.send(JSON.stringify(data));
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
    <View style={styles.container}>
      {/* <Canvas style={styles.canvas} onTouch={handleTouch}>
        {paths.map((p, i) => (
          <Path
            key={i}
            path={p.path}
            color={p.color}
            style="stroke"
            strokeWidth={p.strokeWidth}
            strokeCap="round"
          />
        ))}
      </Canvas> */}
      {/* <View style={styles.container} {...panResponder.panHandlers}>
        <Canvas ref={canvasRef} style={styles.canvas} pointerEvents="none">
          {paths.map((p, i) =>
            p && p.path ? (
              <Path
                key={i}
                path={p.path}
                color={p.color}
                style="stroke"
                strokeWidth={p.strokeWidth}
              />
            ) : null,
          )}

          {currentPath.current && (
            <Path
              path={currentPath.current.path}
              color={currentPath.current.color}
              style="stroke"
              strokeWidth={currentPath.current.strokeWidth}
            />
          )}
        </Canvas>
      </View> */}

      <View style={styles.container}>
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
    </View>
  );
};

export default BoardScreen;

const styles = StyleSheet.create({
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
