//
//  GPS.h
//  HelloWorld
//
//  Created by Vitor Venturin Linhalis on 16/12/14.
//
//

#import <Cordova/CDV.h>
#import <CoreLocation/CoreLocation.h>

#define IS_OS_8_OR_LATER ([[[UIDevice currentDevice] systemVersion] floatValue] >= 8.0)

@interface GPS : CDVPlugin <CLLocationManagerDelegate>

- (void)escrever:(CDVInvokedUrlCommand*)command;

@end
