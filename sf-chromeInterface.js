/*
 * © 2014-2015 Per Johansson
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */
const SfChromeInterface = function(conversionEnabled) {
    "use strict";
    var buttonStatus = conversionEnabled;
    var setButtonAppearance = function() {
        var colour = buttonStatus ? "#00FF00" : "#FF0000";
        var text = buttonStatus ? "On" : "Off";
        chrome.browserAction.setBadgeBackgroundColor({color: colour});
        chrome.browserAction.setBadgeText({text: text});
    };
    setButtonAppearance();
    var onBrowserAction = function() {
        buttonStatus = !buttonStatus;
        setButtonAppearance();
        eventAggregator.publish("toggleConversion", buttonStatus);
    };
    // Toggle button clicked
    chrome.browserAction.onClicked.addListener(onBrowserAction);

};
