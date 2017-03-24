/*
 * © Per Johansson
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */

"use strict";

if (!this.SfContentInterface) {

    const SfContentInterface = function(anInformationHolder) {
        const watchForPages = () => {
            const applicationNavigate = (event) => {
                // FIXME Works consistently only if delay here.
                // Is the page completely loaded? No.
                // Are the scripts injected? Yes
                //sleep(1000);
                let tab;
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
                const contentScriptsParams = new ContentScriptParams(null, anInformationHolder);

                event.target.page.dispatchMessage("updateSettings", contentScriptsParams);
            };
            // When a new tab was opened, a tab was reloaded, a new window was opened
            safari.application.addEventListener("navigate", applicationNavigate, false);
            const finishedTabProcessing = (event) => {
                if (event.name === "finishedTabProcessing") {
                    if (event.target instanceof SafariBrowserTab) {
                        const status = {};
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
            for (let browserWindow of safari.application.browserWindows) {
                for (let tab of browserWindow.tabs) {
                    if (tab.page) {
                        tab.page.dispatchMessage(
                            "updateSettings", new ContentScriptParams(null, anInformationHolder));
                    }
                }
            }
        };
        const toggleConversion = (aStatus) => {
            const sendStatusToTab = (aTab) => {
                // FIXME hasConvertedElements
                const status = {isEnabled: aStatus, hasConvertedElements: false};
                if (aTab.page) {
                    aTab.page.dispatchMessage("sendEnabledStatus", status);
                }
            };
            const sendStatusToWindow = (window) => {
                window.tabs.forEach(sendStatusToTab);
            };
            // console.log("toggleConversion aStatus " + aStatus);
            anInformationHolder.conversionEnabled = aStatus;
            safari.application.browserWindows.forEach(sendStatusToWindow);
        };
        const showSettingsTab = () => {
            const settingsUrl = safari.extension.baseURI + "settings.html";
            const currentWindow = safari.application.activeBrowserWindow;
            let currentTab = currentWindow.activeTab;
            if (currentTab.url === "") {
                currentTab.url = settingsUrl;
            }
            else {
                for (let browserWindow of safari.application.browserWindows) {
                    for (let tab of browserWindow.tabs)
                        if (tab.url === settingsUrl ) {
                            browserWindow.activate();
                            tab.activate();
                            return;
                        }
                }
                currentWindow.openTab("foreground").url = settingsUrl;
            }
        };
        const showTestTab = () => {
            const pricesUrl = safari.extension.baseURI + "prices.html";
            const currentWindow = safari.application.activeBrowserWindow;
            let currentTab = currentWindow.activeTab;
            if (currentTab.url === "") {
                currentTab.url = pricesUrl;
            }
            else {
                currentWindow.openTab("foreground").url = pricesUrl;
            }
        };
        const showQuotesTab = () => {
            const quotesUrl = safari.extension.baseURI + "quotes.html";
            const currentWindow = safari.application.activeBrowserWindow;
            let currentTab = currentWindow.activeTab;
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

    this.SfContentInterface = SfContentInterface;
}

if (typeof exports === "object") {
    exports.SfContentInterface = SfContentInterface;
}
