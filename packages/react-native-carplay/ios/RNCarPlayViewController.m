//
//  RNCarPlayViewController.m
//  react-native-carplay
//
//  Created by Susan Thapa on 27/02/2024.
//

#import <Foundation/Foundation.h>
#import "RNCarPlayViewController.h"
#import <React/RCTRootView.h>

@interface RNCarPlayViewController ()

@property (nonatomic, strong) RCTRootView *rootView;
@property (nonatomic, weak) RNCarPlay *rnCarPlay;

@end

@implementation RNCarPlayViewController

- (instancetype)initWithRootView:(RCTRootView *)rootView rnCarPlay:(RNCarPlay *)rnCarPlay {
    self = [super init];
    if (self) {
        _rootView = rootView;
        _rnCarPlay = rnCarPlay;
    }
    return self;
}

- (void)viewDidLoad {
    [super viewDidLoad];
    self.view.translatesAutoresizingMaskIntoConstraints = false;
    if (self.rootView) {
        self.rootView.translatesAutoresizingMaskIntoConstraints = false;
        self.rootView.frame = self.view.bounds;
        [self.view addSubview:self.rootView];
        
        [NSLayoutConstraint activateConstraints:@[
            [self.rootView.leadingAnchor constraintEqualToAnchor:self.view.leadingAnchor],
            [self.rootView.trailingAnchor constraintEqualToAnchor:self.view.trailingAnchor],
            [self.rootView.topAnchor constraintEqualToAnchor:self.view.topAnchor],
            [self.rootView.bottomAnchor constraintEqualToAnchor:self.view.bottomAnchor],
        ]];
    }
}

- (void)viewWillLayoutSubviews {
    [super viewWillLayoutSubviews];
    self.rootView.frame = self.view.bounds;
}

- (void)viewDidLayoutSubviews {
    [super viewDidLayoutSubviews];

    UIEdgeInsets currentSafeAreaInsets = self.view.safeAreaInsets;
    [self.rnCarPlay sendEventWithName:@"safeAreaInsetsChanged" body:@{
        @"bottom": @(currentSafeAreaInsets.bottom),
        @"left": @(currentSafeAreaInsets.left),
        @"right": @(currentSafeAreaInsets.right),
        @"top": @(currentSafeAreaInsets.top)
    }];
}

- (void)traitCollectionDidChange:(UITraitCollection *)previousTraitCollection {
    [super traitCollectionDidChange:previousTraitCollection];

    if (self.traitCollection.userInterfaceStyle != previousTraitCollection.userInterfaceStyle) {
        NSString *mode = self.traitCollection.userInterfaceStyle == UIUserInterfaceStyleDark ? @"dark" : @"light";
        [self.rnCarPlay sendEventWithName:@"userInterfaceStyleChanged" body:mode];
    }
}

@end
