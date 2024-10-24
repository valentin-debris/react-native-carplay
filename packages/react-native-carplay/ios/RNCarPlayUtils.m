//
//  Constants.m
//  RNCarPlay
//
//  Created by Manuel Auer on 13.10.24.
//

#import "RNCarPlayUtils.h"

NSString *const RNCarPlaySendEventNotification = @"RNCarPlaySendEventNotification";

void sendRNCarPlayEvent(NSString *name, NSDictionary *body) {
    NSDictionary *userInfo = body ? body : @{};
    [[NSNotificationCenter defaultCenter] postNotificationName:RNCarPlaySendEventNotification
                                                        object:nil
                                                      userInfo:@{@"name": name, @"body": userInfo}];
}
