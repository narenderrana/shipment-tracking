//
//  GPS.m
//  HelloWorld
//
//  Created by Vitor Venturin Linhalis on 16/12/14.
//
//

#import "GPS.h"
#import <Cordova/CDV.h>

@implementation GPS

CLLocationManager *locationManager;
static double lat;
static double lng;

- (void)escrever:(CDVInvokedUrlCommand*)command
{
    CDVPluginResult* pluginResult = nil;
    
    locationManager = [[CLLocationManager alloc] init];
    
    locationManager.delegate = self;
    locationManager.desiredAccuracy = kCLLocationAccuracyBest;
    
    if(IS_OS_8_OR_LATER) {
        NSLog(@"IOS 8");
        if ([locationManager respondsToSelector:@selector(requestAlwaysAuthorization)]) {
            [locationManager requestAlwaysAuthorization];
        }
    }
    
    [locationManager startUpdatingLocation];
    
    NSString *latString = [NSString stringWithFormat:@"%.6f", lat];
    NSString *lngString = [NSString stringWithFormat:@"%.6f", lng];
    
    NSArray *vetor = [[NSArray alloc] initWithObjects:latString,lngString,nil];
    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsArray:vetor];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

#pragma mark - CLLocationManagerDelegate

- (void)requestAlwaysAuthorization
{
    CLAuthorizationStatus status = [CLLocationManager authorizationStatus];
    
    // If the status is denied or only granted for when in use, display an alert
    if (status == kCLAuthorizationStatusAuthorizedWhenInUse || status == kCLAuthorizationStatusDenied) {
        NSString *title;
        title = (status == kCLAuthorizationStatusDenied) ? @"Location services are off" : @"Background location is not enabled";
        NSString *message = @"To use background location you must turn on 'Always' in the Location Services Settings";
        
        UIAlertView *alertView = [[UIAlertView alloc] initWithTitle:title
                                                            message:message
                                                           delegate:self
                                                  cancelButtonTitle:@"Cancel"
                                                  otherButtonTitles:@"Settings", nil];
        [alertView show];
    }
    // The user has not enabled any location services. Request background authorization.
    else if (status == kCLAuthorizationStatusNotDetermined) {
        [locationManager requestAlwaysAuthorization];
    }
}

- (void)alertView:(UIAlertView *)alertView clickedButtonAtIndex:(NSInteger)buttonIndex
{
    if (buttonIndex == 1) {
        // Send the user to the Settings for this app
        NSURL *settingsURL = [NSURL URLWithString:UIApplicationOpenSettingsURLString];
        [[UIApplication sharedApplication] openURL:settingsURL];
    }
}

-(void)locationManager:(CLLocationManager *)manager didUpdateLocations:(NSArray *)locations {
    CLLocation *currentLocation = [locations lastObject];
    
    if (currentLocation != nil) {
        NSDate* eventDate = currentLocation.timestamp;
        NSTimeInterval howRecent = [eventDate timeIntervalSinceNow];
        if (abs(howRecent) < 15.0) {
            // If the event is recent, do something with it.
            lat = currentLocation.coordinate.latitude;
            lng = currentLocation.coordinate.longitude;
        }
    }
}

- (void)locationManager:(CLLocationManager *)manager didFailWithError:(NSError *)error {
    UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"Oi" message:[NSString stringWithFormat:@"%@",error] delegate:self cancelButtonTitle:@"cancel" otherButtonTitles:nil, nil];
    [alert show];
}

@end