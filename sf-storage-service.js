/*
 * © 2014-2015 Per Johansson
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */
const SfStorageServiceProvider = function() {
    "use strict";
    var init = function (aConvertFroms, anExcludedDomains) {
        if (!safari.extension.settings.excludedDomains) {
            safari.extension.settings.excludedDomains = anExcludedDomains;
        }
        if (!safari.extension.settings.customSymbols) {
            safari.extension.settings.customSymbols = {};
        }
        if (!safari.extension.settings.monetarySeparatorSymbol) {
            safari.extension.settings.monetarySeparatorSymbol = ",";
        }
        if (!safari.extension.settings.enableOnStart) {
            safari.extension.settings.enableOnStart = "on";
        }
        if (!safari.extension.settings.quoteAdjustmentPercent) {
            safari.extension.settings.quoteAdjustmentPercent = 0;
        }
        if (safari.extension.settings.roundAmounts == null) {
            safari.extension.settings.roundAmounts = false;
        }
        if (!safari.extension.settings.currencySpacing) {
            safari.extension.settings.currencySpacing = " ";
        }
        if (safari.extension.settings.showOriginalPrices == null) {
            safari.extension.settings.showOriginalPrices = true;
        }
        if (safari.extension.settings.beforeCurrencySymbol == null) {
            safari.extension.settings.beforeCurrencySymbol = true;
        }
        if (safari.extension.settings.tempConvertUnits == null) {
            safari.extension.settings.tempConvertUnits = false;
        }
        if (!safari.extension.settings.monetaryGroupingSeparatorSymbol) {
            safari.extension.settings.monetaryGroupingSeparatorSymbol = ".";
        }
        if (!safari.extension.settings.convertFroms) {
            safari.extension.settings.convertFroms = aConvertFroms;
        }
        else {
            for (var currency of aConvertFroms) {
                var convertFroms = safari.extension.settings.convertFroms;
                var found = false;
                for (var storedCurrency of convertFroms) {
                    if (currency.isoName === storedCurrency.isoName) {
                        found = true;
                        break;
                    }
                }
                if (!found){
                    convertFroms.push(currency);
                }
            }
            safari.extension.settings.convertFroms = convertFroms;
        }
        safari.extension.settings.enabledCurrencies = null;
        eventAggregator.publish("storageInitDone");
    };
    var resetSettings = function(aConvertFroms)  {
        delete safari.extension.settings.convertToCurrency;
        delete safari.extension.settings.convertToCountry;
        safari.extension.settings.customSymbols =  {};
        safari.extension.settings.enableOnStart =  "on";
        safari.extension.settings.quoteAdjustmentPercent =  0;
        safari.extension.settings.roundAmounts =  false;
        safari.extension.settings.showOriginalPrices =  true;
        safari.extension.settings.beforeCurrencySymbol =  true;
        safari.extension.settings.currencySpacing =  " ";
        safari.extension.settings.monetarySeparatorSymbol =  ";";
        safari.extension.settings.monetaryGroupingSeparatorSymbol =  ".";
        safari.extension.settings.tempConvertUnits =  false;
        safari.extension.settings.convertFroms =  aConvertFroms;
        eventAggregator.publish("storageReInitDone");
    };
    return {
        init: init,
        get convertToCurrency () {
            return safari.extension.settings.convertToCurrency;
        },
        set convertToCurrency (aCurrency) {
            safari.extension.settings.convertToCurrency = aCurrency;
        },
        get convertToCountry () {
            return safari.extension.settings.convertToCountry;
        },
        set convertToCountry (aCountry) {
            safari.extension.settings.convertToCountry = aCountry;
        },
        get customSymbols () {
            return safari.extension.settings.customSymbols;
        },
        set customSymbols (aCustomSymbols) {
            safari.extension.settings.customSymbols = aCustomSymbols;
        },
        get monetarySeparatorSymbol () {
            return safari.extension.settings.monetarySeparatorSymbol;
        },
        set monetarySeparatorSymbol (aMonetarySeparatorSymbol) {
            safari.extension.settings.monetarySeparatorSymbol = aMonetarySeparatorSymbol;
        },
        get enableOnStart () {
            if (safari.extension.settings.enableOnStart) {
                return safari.extension.settings.enableOnStart === "on" ? true : false;
            }
            return true;
        },
        set enableOnStart (anEnableOnStart) {
            safari.extension.settings.enableOnStart = anEnableOnStart ? "on" : "off";
        },
        get excludedDomains () {
            return safari.extension.settings.excludedDomains;
        },
        set excludedDomains (anExcludedDomains) {
            safari.extension.settings.excludedDomains = anExcludedDomains;
        },
        get convertFroms () {
            return safari.extension.settings.convertFroms;
        },
        set convertFroms (anEnabledCurrencies) {
            safari.extension.settings.convertFroms = anEnabledCurrencies;
        },
        get quoteAdjustmentPercent () {
            return safari.extension.settings.quoteAdjustmentPercent;
        },
        set quoteAdjustmentPercent (aQuoteAdjustmentPercent) {
            safari.extension.settings.quoteAdjustmentPercent = aQuoteAdjustmentPercent;
        },
        get roundPrices () {
            return safari.extension.settings.roundAmounts;
        },
        set roundPrices (aRoundPrices) {
            safari.extension.settings.roundAmounts = aRoundPrices;
        },
        get currencySpacing () {
            return safari.extension.settings.currencySpacing;
        },
        set currencySpacing (aCurrencySpacing) {
            safari.extension.settings.currencySpacing = aCurrencySpacing;
        },
        get showOriginalPrices () {
            return safari.extension.settings.showOriginalPrices;
        },
        set showOriginalPrices (aShowOriginalPrices) {
            safari.extension.settings.showOriginalPrices = aShowOriginalPrices;
        },
        get beforeCurrencySymbol () {
            return safari.extension.settings.beforeCurrencySymbol;
        },
        set beforeCurrencySymbol (aBeforeCurrencySymbol) {
            safari.extension.settings.beforeCurrencySymbol = aBeforeCurrencySymbol;
        },
        get monetaryGroupingSeparatorSymbol () {
            return safari.extension.settings.monetaryGroupingSeparatorSymbol;
        },
        set monetaryGroupingSeparatorSymbol (aMonetaryGroupingSeparatorSymbol) {
            safari.extension.settings.monetaryGroupingSeparatorSymbol = aMonetaryGroupingSeparatorSymbol;
        },
        get tempConvertUnits () {
            return safari.extension.settings.tempConvertUnits;
        },
        set tempConvertUnits (aTempConvertUnits) {
            safari.extension.settings.tempConvertUnits = aTempConvertUnits;
        },
        setEnabledCurrency(aCurrency, anEnabled) {
            var convertFroms = safari.extension.settings.convertFroms;
            var found = false;
            for (var storedCurrency of convertFroms) {
                if (aCurrency.isoName === storedCurrency.isoName) {
                    found = true;
                    aCurrency.enabled = anEnabled;
                    break;
                }
            }
            if (!found){
                convertFroms.push({isoName: currency, enabled: anEnabled});
            }
            safari.extension.settings.convertFroms = convertFroms;
        },
        resetSettings: resetSettings
    };
};

