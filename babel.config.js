// module.exports = {
//   // presets: ['module:@react-native/babel-preset'],
//   presets: ['module:metro-react-native-babel-preset'],
//   plugins: ['react-native-reanimated/plugin'],
// };

module.exports = {
  presets: [
    'module:@react-native/babel-preset',
    '@babel/preset-typescript', // 이 줄 추가
  ],
  plugins: ['react-native-reanimated/plugin'],
};
