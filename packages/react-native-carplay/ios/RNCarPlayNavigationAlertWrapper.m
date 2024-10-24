//
//  RNCarPlayNavigationAlertWrapper.m
//  RNCarPlay
//
//  Created by Manuel Auer on 24.10.24.
//
#import "RNCarPlayNavigationAlertWrapper.h"

@implementation RNCarPlayNavigationAlertWrapper

- (instancetype)initWithAlert:(CPNavigationAlert *)alert userInfo:(NSDictionary *)userInfo {
    self = [super init];
    if (self) {
        _navigationAlert = alert;
        _userInfo = userInfo;
    }
    return self;
}

@end
