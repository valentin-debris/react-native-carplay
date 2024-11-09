import CarPlay
import React

@objc(RNCarPlayApp)
public class RNCarPlayApp: NSObject, CPInterfaceControllerDelegate {
    @objc public var interfaceController: CPInterfaceController?
    var window: UIWindow?

    var bridge: RCTBridge?
    var moduleName: String = "carplay-app"

    var rootView: RCTRootView?

    @objc public var isConnected = false

    @objc public func connectModule(
        bridge: RCTBridge, moduleName: String
    ) {
        self.bridge = bridge
        self.moduleName = moduleName

        connect()
    }

    @objc public func connectScene(
        interfaceController: CPInterfaceController,
        window: UIWindow
    ) {
        self.interfaceController = interfaceController
        self.window = window

        self.interfaceController?.delegate = self

        connect()
    }

    internal func connect() {
        guard let window = self.window else {
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
                initialProperties: [
                    "id": self.moduleName,
                    "colorScheme": window.screen.traitCollection
                        .userInterfaceStyle == .dark ? "dark" : "light",
                    "window": [
                        "height": window.bounds.size.height,
                        "width": window.bounds.size.width,
                        "scale": window.screen.scale,
                    ],
                ])

            self.rootView = rootView
        }

        if let rootView = self.rootView {
            window.rootViewController = RNCarPlayViewController(
                rootView: rootView)
        }

        if let store = RNCPStore.sharedManager(),
            let template = store.findTemplate(byId: self.moduleName),
            let interfaceController = self.interfaceController
        {
            if let mapTemplate = template as? CPMapTemplate {
                // create a new map template to make navigation sessions work on reconnect
                let reconnectTemplate = CPMapTemplate()
                reconnectTemplate.automaticallyHidesNavigationBar =
                    mapTemplate.automaticallyHidesNavigationBar
                reconnectTemplate.backButton = mapTemplate.backButton
                reconnectTemplate.guidanceBackgroundColor =
                    mapTemplate.guidanceBackgroundColor
                reconnectTemplate.hidesButtonsWithNavigationBar =
                    mapTemplate.hidesButtonsWithNavigationBar
                reconnectTemplate.tripEstimateStyle =
                    mapTemplate.tripEstimateStyle
                reconnectTemplate.leadingNavigationBarButtons =
                    mapTemplate.leadingNavigationBarButtons
                reconnectTemplate.mapButtons = mapTemplate.mapButtons
                reconnectTemplate.mapDelegate = mapTemplate.mapDelegate
                reconnectTemplate.trailingNavigationBarButtons =
                    mapTemplate.trailingNavigationBarButtons
                reconnectTemplate.userInfo = mapTemplate.userInfo

                interfaceController.setRootTemplate(
                    reconnectTemplate, animated: false)
                store.setTemplate(self.moduleName, template: reconnectTemplate)
            } else {
                interfaceController.setRootTemplate(template, animated: false)
            }
        }

        self.isConnected = true

        RNCarPlayUtils.sendRNCarPlayEvent(
            name: "didConnect", body: getConnectedWindowInformation())
    }

    @objc public func disconnect() {
        self.rootView?.removeFromSuperview()

        self.interfaceController = nil
        self.window = nil
        self.isConnected = false

        RNCarPlayUtils.sendRNCarPlayEvent(name: "didDisconnect", body: nil)
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

    public func templateDidAppear(_ aTemplate: CPTemplate, animated: Bool) {
        RNCarPlayUtils.sendTemplateEvent(
            with: aTemplate, name: "didAppear", json: ["animated": animated])
    }

    public func templateDidDisappear(_ aTemplate: CPTemplate, animated: Bool) {
        RNCarPlayUtils.sendTemplateEvent(
            with: aTemplate, name: "didDisappear", json: ["animated": animated])
    }

    public func templateWillAppear(_ aTemplate: CPTemplate, animated: Bool) {
        RNCarPlayUtils.sendTemplateEvent(
            with: aTemplate, name: "willAppear", json: ["animated": animated])
    }

    public func templateWillDisappear(_ aTemplate: CPTemplate, animated: Bool) {
        RNCarPlayUtils.sendTemplateEvent(
            with: aTemplate, name: "willDisappear", json: ["animated": animated]
        )
    }
}
