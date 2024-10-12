//
//  RNCarPlayViewController.m
//  react-native-carplay
//
//  Created by Susan Thapa on 27/02/2024.
//

#import "RNCarPlayViewController.h"
#import <Foundation/Foundation.h>
#import <React/RCTRootView.h>

@interface RNCarPlayViewController ()

@property(nonatomic, strong) RCTRootView *rootView;

@end

@implementation RNCarPlayViewController

- (instancetype)initWithRootView:(RCTRootView *)rootView {
    self = [super init];
    if (self) {
        _rootView = rootView;
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
            [self.rootView.leadingAnchor
                constraintEqualToAnchor:self.view.leadingAnchor],
            [self.rootView.trailingAnchor
                constraintEqualToAnchor:self.view.trailingAnchor],
            [self.rootView.topAnchor
                constraintEqualToAnchor:self.view.topAnchor],
            [self.rootView.bottomAnchor
                constraintEqualToAnchor:self.view.bottomAnchor],
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
    sendRNCarPlayEvent(@"safeAreaInsetsChanged", @{
        @"bottom" : @(currentSafeAreaInsets.bottom),
        @"left" : @(currentSafeAreaInsets.left),
        @"right" : @(currentSafeAreaInsets.right),
        @"top" : @(currentSafeAreaInsets.top),
        @"templateId" : self.rootView.moduleName
    });
}

@end
