const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.blacklistRE = /#current-cloud-backend\/.*/;

module.exports = defaultConfig;
