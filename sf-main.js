/*
 * © 2014-2015 Per Johansson
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 *
 */

const DirectCurrencyConverter = (function() {
    "use strict";
    var currencyData;
    var currencySymbols;
    var iso4217Currencies;
    var regionFormats;
    var defaultExcludedDomains = ["images.google.com", "docs.google.com", "drive.google.com", "twitter.com"];
    var localisation = new Localisation();
    var _ = localisation._;
    var informationHolder;
    var sfGeoServiceFreegeoip;
    var geoServiceFreegeoip;
    var sfGeoServiceNekudo;
    var geoServiceNekudo;
    var sfYahooQuotesService;
    var yahooQuotesService;
    var onStorageServiceInitDone = function(informationHolder) {
        sfGeoServiceFreegeoip = new SfFreegeoipServiceProvider();
        geoServiceFreegeoip = new FreegeoipServiceProvider();
        sfGeoServiceNekudo = new SfNekudoServiceProvider();
        geoServiceNekudo = new NekudoServiceProvider();
        sfYahooQuotesService = new SfYahooQuotesServiceProvider();
        yahooQuotesService = new YahooQuotesServiceProvider(eventAggregator);
        var contentInterface = new SfContentInterface(informationHolder);
        var chromeInterface = new SfChromeInterface(informationHolder.conversionEnabled);
        eventAggregator.subscribe("countryReceivedFreegeoip", function(countryCode) {
            if (countryCode !== "") {
                informationHolder.convertToCountry = countryCode;
                yahooQuotesService.loadQuotes(sfYahooQuotesService, informationHolder.getConvertFroms(), informationHolder.convertToCurrency);
            }
            else {
                geoServiceNekudo.loadUserCountry(sfGeoServiceNekudo);
            }
        });
        eventAggregator.subscribe("countryReceivedNekudo", function(countryCode) {
            if (countryCode !== "") {
                informationHolder.convertToCountry = countryCode;
            }
            else {
                informationHolder.convertToCountry = "CH";
            }
            yahooQuotesService.loadQuotes(sfYahooQuotesService, informationHolder.getConvertFroms(), informationHolder.convertToCurrency);
        });
        eventAggregator.subscribe("quotesFromTo", function(eventArgs) {
            yahooQuotesService.quotesHandlerFromTo(eventArgs);
        });
        eventAggregator.subscribe("quotesToFrom", function(eventArgs) {
            yahooQuotesService.quotesHandlerToFrom(eventArgs);
        });
        eventAggregator.subscribe("quoteReceived", function(eventArgs) {
            informationHolder.setConversionQuote(eventArgs.convertFromCurrencyName, eventArgs.quote);
            if (informationHolder.isAllCurrenciesRead()) {
                contentInterface.watchForPages();
                contentInterface.toggleConversion(informationHolder.conversionEnabled);
                chromeInterface.setConversionButtonState(informationHolder.conversionEnabled);
            }
        });
        eventAggregator.subscribe("toggleConversion", function(eventArgs) {
            contentInterface.toggleConversion(eventArgs);
            chromeInterface.setConversionButtonState(eventArgs);
        });
        eventAggregator.subscribe("showSettingsTab", function() {
            contentInterface.showSettingsTab();
        });
        eventAggregator.subscribe("showTestTab", function() {
            contentInterface.showTestTab();
        });
        eventAggregator.subscribe("saveSettings", function(eventArgs) {
            var toCurrencyChanged = informationHolder.convertToCurrency != eventArgs.contentScriptParams.convertToCurrency;
            informationHolder.resetReadCurrencies();
            new ParseContentScriptParams(eventArgs.contentScriptParams, informationHolder);
            if (toCurrencyChanged) {
                yahooQuotesService.loadQuotes(sfYahooQuotesService, informationHolder.getConvertFroms(),
                    informationHolder.convertToCurrency);
            }
        });
        eventAggregator.subscribe("resetSettings", function() {
            informationHolder.resetSettings(iso4217Currencies);
            informationHolder.resetReadCurrencies();
            geoServiceFreegeoip.loadUserCountry(sfGeoServiceFreegeoip);
        });
        /**
         * Communicate with the Settings tab
         * @param message
         * @param sender
         * @param sendResponse
         */
        var onMessageFromSettings = function(event) {
            if (event.name === "show") {
                safari.application.activeBrowserWindow.activeTab.page.dispatchMessage(
                    "updateSettingsTab", new ContentScriptParams(null, informationHolder));
            }
            else if (event.name === "save") {
                eventAggregator.publish("saveSettings", {
                    contentScriptParams: event.message
                })
            }
            else if (event.name === "reset") {
                eventAggregator.publish("resetSettings");
            }
            // From Prices tab
            else if (event.name === "showPrices") {
                safari.application.activeBrowserWindow.activeTab.page.dispatchMessage(
                    "updateSettings", new ContentScriptParams(null, informationHolder));
                eventAggregator.publish("toggleConversion", informationHolder.conversionEnabled);
            }
        };
        safari.application.addEventListener("message", onMessageFromSettings, false);

        if (!informationHolder.convertToCountry) {
            geoServiceFreegeoip.loadUserCountry(sfGeoServiceFreegeoip);
        }
        else {
            yahooQuotesService.loadQuotes(sfYahooQuotesService, informationHolder.getConvertFroms(), informationHolder.convertToCurrency);
        }
    };
    var onStorageServiceReInitDone = function(informationHolder) {
        geoServiceFreegeoip.loadUserCountry(sfGeoServiceFreegeoip);
    };
    var onJsonsDone = function() {
        eventAggregator.subscribe("storageInitDone", function() {
            informationHolder = new InformationHolder(sfStorageServiceProvider, currencyData, currencySymbols, iso4217Currencies, regionFormats, _);
            onStorageServiceInitDone(informationHolder);
        });
        eventAggregator.subscribe("storageReInitDone", function() {
            onStorageServiceReInitDone(informationHolder);
        });
        var sfStorageServiceProvider = new SfStorageServiceProvider();
        sfStorageServiceProvider.init(iso4217Currencies, defaultExcludedDomains);
    };
    var onCurrencyData = function(result) {
        var currencyDataJson = result;
        currencyData = JSON.parse(currencyDataJson);
        if (currencyData && currencySymbols && iso4217Currencies && regionFormats) {
            onJsonsDone();
        }
    };
    var currencyDataRequest = new XMLHttpRequest();
    currencyDataRequest.overrideMimeType("application/json");
    currencyDataRequest.open("GET", "dcc-common-lib/currencyData.json", true);
    currencyDataRequest.onreadystatechange = function () {
        if (currencyDataRequest.readyState === 4 && currencyDataRequest.status === 0) {
            onCurrencyData(currencyDataRequest.responseText);
        }
    };
    currencyDataRequest.send(null);
    var onCurrencySymbols = function(result) {
        var currencySymbolsJson = result;
        currencySymbols = JSON.parse(currencySymbolsJson);
        if (currencyData && currencySymbols && iso4217Currencies && regionFormats) {
            onJsonsDone();
        }
    };
    var currencySymbolsRequest = new XMLHttpRequest();
    currencySymbolsRequest.overrideMimeType("application/json");
    currencySymbolsRequest.open("GET", "dcc-common-lib/currencySymbols.json", true);
    currencySymbolsRequest.onreadystatechange = function () {
        if (currencySymbolsRequest.readyState === 4 && currencySymbolsRequest.status === 0) {
            onCurrencySymbols(currencySymbolsRequest.responseText);
        }
    };
    currencySymbolsRequest.send(null);
    var oniso4217Currencies = function(result) {
        var iso4217CurrenciesJson = result;
        iso4217Currencies = JSON.parse(iso4217CurrenciesJson);
        if (currencyData && currencySymbols && iso4217Currencies && regionFormats) {
            onJsonsDone();
        }
    };
    var iso4217CurrenciesRequest = new XMLHttpRequest();
    iso4217CurrenciesRequest.overrideMimeType("application/json");
    iso4217CurrenciesRequest.open("GET", "dcc-common-lib/iso4217Currencies.json", true);
    iso4217CurrenciesRequest.onreadystatechange = function () {
        if (iso4217CurrenciesRequest.readyState === 4 && iso4217CurrenciesRequest.status === 0) {
            oniso4217Currencies(iso4217CurrenciesRequest.responseText);
        }
    };
    iso4217CurrenciesRequest.send(null);
    var onRegionFormats = function(result) {
        var regionFormatsJson = result;
        regionFormats = JSON.parse(regionFormatsJson);
        if (currencyData && currencySymbols && regionFormats && regionFormats) {
            onJsonsDone();
        }
    };
    var regionFormatsRequest = new XMLHttpRequest();
    regionFormatsRequest.overrideMimeType("application/json");
    regionFormatsRequest.open("GET", "dcc-common-lib/regionFormats.json", true);
    regionFormatsRequest.onreadystatechange = function () {
        if (regionFormatsRequest.readyState === 4 && regionFormatsRequest.status === 0) {
            onRegionFormats(regionFormatsRequest.responseText);
        }
    };
    regionFormatsRequest.send(null);
})();
