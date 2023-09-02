import { useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { useURL } from "expo-linking";
import {
  addChangeListener,
  addErrorListener,
  getSharedInfo,
} from "./ExpoConfigPluginIosShareExtensionModule";
import { SharedInfo } from "./ExpoConfigPluginIosShareExtension.types";

const detaultValue: SharedInfo = { files: null, text: null };

const parseSharedInfo = (info): SharedInfo => {
  if (!info) return detaultValue;
  if (info?.startsWith("text:") || info?.startsWith("webUrl:")) {
    return {
      ...detaultValue,
      text: info.replace(/^\w+:/, ""),
    };
  }
  return {
    ...detaultValue,
    files: JSON.parse(info),
  };
};

export default function useSharedInfo(scheme: string) {
  const url = useURL();

  const appState = useRef(AppState.currentState);
  const [sharedInfo, setSharedInfo] = useState<SharedInfo>(detaultValue);

  const resetSharedInfo = () => setSharedInfo(detaultValue);

  /**
   * Call native module on universal linking url change
   */
  useEffect(() => {
    if (url?.startsWith(`${scheme}://dataUrl`)) {
      getSharedInfo(url);
    }
  }, [url]);

  /**
   * Handle application state (active, background, inactive)
   */
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current === "active" &&
        ["inactive", "background"].includes(nextAppState)
      ) {
        console.debug("useSharedInfo[to-background] reset shared info");
        resetSharedInfo();
      }
      appState.current = nextAppState;
    });
    return () => {
      subscription.remove();
    };
  }, [url]);

  /**
   * Detect Native Module response
   */
  useEffect(() => {
    const onChangeSubscription = addChangeListener((event) => {
      setSharedInfo(parseSharedInfo(event.value));
    });
    const errorSubscription = addErrorListener((event) =>
      console.debug("useSharedInfo[error]", event?.value)
    );
    return () => {
      onChangeSubscription.remove();
      errorSubscription.remove();
    };
  }, []);

  return {
    hasSharedInfo:
      (sharedInfo.files && sharedInfo.files.length > 0) || sharedInfo.text,
    ...sharedInfo,
    resetSharedInfo,
  };
}
