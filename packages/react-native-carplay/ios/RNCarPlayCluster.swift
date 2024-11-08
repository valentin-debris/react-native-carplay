//
//  RNCarPlayCluster.swift
//  RNCarPlay
//
//  Created by Manuel Auer on 08.11.24.
//

import CarPlay
import React

@available(iOS 15.4, *)
@objc(RNCarPlayCluster)
public class RNCarPlayCluster: NSObject {

    var instrumentClusterController: CPInstrumentClusterController?
    var window: UIWindow?

    var bridge: RCTBridge?
    var id: String?

    var rootView: RCTRootView?

    @objc public var isConnected = false

    @objc public func connect(
        instrumentClusterController: CPInstrumentClusterController,
        clusterId: String
    ) {
        self.instrumentClusterController = instrumentClusterController
        self.id = clusterId
        self.isConnected = true

        RNCarPlayUtils.sendRNCarPlayEvent(
            name: "clusterDidConnect", body: getConnectedWindowInformation())
    }

    @objc public func connect(
        window: UIWindow,
        clusterId: String
    ) {
        self.window = window
        self.id = clusterId
    }

    @objc public func connect(
        bridge: RCTBridge,
        config: [String: Any]
    ) {
        self.bridge = bridge

        if let instrumentClusterController = self.instrumentClusterController {
            if let descriptions = config["inactiveDescriptionVariants"]
                as? [[String: Any]] {
                for description in descriptions {
                    guard
                        let text = description["text"] as? String
                    else {
                        print("Skipping inactiveDescriptionVariant due to missing property")
                        continue
                    }
                    
                    let string = NSMutableAttributedString(string: text)
                    
                    if let image = description["image"] as? [String: Any], let icon = RCTConvert.uiImage(image) {
                        let attributedString = NSAttributedString(attachment: NSTextAttachment(image: icon))
                        string.append(attributedString)
                    }
                    
                    instrumentClusterController.attributedInactiveDescriptionVariants.append(string)
                }
            }
        }

        guard let window = self.window, let id = self.id else {
            return
        }

        if let rootView = self.rootView, rootView.moduleName != self.id {
            rootView.removeFromSuperview()
            self.rootView = nil
        }

        if self.rootView == nil {
            let rootView = RCTRootView(
                bridge: bridge, moduleName: id,
                initialProperties: [:])

            self.rootView = rootView
        }

        if let rootView = self.rootView {
            window.rootViewController = RNCarPlayViewController(
                rootView: rootView, eventName: "clusterSafeAreaInsetsChanged")
        }
    }

    @objc public func disconnect() {
        disconnectWindow()

        self.isConnected = false

        RNCarPlayUtils.sendRNCarPlayEvent(
            name: "clusterDidDisconnect", body: ["id": self.id ?? ""])
    }

    @objc public func disconnectWindow() {
        self.rootView?.removeFromSuperview()
        self.window = nil
    }

    @objc public func getConnectedWindowInformation() -> [String: Any] {
        if let window = self.window {
            return [
                "height": window.bounds.size.height,
                "width": window.bounds.size.width,
                "scale": window.screen.scale,
                "id": self.id ?? "",
            ]
        }
        return ["id": self.id ?? ""]
    }
}
