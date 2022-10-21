import { ConfigPlugin, createRunOncePlugin, withPlugins } from '@expo/config-plugins';

import { withAppEntitlements } from './withAppEntitlements';
import { withShareExtensionConfig } from './withShareExtensionConfig';
import { withShareExtensionXcodeTarget } from './withShareExtensionXcodeTarget';

let pkg: { name: string; version?: string } = {
  name: 'expo-config-plugin-ios-share-extension',
  version: 'UNVERSIONED',
};

export const withShareMenu: ConfigPlugin = createRunOncePlugin(
  (config) => {
    return withPlugins(config, [
      withAppEntitlements,
      withShareExtensionConfig,
      withShareExtensionXcodeTarget,
    ]);
  },
  pkg.name,
  pkg.version,
);
