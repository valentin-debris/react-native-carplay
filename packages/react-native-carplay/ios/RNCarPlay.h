#import <Foundation/Foundation.h>
#import <CarPlay/CarPlay.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import "RCTConvert+RNCarPlay.h"
#import "RNCPStore.h"
#import "Utils.h"

typedef void(^SearchResultUpdateBlock)(NSArray<CPListItem *> * _Nonnull);
typedef void(^SelectedResultBlock)(void);

@interface RNCarPlayNavigationAlertWrapper : NSObject

@property (nonatomic, weak) CPNavigationAlert *navigationAlert; // Weak reference
@property (nonatomic, strong) NSDictionary *userInfo; // Associated metadata

- (instancetype)initWithAlert:(CPNavigationAlert *)alert userInfo:(NSDictionary *)userInfo;

@end

@interface RNCarPlay : RCTEventEmitter<RCTBridgeModule, CPInterfaceControllerDelegate, CPSearchTemplateDelegate, CPListTemplateDelegate, CPMapTemplateDelegate,  CPTabBarTemplateDelegate, CPPointOfInterestTemplateDelegate, CPNowPlayingTemplateObserver> {
    CPInterfaceController *interfaceController;
    CPWindow *window;
    SearchResultUpdateBlock searchResultBlock;
    SelectedResultBlock selectedResultBlock;
    BOOL isNowPlayingActive;
    NSMutableArray<RNCarPlayNavigationAlertWrapper *> *navigationAlertWrappers;
}

@property (nonatomic, retain) CPInterfaceController *interfaceController;
@property (nonatomic, retain) CPWindow *window;
@property (nonatomic, copy) SearchResultUpdateBlock searchResultBlock;
@property (nonatomic, copy) SelectedResultBlock selectedResultBlock;
@property (nonatomic) BOOL isNowPlayingActive;
@property (nonatomic, strong) NSMutableArray<RNCarPlayNavigationAlertWrapper *> *navigationAlertWrappers;

+ (void) connectWithInterfaceController:(CPInterfaceController*)interfaceController window:(CPWindow*)window;
+ (void) disconnect;
- (NSArray<CPListSection*>*) parseSections:(NSArray*)sections templateId:(NSString *)templateId;
+ (void) connectWithDashbaordController:(CPDashboardController*)dashboardController window:(UIWindow*)window;
+ (void) disconnectFromDashbaordController;

@end
