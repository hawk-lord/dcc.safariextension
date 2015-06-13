/*
 * © 2014-2015 Per Johansson
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */
const SfChromeInterface = function(aConversionEnabled) {
    "use strict";
    var buttonStatus = aConversionEnabled;
    var onBrowserAction = function(event) {
        if (event.command === "toggle") {
            buttonStatus = !buttonStatus;
            var checkToggleButton = function(element) {
                if (element && element.identifier === "dcc-tools-button") {
                    element.badge = buttonStatus ? 1 : 0;
                }
            };
            safari.extension.toolbarItems.forEach(checkToggleButton);
            eventAggregator.publish("toggleConversion", buttonStatus);
        }
        else if (event.command === "open-settings") {
            eventAggregator.publish("showSettingsTab");
        }
        else if (event.command === "open-testpage") {
            eventAggregator.publish("showTestTab");
        }
    };
    var setConversionButtonState = function(aStatus) {
        var checkToggleButton = function(element) {
            if (element && element.identifier === "dcc-tools-button") {
                element.badge = buttonStatus ? 1 : 0;
            }
        };
        safari.extension.toolbarItems.forEach(checkToggleButton);
    };
    safari.application.addEventListener("command", onBrowserAction, false);
    return {
        setConversionButtonState: setConversionButtonState
    }
};
