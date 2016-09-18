/*
 * © 2014-2015 Per Johansson
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
/*
        var windowNavigate = function(event) {
            console.log("windowNavigate " + anInformationHolder.conversionEnabled + event.type + event.target + event.currentTarget);
            //event.target.page.dispatchMessage("updateSettings", new ContentScriptParams(null, anInformationHolder));
            var status = {};
            status.isEnabled = anInformationHolder.conversionEnabled;
            // FIXME hard coded
            status.hasConvertedElements = false;
            event.target.page.dispatchMessage("sendEnabledStatus", status);
            //eventAggregator.publish("toggleConversion", anInformationHolder.conversionEnabled);
        };
        // initialise all tabs
        for (var i = 0; i < safari.application.browserWindows.length; ++i) {
            var browserWindow = safari.application.browserWindows[i];
            // When a tab was reloaded or opened another page
            browserWindow.addEventListener("navigate", windowNavigate, false);
            for (var j = 0; j < browserWindow.tabs.length; ++j) {
                browserWindow.tabs[j].page.dispatchMessage(
                    "updateSettings", new ContentScriptParams(null, anInformationHolder));
            }

        }
*/
        for (var browserWindow of safari.application.browserWindows) {
            for (var tab of browserWindow.tabs) {
                if (tab.page) {
                    tab.page.dispatchMessage(
                        "updateSettings", new ContentScriptParams(null, anInformationHolder));
                }
            }
        }
        // console.log("anInformationHolder.conversionEnabled "  + anInformationHolder.conversionEnabled);
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
    /*
    var closeSettingsTab = function() {
    };
     */
    return {
        watchForPages: watchForPages,
        toggleConversion: toggleConversion,
        showSettingsTab: showSettingsTab,
        showTestTab: showTestTab
        //closeSettingsTab: closeSettingsTab
    }
};

if (typeof exports === "object") {
    exports.SfContentInterface = SfContentInterface;
}
