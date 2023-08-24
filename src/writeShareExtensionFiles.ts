import path from "node:path";
import fs from "node:fs";
import plist from "@expo/plist";

import {
  shareExtensionName,
  getAppGroups,
  shareExtensionEntitlementsFileName,
  shareExtensionInfoFileName,
  shareExtensionStoryBoardFileName,
  shareExtensionViewControllerFileName,
} from "./constants";

export async function writeShareExtensionFiles(
  platformProjectRoot: string,
  scheme: string,
  appIdentifier: string
) {
  const infoPlistFilePath = getShareExtensionInfoFilePath(platformProjectRoot);
  const infoPlistContent = getShareExtensionInfoContent();
  await fs.promises.mkdir(path.dirname(infoPlistFilePath), { recursive: true });
  await fs.promises.writeFile(infoPlistFilePath, infoPlistContent);

  const entitlementsFilePath =
    getShareExtensionEntitlementsFilePath(platformProjectRoot);
  const entitlementsContent =
    getShareExtensionEntitlementsContent(appIdentifier);
  await fs.promises.writeFile(entitlementsFilePath, entitlementsContent);

  const storyboardFilePath =
    getShareExtensionStoryboardFilePath(platformProjectRoot);
  const storyboardContent = getShareExtensionStoryBoardContent();
  await fs.promises.writeFile(storyboardFilePath, storyboardContent);

  const viewControllerFilePath =
    getShareExtensionViewControllerPath(platformProjectRoot);
  const viewControllerContent = getShareExtensionViewControllerContent(scheme);
  await fs.promises.writeFile(viewControllerFilePath, viewControllerContent);
}

//: [root]/ios/ShareExtension/ShareExtension-Entitlements.plist
export function getShareExtensionEntitlementsFilePath(
  platformProjectRoot: string
) {
  return path.join(
    platformProjectRoot,
    shareExtensionName,
    shareExtensionEntitlementsFileName
  );
}

export function getShareExtensionEntitlements(appIdentifier: string) {
  return {
    "com.apple.security.application-groups": getAppGroups(appIdentifier),
  };
}

export function getShareExtensionEntitlementsContent(appIdentifier: string) {
  return plist.build(getShareExtensionEntitlements(appIdentifier));
}

//: [root]/ios/ShareExtension/ShareExtension-Info.plist
export function getShareExtensionInfoFilePath(platformProjectRoot: string) {
  return path.join(
    platformProjectRoot,
    shareExtensionName,
    shareExtensionInfoFileName
  );
}

export function getShareExtensionInfoContent() {
  return plist.build({
    CFBundleName: "$(PRODUCT_NAME)",
    CFBundleDisplayName: "$(PRODUCT_NAME) Share Extension",
    CFBundleIdentifier: "$(PRODUCT_BUNDLE_IDENTIFIER)",
    CFBundleDevelopmentRegion: "$(DEVELOPMENT_LANGUAGE)",
    CFBundleExecutable: "$(EXECUTABLE_NAME)",
    CFBundleInfoDictionaryVersion: "6.0",
    CFBundlePackageType: "$(PRODUCT_BUNDLE_PACKAGE_TYPE)",
    NSExtension: {
      NSExtensionAttributes: {
        NSExtensionActivationRule: {
          NSExtensionActivationSupportsWebURLWithMaxCount: 1,
          NSExtensionActivationSupportsWebPageWithMaxCount: 1,
        },
      },
      NSExtensionMainStoryboard: "MainInterface",
      NSExtensionPointIdentifier: "com.apple.share-services",
    },
  });
}

//: [root]/ios/ShareExtension/ShareExtension-Info.plist
export function getShareExtensionStoryboardFilePath(
  platformProjectRoot: string
) {
  return path.join(
    platformProjectRoot,
    shareExtensionName,
    shareExtensionStoryBoardFileName
  );
}

export function getShareExtensionStoryBoardContent() {
  return `<?xml version="1.0" encoding="UTF-8"?>
  <document type="com.apple.InterfaceBuilder3.CocoaTouch.Storyboard.XIB" version="3.0" toolsVersion="13122.16" targetRuntime="iOS.CocoaTouch" propertyAccessControl="none" useAutolayout="YES" useTraitCollections="YES" useSafeAreas="YES" colorMatched="YES" initialViewController="j1y-V4-xli">
      <dependencies>
          <plugIn identifier="com.apple.InterfaceBuilder.IBCocoaTouchPlugin" version="13104.12"/>
          <capability name="Safe area layout guides" minToolsVersion="9.0"/>
          <capability name="documents saved in the Xcode 8 format" minToolsVersion="8.0"/>
      </dependencies>
      <scenes>
          <!--Share View Controller-->
          <scene sceneID="ceB-am-kn3">
              <objects>
                  <viewController id="j1y-V4-xli" customClass="ShareViewController" customModuleProvider="target" sceneMemberID="viewController">
                      <view key="view" opaque="NO" contentMode="scaleToFill" id="wbc-yd-nQP">
                          <rect key="frame" x="0.0" y="0.0" width="375" height="667"/>
                          <autoresizingMask key="autoresizingMask" widthSizable="YES" heightSizable="YES"/>
                          <color key="backgroundColor" red="0.0" green="0.0" blue="0.0" alpha="0.0" colorSpace="custom" customColorSpace="sRGB"/>
                          <viewLayoutGuide key="safeArea" id="1Xd-am-t49"/>
                      </view>
                  </viewController>
                  <placeholder placeholderIdentifier="IBFirstResponder" id="CEy-Cv-SGf" userLabel="First Responder" sceneMemberID="firstResponder"/>
              </objects>
          </scene>
      </scenes>
  </document>
  `;
}

//: [root]/ios/ShareExtension/ShareViewController.swift
export function getShareExtensionViewControllerPath(
  platformProjectRoot: string
) {
  return path.join(
    platformProjectRoot,
    shareExtensionName,
    shareExtensionViewControllerFileName
  );
}

export function getShareExtensionViewControllerContent(scheme: string) {
  console.debug("************ scheme", scheme);

  return `import MobileCoreServices
  import Social
  import UIKit
  
  class ShareViewController: UIViewController {
    // IMPORTANT: This should be your host app scheme
    let hostAppURLScheme = "${scheme}"
    let urlContentType = kUTTypeURL as String
    let textContentType = kUTTypePlainText as String
  
    override func viewDidLoad() {
      super.viewDidLoad()
    }
  
    override func viewDidAppear(_ animated: Bool) {
      super.viewDidAppear(animated)
  
      if let content = self.extensionContext!.inputItems[0] as? NSExtensionItem {
        if let contents = content.attachments {
          for (_, attachment) in (contents).enumerated() {
            if attachment.hasItemConformingToTypeIdentifier(self.urlContentType) {
              self.handleUrl(attachment: attachment)
            } else if attachment.hasItemConformingToTypeIdentifier(self.textContentType) {
              self.handleText(attachment: attachment)
            }
          }
        }
      }
    }
  
    private func handleUrl(attachment: NSItemProvider) {
  
      attachment.loadItem(forTypeIdentifier: self.urlContentType, options: nil) { data, error in
        var result: String? = nil
  
        if error == nil, let item = data as? URL {
          let _url = URL(string: item.absoluteString)
          if _url != nil {
            result = item.absoluteString
          }
        }
  
        if result == nil {
          self.dismissWithError()
          return
        }
  
        self.redirectToHostApp(sharedURL: result!)
      }
    }
  
    private func handleText(attachment: NSItemProvider) {
  
      attachment.loadItem(forTypeIdentifier: self.textContentType, options: nil) { data, error in
        var result: String? = nil
  
        if error == nil, let item = data as? String {
  
          let types: NSTextCheckingResult.CheckingType = [.link]
          let detector = try? NSDataDetector(types: types.rawValue)
  
          if detector != nil && item.count > 0
            && detector!.numberOfMatches(
              in: item, options: NSRegularExpression.MatchingOptions(rawValue: 0),
              range: NSMakeRange(0, item.count)) > 0
          {
            result = item
          }
        }
  
        if result == nil {
          self.dismissWithError()
          return
        }
  
        self.redirectToHostApp(sharedURL: result!)
      }
    }
  
    private func dismissWithError() {
      self.dismiss(animated: true, completion: nil)
      extensionContext!.completeRequest(returningItems: [], completionHandler: nil)
    }
  
    private func redirectToHostApp(sharedURL: String) {
      var urlComponents = URLComponents()
      urlComponents.scheme = hostAppURLScheme
      urlComponents.host = "share"
      urlComponents.path = "/"
      urlComponents.queryItems = [
        URLQueryItem(name: "url", value: sharedURL)
      ]
      // urlComponents.url: \(scheme)://share/?url=\(sharedURL)
      let url = urlComponents.url
      var responder = self as UIResponder?
      let selectorOpenURL = sel_registerName("openURL:")
  
      while responder != nil {
        if (responder?.responds(to: selectorOpenURL))! {
          responder?.perform(selectorOpenURL, with: url)
        }
        responder = responder!.next
      }
  
      extensionContext!.completeRequest(returningItems: [], completionHandler: nil)
    }
  }
`;
}
