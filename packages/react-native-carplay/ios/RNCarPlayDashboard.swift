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
        guard let view = self.dashboardWindow.rootViewController?.view else {
            return
        }

        rootView.translatesAutoresizingMaskIntoConstraints = false
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

        setDashboardButtons(config: rootView.appProperties ?? [:])
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

    @objc public func setDashboardButtons(config: [AnyHashable: Any]) {
        var buttons: [CPDashboardButton] = []

        if let shortcutButtons = config["shortcutButtons"]
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

        self.dashboardInterfaceController?.shortcutButtons = buttons
    }
}
