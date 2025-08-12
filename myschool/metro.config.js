const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  watchFolders: [],
  resolver: {
    watchFolders: [],
  },
  watcher: {
    additionalExts: ['ts', 'tsx'],
    watchman: {
      deferStates: ['hg.update'],
    },
  },
  server: {
    port: 8081,
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
