//
//  RNCarPlayDashboard.swift
//  RNCarPlay
//
//  Created by Manuel Auer on 11.10.24.
//

import CarPlay
import React

@objc(RNCarPlayDashboard)
public class RNCarPlayDashboard: UIViewController {

    var dashboardController: CPDashboardController?
    var window: UIWindow?

    var bridge: RCTBridge?
    var moduleName: String = "carplay-dashboard"
    var buttonConfig: [AnyHashable: Any] = [:]

    var rootView: RCTRootView?
    
    @objc public var isConnected = false

    @objc public init() {
        super.init(nibName: nil, bundle: nil)
    }

    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    @objc public func connectModule(
        bridge: RCTBridge, moduleName: String, buttonConfig: [AnyHashable: Any]
    ) {
        self.bridge = bridge
        self.moduleName = moduleName
        self.buttonConfig = buttonConfig

        connect()
    }

    @objc public func connectScene(
      dashboardController: CPDashboardController,
      window: UIWindow
    ) {
        self.dashboardController = dashboardController
        self.window = window
        self.window?.rootViewController = self

        connect()
    }

    private func connect() {
        guard let view = self.window?.rootViewController?.view else {
            // connectScene was not called yet
            return
        }

        if let rootView = self.rootView, rootView.moduleName != self.moduleName
        {
            rootView.removeFromSuperview()
            self.rootView = nil
        }

        if self.rootView == nil {
            guard let bridge = self.bridge else {
                // connectModule was not called yet
                return
            }

            let rootView = RCTRootView(
                bridge: bridge, moduleName: self.moduleName,
                initialProperties: [:])
            rootView.translatesAutoresizingMaskIntoConstraints = false

            self.rootView = rootView
        }

        if let rootView = self.rootView {
            // add react root view
            view.addSubview(rootView)

            // match root view size to parent view
            NSLayoutConstraint.activate([
                rootView.topAnchor.constraint(equalTo: view.topAnchor),
                rootView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
                rootView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
                rootView.trailingAnchor.constraint(
                    equalTo: view.trailingAnchor),
            ])
        }

        setDashboardButtons()

        self.isConnected = true
        sendRNCarPlayEvent(
            "dashboardDidConnect", getConnectedWindowInformation())
    }

    @objc func disconnect() {
        self.rootView?.removeFromSuperview()
        self.dashboardController = nil
        self.window = nil
        
        self.isConnected = false
        sendRNCarPlayEvent("dashboardDidDisconnect", [:])
    }

    override public func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        
        if !self.isConnected {
            return
        }
        
        let safeAreaInsets = [
            "bottom": self.view.safeAreaInsets.bottom,
            "left": self.view.safeAreaInsets.left,
            "right": self.view.safeAreaInsets.right,
            "top": self.view.safeAreaInsets.top,
        ]
        sendRNCarPlayEvent("dashboardSafeAreaInsetsChanged", safeAreaInsets)
    }

    @objc public func getConnectedWindowInformation() -> [String: Any] {
        if let window = self.window {
            return [
                "height": window.bounds.size.height,
                "width": window.bounds.size.width,
                "scale": window.screen.scale,
            ]
        }
        return [:]
    }

    @objc public func updateDashboardButtons(config: [AnyHashable: Any]) {
        self.buttonConfig = config
        setDashboardButtons()
    }

    public func setDashboardButtons() {
        var buttons: [CPDashboardButton] = []

        if let shortcutButtons = self.buttonConfig["shortcutButtons"]
            as? [[String: Any]]
        {
            for button in shortcutButtons {
                guard
                    let index = button["index"] as? Int,
                    let image = button["image"] as? [String: Any],
                    let subtitleVariants = button["subtitleVariants"]
                        as? [String],
                    let titleVariants = button["titleVariants"] as? [String],
                    let launchCarplayScene = button["launchCarplayScene"]
                        as? Bool
                else {
                    print("Skipping button due to missing property")
                    continue
                }

                let shortcutButton = CPDashboardButton(
                    titleVariants: titleVariants,
                    subtitleVariants: subtitleVariants,
                    image: RCTConvert.uiImage(image)
                ) { _ in
                    sendRNCarPlayEvent(
                        "dashboardButtonPressed", ["index": index])

                    if launchCarplayScene {
                        guard
                            let bundleIdentifier = Bundle.main.bundleIdentifier
                        else { return }

                        guard
                            let url = URL(
                                string: "\(bundleIdentifier)://carplay")
                        else { return }

                        guard
                            let dashboardScene = UIApplication.shared
                                .connectedScenes.first(where: {
                                    $0 is CPTemplateApplicationDashboardScene
                                })
                        else { return }

                        dashboardScene.open(
                            url, options: nil, completionHandler: nil)
                    }

                }

                buttons.append(shortcutButton)
            }
        }

        self.dashboardController?.shortcutButtons = buttons
    }
}
