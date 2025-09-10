module.exports = {
  presets: [
    [
      'module:@react-native/babel-preset',
      {
        runtime: 'automatic',
      },
    ],
    ['@emotion/babel-preset-css-prop', { sourceMap: false }],
  ],
  plugins: [
    'react-native-worklets/plugin',
    'react-native-reanimated/plugin'
  ],
};
