# expo-config-plugin-ios-share-extension

An Expo config plugin to auto-configure `iOS Share Extension`

## Installation

Install it in your project:

```sh
expo install expo-config-plugin-ios-share-extension
```

In your app’s Expo config (app.json, or app.config.js), make sure that `expo-config-plugin-ios-share-extension` has been added to the list of plugins.

```app.json
"expo": {
  "name": "my-app",
  "scheme": "tt",
  "plugins": [
      ["expo-config-plugin-ios-share-extension"]
  ]
}
```

Next, rebuild your app.

```
eas build --profile development --platform ios
```

## Known limitations

- Currently, [only URL receiving](https://github.com/langtube/expo-config-plugin-ios-share-extension/blob/24a68b4e6efbcde4c3485bfec91dad476e0c9933/src/writeShareExtensionFiles.ts#L82) is supported
- Only support directly redirect to [Containing app](https://developer.apple.com/library/archive/documentation/General/Conceptual/ExtensibilityPG/ExtensionOverview.html).
  - [Here's an article](https://medium.com/kraaft-co/how-i-reached-the-limits-of-react-native-by-implementing-an-ios-share-extension-4f312b534f22) that explains why this approach was chosen.

## How it works.

-

## TODO

- [ ] Support receiving more [content types](https://developer.apple.com/library/archive/documentation/General/Reference/InfoPlistKeyReference/Articles/AppExtensionKeys.html#//apple_ref/doc/uid/TP40014212-SW10)
- [ ] Support Android

# Acknowledgements

This plugin was inspired by:

- [react-native-app-clip](https://github.com/bndkt/react-native-app-clip)
- [cordova-plugin-openwith](https://github.com/j3k0/cordova-plugin-openwith)
- [react-native-share-menu](https://github.com/meedan/react-native-share-menu)
- [react-native-receive-sharing-intent](https://github.com/ajith-ab/react-native-receive-sharing-intent)
- [expo/config-plugins](https://github.com/expo/config-plugins)
- [cordova-node-xcode](https://github.com/apache/cordova-node-xcode)
