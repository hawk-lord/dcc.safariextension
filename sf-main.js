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
    var defaultEnabledCurrencies = {"SEK":true, "CHF":true, "DKK":true, "EUR":true, "GBP":true, "ISK":true, "JPY":true, "NOK":true, "RUB":true, "USD":true};
    var localisation = new Localisation();
    var _ = localisation._;
    var informationHolder;
    var sfGeoService;
    var geoService;
    var sfYahooQuotesService;
    var yahooQuotesService;
    var onStorageServiceInitDone = function(informationHolder) {
        sfGeoService = new SfFreegeoipServiceProvider();
        geoService = new FreegeoipServiceProvider();
        sfYahooQuotesService = new SfYahooQuotesServiceProvider();
        yahooQuotesService = new YahooQuotesServiceProvider(eventAggregator);
        //var sfStorageServiceProvider = new SfStorageServiceProvider();
        //var informationHolder = new InformationHolder(aStorageServiceProvider, currencyData, currencySymbols, iso4217Currencies, regionFormats, _);
        var contentInterface = new SfContentInterface(informationHolder);
        var chromeInterface = new SfChromeInterface(informationHolder.conversionEnabled);
        eventAggregator.subscribe("countryReceived", function(countryCode) {
            // console.log("subscribe countryReceived");
            // console.log("countryCode " + countryCode);
            informationHolder.convertToCountry = countryCode;
            yahooQuotesService.loadQuotes(gcYahooQuotesService, informationHolder.getFromCurrencies(), informationHolder.convertToCurrency);
        });
        eventAggregator.subscribe("quotesFromTo", function(eventArgs) {
            // console.log("subscribe quotesFromTo");
            yahooQuotesService.quotesHandlerFromTo(eventArgs);
        });
        eventAggregator.subscribe("quotesToFrom", function(eventArgs) {
            // console.log("subscribe quotesToFrom");
            yahooQuotesService.quotesHandlerToFrom(eventArgs);
        });
        eventAggregator.subscribe("quoteReceived", function(eventArgs) {
            // console.log("subscribe quoteReceived " + eventArgs.quote);
            informationHolder.setConversionQuote(eventArgs.convertFromCurrency, eventArgs.quote);
            if (informationHolder.isAllCurrenciesRead()) {
                // console.log("isAllCurrenciesRead");
                contentInterface.watchForPages();
                //chromeInterface.setConversionButtonState(informationHolder.conversionEnabled);
                //chromeInterface.setToolsButtonText(informationHolder.getQuoteString());
            }
        });
        eventAggregator.subscribe("toggleConversion", function(eventArgs) {
            // console.log("subscribe toggleConversion");
            contentInterface.toggleConversion(eventArgs);
        });
        eventAggregator.subscribe("showSettingsTab", function() {
            // console.log("subscribe showSettingsTab");
            contentInterface.showSettingsTab();
        });
        eventAggregator.subscribe("showTestTab", function() {
            // console.log("subscribe showTestTab");
            contentInterface.showTestTab();
        });
        eventAggregator.subscribe("saveSettings", function(eventArgs) {
            // console.log("subscribe saveSettings");
            var toCurrencyChanged = informationHolder.convertToCurrency != eventArgs.contentScriptParams.convertToCurrency;
            informationHolder.resetReadCurrencies();
            new ParseContentScriptParams(eventArgs.contentScriptParams, informationHolder);
            //contentInterface.closeSettingsTab();
            if (toCurrencyChanged) {
                // controller.loadQuotes();
                yahooQuotesService.loadQuotes(gcYahooQuotesService, informationHolder.getFromCurrencies(),
                    informationHolder.convertToCurrency);
            }
        });
        eventAggregator.subscribe("resetSettings", function() {
            informationHolder.resetSettings();
            informationHolder.resetReadCurrencies();
        });
        /**
         * Communicate with the Settings tab
         * @param message
         * @param sender
         * @param sendResponse
         */
        var onMessageFromSettings = function(message, sender, sendResponse) {
            if (message.command === "show") {
                sendResponse(new ContentScriptParams(null, informationHolder));
            }
            else if (message.command === "save") {
                eventAggregator.publish("saveSettings", {
                    contentScriptParams: message.contentScriptParams
                })
            }
            else if (message.command === "reset") {
                eventAggregator.publish("resetSettings");
            }
        };
        chrome.runtime.onMessage.addListener(onMessageFromSettings);
        if (!informationHolder.convertToCountry) {
            geoService.loadUserCountry(gcGeoService);
        }
        else {
            yahooQuotesService.loadQuotes(gcYahooQuotesService, informationHolder.getFromCurrencies(), informationHolder.convertToCurrency);
        }
    };
    var onStorageServiceReInitDone = function(informationHolder) {
        geoService.loadUserCountry(gcGeoService);
    };
    var onJsonsDone = function() {
        console.log("onJsonsDone");
        eventAggregator.subscribe("storageInitDone", function() {
            informationHolder = new InformationHolder(defaultEnabledCurrencies, defaultExcludedDomains, sfStorageServiceProvider, currencyData, currencySymbols, iso4217Currencies, regionFormats, _);
            onStorageServiceInitDone(informationHolder);
        });
        eventAggregator.subscribe("storageReInitDone", function() {
            onStorageServiceReInitDone(informationHolder);
        });
        var sfStorageServiceProvider = new SfStorageServiceProvider();
        sfStorageServiceProvider.init(defaultEnabledCurrencies, defaultExcludedDomains);
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
        console.log("onRegionFormats " + result);
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
        console.log("regionFormatsRequest.readyState " + regionFormatsRequest.readyState);
        console.log("regionFormatsRequest.status " + regionFormatsRequest.status);
        if (regionFormatsRequest.readyState === 4 && regionFormatsRequest.status === 0) {
            onRegionFormats(regionFormatsRequest.responseText);
        }
    };
    regionFormatsRequest.send(null);
    console.log("Done");
/*
    var convertToCountry = "SE";
    var convertToCountry = null;
    if (convertToCountry === null || convertToCountry == null) {
        geoService.loadUserCountry(gcGeoService, convertToCountry);
        eventAggregator.subscribe("countryReceived", function(countryCode) {
            console.log("countryCode " + countryCode);
        });
    }
    quotesService.loadQuotes();
    */
})();
