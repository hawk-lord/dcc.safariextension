/*
 * © Per Johansson
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */

"use strict";

if (!this.SfChromeInterface) {

    const SfChromeInterface = function(aConversionEnabled) {
        let buttonStatus = aConversionEnabled;
        const onBrowserAction = (event) => {
            if (event.command === "toggle") {
                buttonStatus = !buttonStatus;
                const checkToggleButton = (element) => {
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
            else if (event.command === "open-quotespage") {
                eventAggregator.publish("showQuotesTab");
            }
        };
        const setConversionButtonState = (aStatus) => {
            const checkToggleButton = (element) => {
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

    this.SfChromeInterface = SfChromeInterface;
}

