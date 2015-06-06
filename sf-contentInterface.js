/*
 * © 2014-2015 Per Johansson
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */
const SfContentInterface = function(anInformationHolder) {
    "use strict";
    // let settingsWorker = null;
    // let testPageWorker = null;
    var customTabObjects = [];
    var CustomTabObject = function() {
        "use strict";
        this.enabled = false;
        this.hasConvertedElements = false;
        //this.workers = [];
    };
    var sendEnabledStatus = function(customTabObject, status) {
        // console.log("sendEnabledStatus " + status);
        if (customTabObject.port) {
            try {
                customTabObject.port.postMessage(status);
            }
            catch(err) {
                // TODO handle Error: Attempting to use a disconnected port object
            }
        }
    };
    var sendSettingsToPage = function(tabId, changeInfo, tab) {
        // console.log("sendSettingsToPage " + tabId);
        var contentPort;
        var finishedTabProcessingHandler = function (aHasConvertedElements) {
            try {
                // console.log("finishedTabProcessingHandler " + aHasConvertedElements);
                if (!customTabObjects[tabId]) {
                    customTabObjects[tabId] = new CustomTabObject();
                }
                customTabObjects[tabId].isEnabled = anInformationHolder.conversionEnabled;
                customTabObjects[tabId].hasConvertedElements = aHasConvertedElements;
                customTabObjects[tabId].port = contentPort;
            }
            catch (err) {
                console.error("finishedTabProcessingHandler " + err);
            }
        };
        var onScriptExecuted = function () {
            // console.log("onScriptExecuted tabId " + tabId);
            contentPort = chrome.tabs.connect(tabId, {name: "dccContentPort"});
            try {
                // TODO Don't send null
                contentPort.postMessage(new ContentScriptParams(null, anInformationHolder));            }
            catch (err) {
                console.error(err);
            }
            contentPort.onMessage.addListener(finishedTabProcessingHandler);
        };
        // console.log("attachHandler tabId " + tabId);
        // console.log("attachHandler changeInfo.status " + changeInfo.status);
        // console.log("attachHandler changeInfo.url " + changeInfo.url);
        // console.log("attachHandler tab.url " + tab.url);
        // Not allowed in https://chrome.google.com/webstore
        // console.log(changeInfo.status === "complete" && tab && tab.url && tab.url.indexOf("http") === 0);
        if (changeInfo.status === "complete" && tab && tab.url && tab.url.indexOf("http") === 0
            && tab.url.indexOf("https://chrome.google.com/webstore") === -1
            && tab.url.indexOf("https://addons.opera.com") === -1) {
            chrome.tabs.executeScript(tabId, {file: "common/dcc-regexes.js", allFrames: true}, function(){
                chrome.tabs.executeScript(tabId, {file: "common/dcc-content.js", allFrames: true}, function(){
                    chrome.tabs.executeScript(tabId, {file: "dcc-chrome-content-adapter.js", allFrames: true},
                        onScriptExecuted);
                });
            });
        }
    };
    var watchForPages = function() {
        // console.log("watchForPages");
        var addTabs = function(aTabs) {
            // console.log("addTabs");
            aTabs.map(function(aTab) {
                // console.log("aTab.id " + aTab.id);
                if (!customTabObjects[aTab.id]) {
                    customTabObjects[aTab.id] = new CustomTabObject();
                }
                // console.log(aTab);
                sendSettingsToPage(aTab.id, {status: "complete"}, aTab)
            });
        };
        // FIXME attach to existing tabs
        var setTabs = function(aTab) {
            if (!customTabObjects[aTab.id]) {
                customTabObjects[aTab.id] = new CustomTabObject();
            }
            customTabObjects[aTab.id].isEnabled = anInformationHolder.conversionEnabled;
            eventAggregator.publish("toggleConversion", anInformationHolder.conversionEnabled);
        };
        var releaseTabs = function(aTab) {
            //if (settingsWorker && settingsWorker.settingsTab) {
            //    if (settingsWorker.settingsTab.title == aTab.title) {
            //        settingsWorker.settingsTab = null;
            //    }
            //    else {
            //        customTabObjects[aTab.id] = null;
            //    }
            //}
            //else {
                customTabObjects[aTab.id] = null;
            //}
        };
        chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
            if (tab.url.indexOf("http") === 0 && changeInfo.status === "complete") {
                setTabs(tab);
            }
        });

        chrome.tabs.onUpdated.addListener(sendSettingsToPage);
        chrome.tabs.query({}, addTabs);
    };
    var toggleConversion = function(aStatus) {
        // console.log("toggleConversion");
        var updateTab = function(aTab) {
            // console.log("aTab.id " + aTab.id);
            if (!customTabObjects[aTab.id]) {
                customTabObjects[aTab.id] = new CustomTabObject();
            }
            customTabObjects[aTab.id].isEnabled = aStatus;
            // console.log("aStatus " + aStatus);
            anInformationHolder.conversionEnabled = aStatus;
            var makeEnabledStatus = function(customTabObject) {
                // console.log("sendEnabledStatus ");
                var status = {};
                status.isEnabled = aStatus;
                status.hasConvertedElements = customTabObject.hasConvertedElements;
                try {
                    sendEnabledStatus(customTabObject, status);
                }
                catch(err) {
                    console.error("ContentInterface: " + err);
                }
            };
            customTabObjects.map(makeEnabledStatus);
            customTabObjects[aTab.id].hasConvertedElements = true;
        };
        var updateActiveTabs = function(aTabs) {
            // console.log("updateActiveTabs " + aTabs.length);
            aTabs.map(updateTab);
        };
        chrome.tabs.query({}, updateActiveTabs);
    };
    /*
    var showSettingsTab = function() {
        var isOpen = settingsWorker && settingsWorker.settingsTab ;
        if (!isOpen) {
            tabs.open({url: "./settings.html"});
        }
        else {
            settingsWorker.settingsTab.activate();
        }
    };
    var showTestTab = function() {
        var isOpen = testPageWorker && testPageWorker.testTab ;
        if (!isOpen) {
            tabs.open({url: "./common/prices.html"});
        }
        else {
            testPageWorker.testPageTab.activate();
        }
    };
    var closeSettingsTab = function() {
        if (settingsWorker && settingsWorker.settingsTab) {
            settingsWorker.settingsTab.close();
        }
    };
     */
    return {
        watchForPages: watchForPages,
        toggleConversion: toggleConversion
        //showSettingsTab: showSettingsTab,
        //showTestTab: showTestTab,
        //closeSettingsTab: closeSettingsTab
    }
};

if (typeof exports === "object") {
    exports.SfContentInterface = SfContentInterface;
}
