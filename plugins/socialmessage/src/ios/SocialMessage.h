//
//  SocialMessage.h
//  Copyright (c) 2013 Lee Crossley - http://ilee.co.uk
//

#import <Cordova/CDVPlugin.h>
#import <Foundation/Foundation.h>

@interface SocialMessage : CDVPlugin

- (void) send:(CDVInvokedUrlCommand*)command;
- (void) shareTo:(CDVInvokedUrlCommand*)command;
- (void) canShareTo:(CDVInvokedUrlCommand*)command;

# pragma internal
- (NSString *)serviceTypeFromString:(NSString *)key;

@end