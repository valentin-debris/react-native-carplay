//
//  Constants.h
//  RNCarPlay
//
//  Created by Manuel Auer on 13.10.24.
//

#ifndef Utils_h
#define Utils_h

#import <Foundation/Foundation.h>

extern NSString *const RNCarPlaySendEventNotification;

extern void sendRNCarPlayEvent(NSString *name, NSDictionary *body);

#endif
