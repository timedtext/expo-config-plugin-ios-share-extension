import { requireNativeModule } from "expo-modules-core";
import {
  NativeModulesProxy,
  EventEmitter,
  Subscription,
} from "expo-modules-core";
import { ChangeEventPayload } from "./ExpoConfigPluginIosShareExtension.types";

// Import the native module. On web, it will be resolved to ExpoConfigPluginIosShareExtension.web.ts
// and on native platforms to ExpoConfigPluginIosShareExtension.ts
// It loads the native module object from the JSI or falls back to
// the bridge module (from NativeModulesProxy) if the remote debugger is on.
const ExpoConfigPluginIosShareExtensionModule = requireNativeModule(
  "ExpoConfigPluginIosShareExtension"
);
export default ExpoConfigPluginIosShareExtensionModule;

export function hello(): string {
  return ExpoConfigPluginIosShareExtensionModule.hello();
}

export function getSharedInfo(url: string): string {
  return ExpoConfigPluginIosShareExtensionModule.getSharedInfo(url);
}

const emitter = new EventEmitter(
  ExpoConfigPluginIosShareExtensionModule ??
    NativeModulesProxy.ExpoConfigPluginIosShareExtension
);

export function addErrorListener(
  listener: (event: ChangeEventPayload) => void
): Subscription {
  return emitter.addListener<ChangeEventPayload>("onError", listener);
}

export function addChangeListener(
  listener: (event: ChangeEventPayload) => void
): Subscription {
  return emitter.addListener<ChangeEventPayload>("onChange", listener);
}
