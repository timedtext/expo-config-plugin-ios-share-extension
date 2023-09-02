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
  Parameters,
} from "./constants";

export async function writeShareExtensionFiles(
  platformProjectRoot: string,
  scheme: string,
  appIdentifier: string,
  parameters: Parameters
) {
  const infoPlistFilePath = getShareExtensionInfoFilePath(platformProjectRoot);
  const infoPlistContent = getShareExtensionInfoContent(
    parameters.activationRules
  );
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
  const viewControllerContent = getShareExtensionViewControllerContent(
    scheme,
    appIdentifier
  );
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

export function getShareExtensionInfoContent(
  activationRules: Parameters["activationRules"]
) {
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
        NSExtensionActivationRule: activationRules || {
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

export function getShareExtensionViewControllerContent(
  scheme: string,
  appIdentifier: string
) {
  console.debug("************ scheme", scheme, "appIdentifier", appIdentifier);

  return `import UIKit
  import Social
  import MobileCoreServices
  import Photos

  class ShareViewController: SLComposeServiceViewController {
   let hostAppBundleIdentifier = "${appIdentifier}"
   let shareProtocol = "${scheme}"
   let sharedKey = "${scheme}ShareKey"
   var sharedMedia: [SharedMediaFile] = []
   var sharedText: [String] = []
   let imageContentType = kUTTypeImage as String
   let videoContentType = kUTTypeMovie as String
   let textContentType = kUTTypeText as String
   let urlContentType = kUTTypeURL as String
   let fileURLType = kUTTypeFileURL as String;
  
   override func isContentValid() -> Bool {
     return true
   }
      
   override func viewDidLoad() {
         super.viewDidLoad();
     }
      
   override func viewDidAppear(_ animated: Bool) {
           super.viewDidAppear(animated)
          
     if let content = extensionContext!.inputItems[0] as? NSExtensionItem {
       if let contents = content.attachments {
         for (index, attachment) in (contents).enumerated() {
           if attachment.hasItemConformingToTypeIdentifier(imageContentType) {
             handleImages(content: content, attachment: attachment, index: index)
           } else if attachment.hasItemConformingToTypeIdentifier(textContentType) {
             handleText(content: content, attachment: attachment, index: index)
           } else if attachment.hasItemConformingToTypeIdentifier(fileURLType) {
             handleFiles(content: content, attachment: attachment, index: index)
           } else if attachment.hasItemConformingToTypeIdentifier(urlContentType) {
             handleUrl(content: content, attachment: attachment, index: index)
           } else if attachment.hasItemConformingToTypeIdentifier(videoContentType) {
             handleVideos(content: content, attachment: attachment, index: index)
           }
         }
       }
     }
   }
      
   override func didSelectPost() {
         print("didSelectPost");
     }
      
   override func configurationItems() -> [Any]! {
     // To add configuration options via table cells at the bottom of the sheet, return an array of SLComposeSheetConfigurationItem here.
     return []
   }
  
   private func handleText (content: NSExtensionItem, attachment: NSItemProvider, index: Int) {
     attachment.loadItem(forTypeIdentifier: textContentType, options: nil) { [weak self] data, error in
      
       if error == nil, let item = data as? String, let this = self {
      
         this.sharedText.append(item)
          
         // If this is the last item, save imagesData in userDefaults and redirect to host app
         if index == (content.attachments?.count)! - 1 {
           let userDefaults = UserDefaults(suiteName: "group.\\(this.hostAppBundleIdentifier)")
           userDefaults?.set(this.sharedText, forKey: this.sharedKey)
           userDefaults?.synchronize()
           this.redirectToHostApp(type: .text)
         }
              
       } else {
         self?.dismissWithError()
       }
     }
   }
              
   private func handleUrl (content: NSExtensionItem, attachment: NSItemProvider, index: Int) {
     attachment.loadItem(forTypeIdentifier: urlContentType, options: nil) { [weak self] data, error in
              
       if error == nil, let item = data as? URL, let this = self {
      
         this.sharedText.append(item.absoluteString)
      
         // If this is the last item, save imagesData in userDefaults and redirect to host app
         if index == (content.attachments?.count)! - 1 {
           let userDefaults = UserDefaults(suiteName: "group.\\(this.hostAppBundleIdentifier)")
           userDefaults?.set(this.sharedText, forKey: this.sharedKey)
           userDefaults?.synchronize()
           this.redirectToHostApp(type: .text)
         }
      
       } else {
         self?.dismissWithError()
       }
     }
   }
   
   private func handleImages (content: NSExtensionItem, attachment: NSItemProvider, index: Int) {
     attachment.loadItem(forTypeIdentifier: imageContentType, options: nil) { [weak self] data, error in
       
       if error == nil, let url = data as? URL, let this = self {
         //  this.redirectToHostApp(type: .media)
         // Always copy
         let fileExtension = this.getExtension(from: url, type: .video)
         let newName = UUID().uuidString
         let newPath = FileManager.default
           .containerURL(forSecurityApplicationGroupIdentifier: "group.\\(this.hostAppBundleIdentifier)")!
           .appendingPathComponent("\\(newName).\\(fileExtension)")
         let copied = this.copyFile(at: url, to: newPath)
         if(copied) {
           this.sharedMedia.append(SharedMediaFile(path: newPath.absoluteString, thumbnail: nil, duration: nil, type: .image))
         }
         
         // If this is the last item, save imagesData in userDefaults and redirect to host app
         if index == (content.attachments?.count)! - 1 {
           let userDefaults = UserDefaults(suiteName: "group.\\(this.hostAppBundleIdentifier)")
           userDefaults?.set(this.toData(data: this.sharedMedia), forKey: this.sharedKey)
           userDefaults?.synchronize()
           this.redirectToHostApp(type: .media)
         }
         
       } else {
         self?.dismissWithError()
       }
     }
   }
   
   private func handleVideos (content: NSExtensionItem, attachment: NSItemProvider, index: Int) {
     attachment.loadItem(forTypeIdentifier: videoContentType, options:nil) { [weak self] data, error in
       
       if error == nil, let url = data as? URL, let this = self {
         
         // Always copy
         let fileExtension = this.getExtension(from: url, type: .video)
         let newName = UUID().uuidString
         let newPath = FileManager.default
           .containerURL(forSecurityApplicationGroupIdentifier: "group.\\(this.hostAppBundleIdentifier)")!
           .appendingPathComponent("\\(newName).\\(fileExtension)")
         let copied = this.copyFile(at: url, to: newPath)
         if(copied) {
           guard let sharedFile = this.getSharedMediaFile(forVideo: newPath) else {
             return
           }
           this.sharedMedia.append(sharedFile)
         }
  
         // If this is the last item, save imagesData in userDefaults and redirect to host app
         if index == (content.attachments?.count)! - 1 {
           let userDefaults = UserDefaults(suiteName: "group.\\(this.hostAppBundleIdentifier)")
           userDefaults?.set(this.toData(data: this.sharedMedia), forKey: this.sharedKey)
           userDefaults?.synchronize()
           this.redirectToHostApp(type: .media)
         }
         
       } else {
         self?.dismissWithError()
       }
     }
   }
   
   private func handleFiles (content: NSExtensionItem, attachment: NSItemProvider, index: Int) {
     attachment.loadItem(forTypeIdentifier: fileURLType, options: nil) { [weak self] data, error in
       
       if error == nil, let url = data as? URL, let this = self {
         
         // Always copy
         let newName = this.getFileName(from :url)
         let newPath = FileManager.default
           .containerURL(forSecurityApplicationGroupIdentifier: "group.\\(this.hostAppBundleIdentifier)")!
           .appendingPathComponent("\\(newName)")
         let copied = this.copyFile(at: url, to: newPath)
         if (copied) {
           this.sharedMedia.append(SharedMediaFile(path: newPath.absoluteString, thumbnail: nil, duration: nil, type: .file))
         }
         
         if index == (content.attachments?.count)! - 1 {
           let userDefaults = UserDefaults(suiteName: "group.\\(this.hostAppBundleIdentifier)")
           userDefaults?.set(this.toData(data: this.sharedMedia), forKey: this.sharedKey)
           userDefaults?.synchronize()
           this.redirectToHostApp(type: .file)
         }
         
       } else {
         self?.dismissWithError()
       }
     }
   }
   
   private func dismissWithError() {
     print("[ERROR] Error loading data!")
     let alert = UIAlertController(title: "Error", message: "Error loading data", preferredStyle: .alert)
     
     let action = UIAlertAction(title: "Error", style: .cancel) { _ in
       self.dismiss(animated: true, completion: nil)
     }
     
     alert.addAction(action)
     present(alert, animated: true, completion: nil)
     extensionContext!.completeRequest(returningItems: [], completionHandler: nil)
   }
   
   private func redirectToHostApp(type: RedirectType) {
     let url = URL(string: "\\(shareProtocol)://dataUrl=\\(sharedKey)#\\(type)")
     var responder = self as UIResponder?
     let selectorOpenURL = sel_registerName("openURL:")
  
     while (responder != nil) {
       if (responder?.responds(to: selectorOpenURL))! {
         let _ = responder?.perform(selectorOpenURL, with: url)
       }
       responder = responder!.next
     }
     extensionContext!.completeRequest(returningItems: [], completionHandler: nil)
   }
   
   enum RedirectType {
     case media
     case text
     case file
   }
   
   func getExtension(from url: URL, type: SharedMediaType) -> String {
     let parts = url.lastPathComponent.components(separatedBy: ".")
     var ex: String? = nil
     if (parts.count > 1) {
       ex = parts.last
     }
     
     if (ex == nil) {
       switch type {
       case .image:
         ex = "PNG"
       case .video:
         ex = "MP4"
       case .file:
         ex = "TXT"
       }
     }
     return ex ?? "Unknown"
   }
   
   func getFileName(from url: URL) -> String {
     var name = url.lastPathComponent
     
     if (name == "") {
       name = UUID().uuidString + "." + getExtension(from: url, type: .file)
     }
     
     return name
   }
   
   func copyFile(at srcURL: URL, to dstURL: URL) -> Bool {
     do {
       if FileManager.default.fileExists(atPath: dstURL.path) {
         try FileManager.default.removeItem(at: dstURL)
       }
       try FileManager.default.copyItem(at: srcURL, to: dstURL)
     } catch (let error) {
       print("Cannot copy item at \\(srcURL) to \\(dstURL): \\(error)")
       return false
     }
     return true
   }
   
   private func getSharedMediaFile(forVideo: URL) -> SharedMediaFile? {
     let asset = AVAsset(url: forVideo)
     let duration = (CMTimeGetSeconds(asset.duration) * 1000).rounded()
     let thumbnailPath = getThumbnailPath(for: forVideo)
     
     if FileManager.default.fileExists(atPath: thumbnailPath.path) {
       return SharedMediaFile(path: forVideo.absoluteString, thumbnail: thumbnailPath.absoluteString, duration: duration, type: .video)
     }
     
     var saved = false
     let assetImgGenerate = AVAssetImageGenerator(asset: asset)
     assetImgGenerate.appliesPreferredTrackTransform = true
     //        let scale = UIScreen.main.scale
     assetImgGenerate.maximumSize =  CGSize(width: 360, height: 360)
     do {
       let img = try assetImgGenerate.copyCGImage(at: CMTimeMakeWithSeconds(600, preferredTimescale: Int32(1.0)), actualTime: nil)
       try UIImage.pngData(UIImage(cgImage: img))()?.write(to: thumbnailPath)
       saved = true
     } catch {
       saved = false
     }
     
     return saved ? SharedMediaFile(path: forVideo.absoluteString, thumbnail: thumbnailPath.absoluteString, duration: duration, type: .video) : nil
     
   }
   
   private func getThumbnailPath(for url: URL) -> URL {
     let fileName = Data(url.lastPathComponent.utf8).base64EncodedString().replacingOccurrences(of: "==", with: "")
     let path = FileManager.default
       .containerURL(forSecurityApplicationGroupIdentifier: "group.\\(hostAppBundleIdentifier)")!
       .appendingPathComponent("\\(fileName).jpg")
     return path
   }
   
   class SharedMediaFile: Codable {
     var path: String; // can be image, video or url path. It can also be text content
     var thumbnail: String?; // video thumbnail
     var duration: Double?; // video duration in milliseconds
     var type: SharedMediaType;
     
     
     init(path: String, thumbnail: String?, duration: Double?, type: SharedMediaType) {
       self.path = path
       self.thumbnail = thumbnail
       self.duration = duration
       self.type = type
     }
     
     // Debug method to print out SharedMediaFile details in the console
     func toString() {
       print("[SharedMediaFile] path: \\(self.path)thumbnail: \\(self.thumbnail)duration: \\(self.duration)type: \\(self.type)")
     }
   }
   
   enum SharedMediaType: Int, Codable {
     case image
     case video
     case file
   }
   
   func toData(data: [SharedMediaFile]) -> Data {
     let encodedData = try? JSONEncoder().encode(data)
     return encodedData!
   }
  }
  
  extension Array {
   subscript (safe index: UInt) -> Element? {
     return Int(index) < count ? self[Int(index)] : nil
   }
  }
`;
}
