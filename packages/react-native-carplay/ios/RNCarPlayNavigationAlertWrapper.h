//
//  RNCarPlayNavigationAlertWrapper.h
//  RNCarPlay
//
//  Created by Manuel Auer on 24.10.24.
//
#import <CarPlay/CarPlay.h>

@interface RNCarPlayNavigationAlertWrapper : NSObject

@property (nonatomic, weak) CPNavigationAlert *navigationAlert; // Weak reference
@property (nonatomic, strong) NSDictionary *userInfo; // Associated metadata

- (instancetype)initWithAlert:(CPNavigationAlert *)alert userInfo:(NSDictionary *)userInfo;

@end
