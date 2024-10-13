import CarPlay
import React

@objc(RNCarPlayDashboard)
public class RNCarPlayDashboard: UIViewController {
    var dashboardInterfaceController: CPDashboardController?
    var dashboardWindow: UIWindow

    @objc public init(
        dashboardInterfaceController: CPDashboardController,
        dashboardWindow: UIWindow
    ) {
        self.dashboardInterfaceController = dashboardInterfaceController
        self.dashboardWindow = dashboardWindow
        super.init(nibName: nil, bundle: nil)

        self.dashboardWindow.rootViewController = self
    }

    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    @objc public func connect(rootView: RCTRootView) {
        rootView.translatesAutoresizingMaskIntoConstraints = false

        guard let view = self.dashboardWindow.rootViewController?.view else {
            return
        }
        
        self.dashboardWindow.rootViewController?.view.addSubview(rootView)

        NSLayoutConstraint.activate([
            rootView.topAnchor.constraint(equalTo: view.topAnchor),
            rootView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            rootView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            rootView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
        ])
        
        sendRNCarPlayEvent(
            "dashboardDidConnect", getConnectedWindowInformation())
        RNCPStore.sharedManager().setIsDashboardConnected(true)

        if let shortcutButtons = rootView.appProperties?["shortcutButtons"]
            as? [[String: Any]]
        {
            for button in shortcutButtons {
                guard
                    let index = button["index"] as? Int,
                    let image = button["image"] as? [String: Any],
                    let subtitleVariants = button["subtitleVariants"]
                        as? [String],
                    let titleVariants = button["titleVariants"] as? [String]
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
                }

                self.dashboardInterfaceController?.shortcutButtons.append(
                    shortcutButton)
            }
        }
    }

    @objc public func disonnect() {
        self.dashboardWindow.rootViewController = nil
        self.dashboardInterfaceController = nil
        sendRNCarPlayEvent("dashboardDidDisconnect", nil)
        RNCPStore.sharedManager().setIsDashboardConnected(false)
    }

    override public func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        let safeAreaInsets = [
            "bottom": self.view.safeAreaInsets.bottom,
            "left": self.view.safeAreaInsets.left,
            "right": self.view.safeAreaInsets.right,
            "top": self.view.safeAreaInsets.top,
        ]
        sendRNCarPlayEvent("dashboardSafeAreaInsetsChanged", safeAreaInsets)
    }

    @objc public func getConnectedWindowInformation() -> [String: Any] {
        return [
            "height": self.dashboardWindow.bounds.size.height,
            "width": self.dashboardWindow.bounds.size.width,
            "scale": self.dashboardWindow.screen.scale,
        ]
    }
}
