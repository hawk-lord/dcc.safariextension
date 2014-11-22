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
        // alert("messageListener ");
        // Check "sendEnabledStatus" or "updateSettings"
        if (msg.name === "contentScriptParams") {
            // alert("onUpdateSettings");
            DirectCurrencyContent.onUpdateSettings(msg.message);
        }
        else {
            // alert("onSendEnabledStatus");
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
            // "finishedTabProcessing"
            //thePort.postMessage(hasConvertedElements);
            safari.self.tab.dispatchMessage("finishedTabProcessing", hasConvertedElements);
        }
    };

}();


// OK example connect to main
//var port = chrome.runtime.connect({name: "knockknock"});
//port.postMessage({joke: "Knock knock"});
//port.onMessage.addListener(function(msg) {
//    if (msg.question == "Who's there?")
//        port.postMessage({answer: "Madame"});
//    else if (msg.question == "Madame who?")
//        port.postMessage({answer: "Madame... Bovary"});
//});
