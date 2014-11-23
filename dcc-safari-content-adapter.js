/*
 * © 2014 Per Johansson
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Based on code from Simple Currency Converter
 * https://addons.mozilla.org/en-US/firefox/addon/simple-currency-converter/
 *
 * Module pattern is used.
 */
const ContentAdapter = function() {

    const messageListener = function(msg) {
        if (msg.name === "contentScriptParams") {
            DirectCurrencyContent.onUpdateSettings(msg.message);
        }
        else if (msg.name === "sendEnabledStatus") {
            DirectCurrencyContent.onSendEnabledStatus(msg.message);
        }
    };

    /**
     * void addEventListener(in DOMString type, in SafariEventListener listener, in boolean useCapture);
     * https://developer.apple.com/library/safari/documentation/UserExperience/Reference/SafariEventTarget/SafariEventTarget/SafariEventTarget.html#//apple_ref/javascript/instm/SafariEventTarget/addEventListener
     */
    safari.self.addEventListener("message", messageListener, false);

    return {
        finish: function (hasConvertedElements) {
            safari.self.tab.dispatchMessage("finishedTabProcessing", hasConvertedElements);
        }
    };

}();

