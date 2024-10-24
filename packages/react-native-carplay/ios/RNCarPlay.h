#import <Foundation/Foundation.h>
#import <CarPlay/CarPlay.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import "RCTConvert+RNCarPlay.h"
#import "RNCPStore.h"

typedef void(^SearchResultUpdateBlock)(NSArray<CPListItem *> * _Nonnull);
typedef void(^SelectedResultBlock)(void);

@interface RNCarPlay : RCTEventEmitter<RCTBridgeModule, CPInterfaceControllerDelegate, CPSearchTemplateDelegate, CPListTemplateDelegate, CPMapTemplateDelegate,  CPTabBarTemplateDelegate, CPPointOfInterestTemplateDelegate, CPNowPlayingTemplateObserver> {
    SearchResultUpdateBlock searchResultBlock;
    SelectedResultBlock selectedResultBlock;
    BOOL isNowPlayingActive;
}

@property (nonatomic, retain) CPInterfaceController * _Nullable interfaceController;
@property (nonatomic, retain) CPWindow * _Nullable window;
@property (nonatomic, copy) SearchResultUpdateBlock _Nullable searchResultBlock;
@property (nonatomic, copy) SelectedResultBlock _Nullable selectedResultBlock;
@property (nonatomic) BOOL isNowPlayingActive;

+ (void) connectWithInterfaceController:(CPInterfaceController*_Nullable)interfaceController window:(CPWindow*_Nonnull)window;
+ (void) disconnect;
- (NSArray<CPListSection*>*_Nullable) parseSections:(NSArray*_Nonnull)sections templateId:(NSString *_Nonnull)templateId;
+ (void) connectWithDashboardController:(CPDashboardController*_Nonnull)dashboardController window:(UIWindow*_Nonnull)window;
+ (void) disconnectFromDashbaordController;

@end
