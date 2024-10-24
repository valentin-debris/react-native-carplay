#import <Foundation/Foundation.h>
#import <CarPlay/CarPlay.h>

@interface RNCPStore : NSObject {
}

@property (nonatomic, strong) CPInterfaceController *interfaceController;
@property (nonatomic, strong) CPWindow *window;
@property (nonatomic, strong) NSString *rootTemplateId;
@property (nonatomic, strong) id dashboard;
@property (nonatomic, assign) BOOL isConnected;

+ (instancetype)sharedManager;
- (CPTemplate*) findTemplateById: (NSString*)templateId;
- (NSString*) setTemplate:(NSString*)templateId template:(CPTemplate*)carPlayTemplate;
- (CPTrip*) findTripById: (NSString*)tripId;
- (NSString*) setTrip:(NSString*)tripId trip:(CPTrip*)trip;
- (CPNavigationSession*) findNavigationSessionById:(NSString*)navigationSessionId;
- (NSString*) setNavigationSession:(NSString*)navigationSessionId navigationSession:(CPNavigationSession*)navigationSession;
- (NSArray*) getTemplateIds;

@end
