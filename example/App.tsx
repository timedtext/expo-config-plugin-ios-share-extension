import { StyleSheet, Text, View } from "react-native";
import Constants from "expo-constants";

import { useSharedInfo } from "expo-config-plugin-ios-share-extension";

export default function App() {
  const { hasSharedInfo, text, files } = useSharedInfo(
    String(Constants.expoConfig?.scheme)
  );

  return (
    <View style={styles.container}>
      <Text style={{ fontWeight: "bold" }}>
        {hasSharedInfo ? "SHARED INFO DETECTED" : "NO SHARED INFO DETECTED"}
      </Text>
      <Text>Text: {text}</Text>
      <Text>Files: {JSON.stringify(files)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
