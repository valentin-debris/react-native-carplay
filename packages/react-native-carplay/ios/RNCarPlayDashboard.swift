import CarPlay
import React

@objc(RNCarPlayDashboard)
public class RNCarPlayDashboard: NSObject {
    var dashboardInterfaceController: CPDashboardController?
    var dashboardWindow: UIWindow
    
    @objc public init(dashboardInterfaceController: CPDashboardController, dashboardWindow: UIWindow) {
        self.dashboardInterfaceController = dashboardInterfaceController
        self.dashboardWindow = dashboardWindow
    }
    
    @objc public func connect() {
        self.dashboardWindow.rootViewController = UIViewController();
    }
    
    @objc public func disonnect() {
        self.dashboardWindow.rootViewController = nil;
        self.dashboardInterfaceController = nil;
    }
    
    @objc public func attach(rootView: RCTRootView) {
        self.dashboardWindow.rootViewController?.view = rootView
    }
}
