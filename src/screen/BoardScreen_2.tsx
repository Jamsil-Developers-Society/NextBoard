import React, {useRef, useState, useEffect, useMemo} from 'react';
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
import {Gesture, GestureDetector} from 'react-native-gesture-handler';

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
  const [canvasOffset, setCanvasOffset] = useState({x: 0, y: 0});

  // useEffect(() => {
  //   const socket = new WebSocket('ws://your.server.address/ws/path');

  //   socketRef.current = socket;

  //   socket.onopen = () => {
  //     console.log('WebSocket 연결됨');

  //     socket.onmessage = event => {
  //       const message = JSON.parse(event.data);

  //       if (message.type === 'draw') {
  //         const {color, strokeWidth, point} = message;

  //         const newPath = Skia.Path.Make();
  //         newPath.moveTo(point.x, point.y);
  //         newPath.lineTo(point.x + 0.1, point.y + 0.1);

  //         const newDrawPath: DrawPath = {
  //           path: newPath,
  //           color,
  //           strokeWidth,
  //           points: [point],
  //         };

  //         setPaths(prev => [...prev, newDrawPath]);
  //       }
  //     };
  //   };

  //   socket.onerror = e => {
  //     console.error('WebSocket 오류:', e);
  //   };

  //   socket.onclose = () => {
  //     console.log('WebSocket 연결 종료');
  //   };

  //   return () => {
  //     socket.close();
  //   };
  // }, []);

  const panGesture = Gesture.Pan()
    .onBegin(({absoluteX, absoluteY}) => {
      console.log('팬 시작', absoluteX, absoluteY);
      // const x = absoluteX - canvasOffset.x;
      // const y = absoluteY - canvasOffset.y;
      const x = absoluteX;
      const y = absoluteY;

      const path = Skia.Path.Make();
      path.moveTo(x, y);

      currentPath.current = {
        path,
        color: mode === 'pen' ? color : '#ffffff',
        strokeWidth: lineWidth,
        points: [{x, y}],
      };
    })
    .onUpdate(({absoluteX, absoluteY}) => {
      console.log('팬 이동', absoluteX, absoluteY);
      // const x = absoluteX - canvasOffset.x;
      // const y = absoluteY - canvasOffset.y;
      const x = absoluteX;
      const y = absoluteY;

      console.log(currentPath.current);

      currentPath.current?.path.lineTo(x, y);
      currentPath.current?.points.push({x, y});

      // if (currentPath.current) {
      //   console.log('true');
      //   currentPath.current.path.lineTo(x, y);
      //   currentPath.current.points.push({x, y});

      //   canvasRef.current?.redraw();
      // }
    })
    .onEnd(() => {
      console.log('팬 끝');
      if (currentPath.current) {
        const finalizedPath = currentPath.current;
        setPaths(prev => [...prev, finalizedPath]);
        currentPath.current = null;
      }
    });

  // const panGesture = Gesture.Pan()
  //   .onBegin(({absoluteX, absoluteY}) => {
  //     console.log('팬 시작', absoluteX, absoluteY);
  //     // const x = absoluteX - canvasOffset.x;
  //     // const y = absoluteY - canvasOffset.y;
  //     const x = absoluteX;
  //     const y = absoluteY;

  //     const path = Skia.Path.Make();
  //     path.moveTo(x, y);

  //     currentPath.current = {
  //       path,
  //       color: mode === 'pen' ? color : '#ffffff',
  //       strokeWidth: lineWidth,
  //       points: [{x, y}],
  //     };
  //   })
  //   .onUpdate(({absoluteX, absoluteY}) => {
  //     console.log('팬 이동', absoluteX, absoluteY);
  //     // const x = absoluteX - canvasOffset.x;
  //     // const y = absoluteY - canvasOffset.y;
  //     const x = absoluteX;
  //     const y = absoluteY;

  //     if (currentPath.current) {
  //       console.log('true');
  //       currentPath.current.path.lineTo(x, y);
  //       currentPath.current.points.push({x, y});

  //       canvasRef.current?.redraw();
  //     }
  //   })
  //   .onEnd(() => {
  //     console.log('팬 끝');
  //     if (currentPath.current) {
  //       const finalizedPath = currentPath.current;
  //       setPaths(prev => [...prev, finalizedPath]);
  //       currentPath.current = null;
  //     }
  //   });

  // const panGesture = useMemo(
  //   () =>
  //     Gesture.Pan()
  //       .onBegin(({absoluteX, absoluteY}) => {
  //         console.log('팬 시작', absoluteX, absoluteY);
  //         // const x = absoluteX - canvasOffset.x;
  //         // const y = absoluteY - canvasOffset.y;
  //         const x = absoluteX;
  //         const y = absoluteY;

  //         const path = Skia.Path.Make();
  //         path.moveTo(x, y);

  //         currentPath.current = {
  //           path,
  //           color: mode === 'pen' ? color : '#ffffff',
  //           strokeWidth: lineWidth,
  //           points: [{x, y}],
  //         };
  //       })
  //       .onUpdate(({absoluteX, absoluteY}) => {
  //         console.log('팬 이동', absoluteX, absoluteY);
  //         // const x = absoluteX - canvasOffset.x;
  //         // const y = absoluteY - canvasOffset.y;
  //         const x = absoluteX;
  //         const y = absoluteY;

  //         console.log(currentPath.current);

  //         currentPath.current?.path.lineTo(x, y);
  //         currentPath.current?.points.push({x, y});

  //         // if (currentPath.current) {
  //         //   console.log('true');
  //         //   currentPath.current.path.lineTo(x, y);
  //         //   currentPath.current.points.push({x, y});

  //         //   canvasRef.current?.redraw();
  //         // }
  //       })
  //       .onEnd(() => {
  //         console.log('팬 끝');
  //         if (currentPath.current) {
  //           const finalizedPath = currentPath.current;
  //           setPaths(prev => [...prev, finalizedPath]);
  //           currentPath.current = null;
  //         }
  //       }),
  //   [color, lineWidth, mode, canvasOffset],
  // );

  const clearCanvas = () => {
    pathsRef.current = [];
    setPaths([]);
  };

  console.log('Gesture 객체', panGesture);

  return (
    <View
      style={styles.container}
      onLayout={e => {
        const {x, y} = e.nativeEvent.layout;
        // console.log('canvasOffset', x, y);
        setCanvasOffset({x, y});
      }}>
      <GestureDetector gesture={panGesture}>
        <Canvas style={styles.canvas} ref={canvasRef}>
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
      </GestureDetector>

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
