/*
 * © 2014-2015 Per Johansson
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */
const SfStorageServiceProvider = function() {
    "use strict";
    var storage = {};
    var init = function (aDefaultEnabled, anExcludedDomains) {
        chrome.storage.local.get(null, function(aStorage) {
            storage = aStorage;
            if (!storage.excludedDomains) {
                storage.excludedDomains = anExcludedDomains;
                // console.log("storage.excludedDomains " + storage.excludedDomains);
            }
            // console.log("storage.dccPrefs " + storage.dccPrefs);
            if (!storage.dccPrefs) {
                storage.dccPrefs = {
                    // convertToCurrency: "EUR",
                    // convertToCountry: "PL",
                    customSymbols: {},
                    enableOnStart: true,
                    quoteAdjustmentPercent: 0,
                    roundAmounts: false,
                    showOriginalPrices: true,
                    beforeCurrencySymbol: true,
                    currencySpacing: " ",
                    monetarySeparatorSymbol: ",",
                    monetaryGroupingSeparatorSymbol: ".",
                    tempConvertUnits: false,
                    enabledCurrencies: aDefaultEnabled
                };
                // console.log("done storage.dccPrefs " + storage.dccPrefs);
            }
            else {
                //if (storage.dccPrefs.convertToCurrency == null) {
                //    storage.dccPrefs.convertToCurrency = "EUR";
                //}
                //if (storage.dccPrefs.convertToCountry == null) {
                //    storage.dccPrefs.convertToCountry = "CZ";
                //}
                if (!storage.dccPrefs.customSymbols) {
                    storage.dccPrefs.customSymbols = {};
                }
                if (!storage.dccPrefs.monetarySeparatorSymbol) {
                    storage.dccPrefs.monetarySeparatorSymbol = ",";
                }
                if (storage.dccPrefs.enableOnStart === null || storage.dccPrefs.enableOnStart == null) {
                    storage.dccPrefs.enableOnStart = true;
                }
                if (!storage.dccPrefs.quoteAdjustmentPercent) {
                    storage.dccPrefs.quoteAdjustmentPercent = 0;
                }
                if (storage.dccPrefs.roundAmounts === null || storage.dccPrefs.roundAmounts == null) {
                    storage.dccPrefs.roundAmounts = false;
                }
                if ("string" !== typeof storage.dccPrefs.currencySpacing) {
                    storage.dccPrefs.currencySpacing = " ";
                }
                if (storage.dccPrefs.showOriginalPrices === null || storage.dccPrefs.showOriginalPrices == null) {
                    storage.dccPrefs.showOriginalPrices = true;
                }
                if (storage.dccPrefs.beforeCurrencySymbol === null || storage.dccPrefs.beforeCurrencySymbol == null) {
                    storage.dccPrefs.beforeCurrencySymbol = true;
                }
                if (storage.dccPrefs.tempConvertUnits === null || storage.dccPrefs.tempConvertUnits == null) {
                    storage.dccPrefs.tempConvertUnits = false;
                }
                if (!storage.dccPrefs.monetaryGroupingSeparatorSymbol) {
                    storage.dccPrefs.monetaryGroupingSeparatorSymbol = ".";
                }
                if (!storage.dccPrefs.enabledCurrencies) {
                    storage.dccPrefs.enabledCurrencies = aDefaultEnabled;
                }
                else {
                    Object.keys(aDefaultEnabled).forEach(
                        function (key, index) {
                            if (!storage.dccPrefs.enabledCurrencies[key]) {
                                storage.dccPrefs.enabledCurrencies[key] = aDefaultEnabled[key];
                            }
                        }
                    )
                }
            }
            chrome.storage.local.set(storage);
            eventAggregator.publish("storageInitDone");
        });
    };
    var resetSettings = function(aDefaultEnabled)  {
        storage.dccPrefs = {
            // convertToCurrency: "EUR",
            // convertToCountry: "PL",
            customSymbols: {},
            enableOnStart: true,
            quoteAdjustmentPercent: 0,
            roundAmounts: false,
            showOriginalPrices: true,
            beforeCurrencySymbol: true,
            currencySpacing: " ",
            monetarySeparatorSymbol: ",",
            monetaryGroupingSeparatorSymbol: ".",
            tempConvertUnits: false,
            enabledCurrencies: aDefaultEnabled
        };
        chrome.storage.local.set(storage);
        eventAggregator.publish("storageReInitDone");
    };
    return {
        init: init,
        get convertToCurrency () {
            if (storage.dccPrefs) {
                return storage.dccPrefs.convertToCurrency;
            }
            else  {
                return "EUR";
            }
        },
        set convertToCurrency (aCurrency) {
            storage.dccPrefs.convertToCurrency = aCurrency;
                chrome.storage.local.set(storage);
        },
        get convertToCountry () {
            // console.log("convertToCountry storage.dccPrefs " + storage.dccPrefs);
            return storage.dccPrefs.convertToCountry;
        },
        set convertToCountry (aCountry) {
            storage.dccPrefs.convertToCountry = aCountry;
                chrome.storage.local.set(storage);
        },
        get customSymbols () {
            return storage.dccPrefs.customSymbols;
        },
        set customSymbols (aCustomSymbols) {
            storage.dccPrefs.customSymbols = aCustomSymbols;
                chrome.storage.local.set(storage);
        },
        get monetarySeparatorSymbol () {
            return storage.dccPrefs.monetarySeparatorSymbol;
        },
        set monetarySeparatorSymbol (aMonetarySeparatorSymbol) {
            storage.dccPrefs.monetarySeparatorSymbol = aMonetarySeparatorSymbol;
                chrome.storage.local.set(storage);
        },
        get enableOnStart () {
            if (storage.dccPrefs) {
                return storage.dccPrefs.enableOnStart;
            }
            return true;
        },
        set enableOnStart (anEnableOnStart) {
            storage.dccPrefs.enableOnStart = anEnableOnStart;
                chrome.storage.local.set(storage);
        },
        get excludedDomains () {
            return storage.excludedDomains;
        },
        set excludedDomains (anExcludedDomains) {
            storage.excludedDomains = anExcludedDomains;
                chrome.storage.local.set(storage);
        },
        get enabledCurrencies () {
            return storage.dccPrefs.enabledCurrencies;
        },
        set enabledCurrencies (anEnabledCurrencies) {
            storage.dccPrefs.enabledCurrencies = anEnabledCurrencies;
                chrome.storage.local.set(storage);
        },
        get quoteAdjustmentPercent () {
            return storage.dccPrefs.quoteAdjustmentPercent;
        },
        set quoteAdjustmentPercent (aQuoteAdjustmentPercent) {
            storage.dccPrefs.quoteAdjustmentPercent = aQuoteAdjustmentPercent;
                chrome.storage.local.set(storage);
        },
        get roundPrices () {
            return storage.dccPrefs.roundAmounts;
        },
        set roundPrices (aRoundPrices) {
            storage.dccPrefs.roundAmounts = aRoundPrices;
                chrome.storage.local.set(storage);
        },
        get currencySpacing () {
            return storage.dccPrefs.currencySpacing;
        },
        set currencySpacing (aCurrencySpacing) {
            storage.dccPrefs.currencySpacing = aCurrencySpacing;
                chrome.storage.local.set(storage);
        },
        get showOriginalPrices () {
            return storage.dccPrefs.showOriginalPrices;
        },
        set showOriginalPrices (aShowOriginalPrices) {
            storage.dccPrefs.showOriginalPrices = aShowOriginalPrices;
                chrome.storage.local.set(storage);
        },
        get beforeCurrencySymbol () {
            return storage.dccPrefs.beforeCurrencySymbol;
        },
        set beforeCurrencySymbol (aBeforeCurrencySymbol) {
            storage.dccPrefs.beforeCurrencySymbol = aBeforeCurrencySymbol;
                chrome.storage.local.set(storage);
        },
        get monetaryGroupingSeparatorSymbol () {
            return storage.dccPrefs.monetaryGroupingSeparatorSymbol;
        },
        set monetaryGroupingSeparatorSymbol (aMonetaryGroupingSeparatorSymbol) {
            storage.dccPrefs.monetaryGroupingSeparatorSymbol = aMonetaryGroupingSeparatorSymbol;
                chrome.storage.local.set(storage);
        },
        get tempConvertUnits () {
            return storage.dccPrefs.tempConvertUnits;
        },
        set tempConvertUnits (aTempConvertUnits) {
            storage.dccPrefs.tempConvertUnits = aTempConvertUnits;
                chrome.storage.local.set(storage);
        },
        resetSettings: resetSettings
    };
};

