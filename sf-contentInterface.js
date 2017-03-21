/*
 * © Per Johansson
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */
const SfContentInterface = function(anInformationHolder) {
    "use strict";
    var watchForPages = function() {
        var applicationNavigate = function(event) {
            // FIXME Works consistently only if delay here.
            // Is the page completely loaded? No.
            // Are the scripts injected? Yes
            //sleep(1000);
            var tab;
            if (event.target instanceof SafariBrowserTab) {
                // A background tab could be navigating.
                if (event.type === "navigate" && event.target != safari.application.activeBrowserWindow.activeTab) {
                    return;
                }
                tab = event.target;
            }
            else {
                tab = event.target.activeTab;
            }
            var contentScriptsParams = new ContentScriptParams(null, anInformationHolder);

            event.target.page.dispatchMessage("updateSettings", contentScriptsParams);
        };
        // When a new tab was opened, a tab was reloaded, a new window was opened
        safari.application.addEventListener("navigate", applicationNavigate, false);
        var finishedTabProcessing = function(event) {
            if (event.name === "finishedTabProcessing") {
                if (event.target instanceof SafariBrowserTab) {
                    var status = {};
                    status.isEnabled = anInformationHolder.conversionEnabled;
                    status.hasConvertedElements = event.message;
                    event.target.page.dispatchMessage("sendEnabledStatus", status);
                    // TODO remember the result; hasConvertedElements
                    // console.log(event.name + " " + event.message);
                }
            }
        };
        // When a message is received
        safari.application.addEventListener("message", finishedTabProcessing, false);
        for (var browserWindow of safari.application.browserWindows) {
            for (var tab of browserWindow.tabs) {
                if (tab.page) {
                    tab.page.dispatchMessage(
                        "updateSettings", new ContentScriptParams(null, anInformationHolder));
                }
            }
        }
    };
    var toggleConversion = function(aStatus) {
        var sendStatusToTab = function(aTab) {
            // FIXME hasConvertedElements
            var status = {isEnabled: aStatus, hasConvertedElements: false};
            if (aTab.page) {
                aTab.page.dispatchMessage("sendEnabledStatus", status);
            }
        };
        var sendStatusToWindow = function(window) {
            window.tabs.forEach(sendStatusToTab);
        };
        // console.log("toggleConversion aStatus " + aStatus);
        anInformationHolder.conversionEnabled = aStatus;
        safari.application.browserWindows.forEach(sendStatusToWindow);
    };
    var showSettingsTab = function() {
        var settingsUrl = safari.extension.baseURI + "settings.html";
        var currentWindow = safari.application.activeBrowserWindow;
        var currentTab = currentWindow.activeTab;
        if (currentTab.url === "") {
            currentTab.url = settingsUrl;
        }
        else {
            for (var browserWindow of safari.application.browserWindows) {
                for (var tab of browserWindow.tabs)
                    if (tab.url === settingsUrl ) {
                        browserWindow.activate();
                        tab.activate();
                        return;
                    }
            }
            currentWindow.openTab("foreground").url = settingsUrl;
        }
    };
    var showTestTab = function() {
        var pricesUrl = safari.extension.baseURI + "prices.html";
        var currentWindow = safari.application.activeBrowserWindow;
        var currentTab = currentWindow.activeTab;
        if (currentTab.url === "") {
            currentTab.url = pricesUrl;
        }
        else {
            currentWindow.openTab("foreground").url = pricesUrl;
        }
    };
    var showQuotesTab = function() {
        var quotesUrl = safari.extension.baseURI + "quotes.html";
        var currentWindow = safari.application.activeBrowserWindow;
        var currentTab = currentWindow.activeTab;
        if (currentTab.url === "") {
            currentTab.url = quotesUrl;
        }
        else {
            currentWindow.openTab("foreground").url = quotesUrl;
        }
    };
    return {
        watchForPages: watchForPages,
        toggleConversion: toggleConversion,
        showSettingsTab: showSettingsTab,
        showTestTab: showTestTab,
        showQuotesTab: showQuotesTab
    }
};

if (typeof exports === "object") {
    exports.SfContentInterface = SfContentInterface;
}
