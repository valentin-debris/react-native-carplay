//
//  RNCarPlayNavigationAlertWrapper.swift
//  RNCarPlay
//
//  Created by Manuel Auer on 24.10.24.
//

import CarPlay

@objc(RNCarPlayNavigationAlertWrapper)
public class RNCarPlayNavigationAlertWrapper: NSObject {
    @objc public weak var navigationAlert: CPNavigationAlert?
    @objc public var userInfo: [String: Any]

    @objc public init(alert: CPNavigationAlert, userInfo: [String: Any]) {
        self.navigationAlert = alert
        self.userInfo = userInfo
    }
}
