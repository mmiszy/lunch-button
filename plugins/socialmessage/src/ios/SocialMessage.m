//
//  SocialMessage.m
//  Copyright (c) 2013 Lee Crossley - http://ilee.co.uk
//

#import "SocialMessage.h"
#import <Social/Social.h>

@implementation SocialMessage

- (void) send:(CDVInvokedUrlCommand*)command;
{
    NSMutableDictionary *args = [command.arguments objectAtIndex:0];
    NSString *text = [args objectForKey:@"text"];
    NSString *url = [args objectForKey:@"url"];
    NSString *image = [args objectForKey:@"image"];
    NSString *subject = [args objectForKey:@"subject"];
    NSArray *activityTypes = [[args objectForKey:@"activityTypes"] componentsSeparatedByString:@","];

    NSMutableArray *items = [NSMutableArray new];
    if (text)
    {
        [items addObject:text];
    }
    if (url)
    {
        NSURL *formattedUrl = [NSURL URLWithString:[NSString stringWithFormat:@"%@", url]];
        [items addObject:formattedUrl];
    }
    if (image)
    {
        UIImage *imageFromUrl = [UIImage imageWithData:[NSData dataWithContentsOfURL:[NSURL URLWithString:[NSString stringWithFormat:@"%@", image]]]];
        [items addObject:imageFromUrl];
    }

    UIActivityViewController *activity = [[UIActivityViewController alloc] initWithActivityItems:items applicationActivities:Nil];
    [activity setValue:subject forKey:@"subject"];

    NSMutableArray *exclusions = [[NSMutableArray alloc] init];

    if (![activityTypes containsObject:@"PostToFacebook"])
    {
        [exclusions addObject: UIActivityTypePostToFacebook];
    }
    if (![activityTypes containsObject:@"PostToTwitter"])
    {
        [exclusions addObject: UIActivityTypePostToTwitter];
    }
    if (![activityTypes containsObject:@"PostToWeibo"])
    {
        [exclusions addObject: UIActivityTypePostToWeibo];
    }
    if (![activityTypes containsObject:@"Message"])
    {
        [exclusions addObject: UIActivityTypeMessage];
    }
    if (![activityTypes containsObject:@"Mail"])
    {
        [exclusions addObject: UIActivityTypeMail];
    }
    if (![activityTypes containsObject:@"Print"])
    {
        [exclusions addObject: UIActivityTypePrint];
    }
    if (![activityTypes containsObject:@"CopyToPasteboard"])
    {
        [exclusions addObject: UIActivityTypeCopyToPasteboard];
    }
    if (![activityTypes containsObject:@"AssignToContact"])
    {
        [exclusions addObject: UIActivityTypeAssignToContact];
    }
    if (![activityTypes containsObject:@"SaveToCameraRoll"])
    {
        [exclusions addObject: UIActivityTypeSaveToCameraRoll];
    }

    if ([[[UIDevice currentDevice] systemVersion] floatValue] >= 7.0)
    {
        if (![activityTypes containsObject:@"AddToReadingList"])
        {
            [exclusions addObject: UIActivityTypeAddToReadingList];
        }
        if (![activityTypes containsObject:@"PostToFlickr"])
        {
            [exclusions addObject: UIActivityTypePostToFlickr];
        }
        if (![activityTypes containsObject:@"PostToVimeo"])
        {
            [exclusions addObject: UIActivityTypePostToVimeo];
        }
        if (![activityTypes containsObject:@"TencentWeibo"])
        {
            [exclusions addObject: UIActivityTypePostToTencentWeibo];
        }
        if (![activityTypes containsObject:@"AirDrop"])
        {
            [exclusions addObject: UIActivityTypeAirDrop];
        }
    }

    activity.excludedActivityTypes = exclusions;

    [self.viewController presentViewController:activity animated:YES completion:Nil];
}

- (void) canShareTo:(CDVInvokedUrlCommand*)command;
{
    [self.commandDelegate runInBackground:^{
        CDVPluginResult *pluginResult;
        NSMutableDictionary *args = [command.arguments objectAtIndex:0];
        NSString *activityType = [args objectForKey:@"activityType"];
    
        if ([self serviceTypeFromString:activityType] != nil) {
            pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        } else {
            pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR];
        }
        NSString* payload = nil;
        // Some blocking logic...
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:payload];
        // The sendPluginResult method is thread-safe.
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    }];
}

- (NSString *) serviceTypeFromString:(NSString *)key
{
    NSDictionary *serviceTypeMap = @{
                                     @"PostToFacebook": SLServiceTypeFacebook,
                                     @"PostToTwitter": SLServiceTypeTwitter,
                                     @"PostToWeibo": SLServiceTypeSinaWeibo,
                                     @"PostToTencentWeibo": SLServiceTypeTencentWeibo
                                     };
    return serviceTypeMap[key];
}

- (void) shareTo:(CDVInvokedUrlCommand*)command;
{
    [self.commandDelegate runInBackground:^{
        NSMutableDictionary *args = [command.arguments objectAtIndex:0];
        NSString *text = [args objectForKey:@"text"];
        NSString *url = [args objectForKey:@"url"];
        NSString *image = [args objectForKey:@"image"];
        NSString *activityType = [args objectForKey:@"activityType"];
        CDVPluginResult *pluginResult;
        

        NSString *serviceType = [self serviceTypeFromString:activityType];
        if (serviceType == nil) {
            pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_INVALID_ACTION messageAsString:@"unsupported service type"];
            [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
            return;
        }
        if (![SLComposeViewController isAvailableForServiceType:serviceType]) {
            pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_INVALID_ACTION messageAsString:@"unconfigured service type"];
            [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
            return;
        }
        
        SLComposeViewController *viewController = [SLComposeViewController composeViewControllerForServiceType:serviceType];
        [viewController setInitialText:text];
        [viewController addURL:[NSURL URLWithString:url]];
        
        if (image)
        {
            UIImage *imageFromUrl = [UIImage imageWithData:[NSData dataWithContentsOfURL:[NSURL URLWithString:[NSString stringWithFormat:@"%@", image]]]];
            [viewController addImage:imageFromUrl];
        }
        
        UIViewController *rootViewController = [UIApplication sharedApplication].keyWindow.rootViewController;
        viewController.completionHandler = ^(SLComposeViewControllerResult result) {
            CDVPluginResult *pluginResult;
            
            // TODO: if iOS < 7, dismiss SLComposeViewController manually
            switch (result) {
                case SLComposeViewControllerResultCancelled:
                    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:@"cancelled"];
                    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
                    break;
                    
                default:
                    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:@"done"];
                    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
                    break;
            }
            
            //  dismiss the sheet under iOS < 7
            dispatch_async(dispatch_get_main_queue(), ^{
                [rootViewController dismissViewControllerAnimated:NO completion:nil];
            });
        };
        
        [rootViewController presentModalViewController:viewController animated:YES];
    }];
}

@end