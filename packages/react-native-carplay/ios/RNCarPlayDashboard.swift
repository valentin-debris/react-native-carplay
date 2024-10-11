import CarPlay
import React

@objc(RNCarPlayDashboard)
public class RNCarPlayDashboard: UIViewController {
    var dashboardInterfaceController: CPDashboardController?
    var dashboardWindow: UIWindow
    var rnCarPlay: RNCarPlay?

    @objc public init(
        dashboardInterfaceController: CPDashboardController,
        dashboardWindow: UIWindow
    ) {
        self.dashboardInterfaceController = dashboardInterfaceController
        self.dashboardWindow = dashboardWindow
        super.init(nibName: nil, bundle: nil)
    }

    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    @objc public func connect(rootView: RCTRootView, rnCarPlay: RNCarPlay) {
        self.dashboardWindow.rootViewController = self
        self.dashboardWindow.rootViewController?.view = rootView
        self.rnCarPlay = rnCarPlay
        self.rnCarPlay?.sendEvent(withName: "dashboardDidConnect", body: nil)
    }

    @objc public func disonnect() {
        self.dashboardWindow.rootViewController = nil
        self.dashboardInterfaceController = nil
        self.rnCarPlay?.sendEvent(withName: "dashboardDidDisconnect", body: nil)
        self.rnCarPlay = nil
    }

    override public func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        let safeAreaInsets = [
            "bottom": self.view.safeAreaInsets.bottom,
            "left": self.view.safeAreaInsets.left,
            "right": self.view.safeAreaInsets.right,
            "top": self.view.safeAreaInsets.top,
        ]
        self.rnCarPlay?.sendEvent(
            withName: "dashboardSafeAreaInsetsChanged", body: safeAreaInsets)
    }

    override public func traitCollectionDidChange(
        _ previousTraitCollection: UITraitCollection?
    ) {
        super.traitCollectionDidChange(previousTraitCollection)
        if self.traitCollection.userInterfaceStyle
            != previousTraitCollection?.userInterfaceStyle
        {
            let mode =
                self.traitCollection.userInterfaceStyle == .dark
                ? "dark" : "light"
            self.rnCarPlay?.sendEvent(
                withName: "dashboardUserInterfaceStyleChanged",
                body: ["mode": mode])
        }
    }
}
