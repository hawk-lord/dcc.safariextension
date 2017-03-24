/*
 * © Per Johansson
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 *
 */

"use strict";

if (!this.DirectCurrencyConverter) {

    const DirectCurrencyConverter = (function() {
        let currencyData;
        let currencySymbols;
        let iso4217Currencies;
        let regionFormats;
        const defaultExcludedDomains = ["images.google.com", "docs.google.com", "drive.google.com", "twitter.com"];
        const localisation = new Localisation();
        const _ = localisation._;
        let informationHolder;
        let sfGeoServiceFreegeoip;
        let geoServiceFreegeoip;
        let sfGeoServiceNekudo;
        let geoServiceNekudo;
        let sfYahooQuotesService;
        let yahooQuotesService;
        const onStorageServiceInitDone = (informationHolder) => {
            sfGeoServiceFreegeoip = new SfFreegeoipServiceProvider();
            geoServiceFreegeoip = new FreegeoipServiceProvider();
            sfGeoServiceNekudo = new SfNekudoServiceProvider();
            geoServiceNekudo = new NekudoServiceProvider();
            sfYahooQuotesService = new SfYahooQuotesServiceProvider();
            yahooQuotesService = new YahooQuotesServiceProvider(eventAggregator);
            const contentInterface = new SfContentInterface(informationHolder);
            const chromeInterface = new SfChromeInterface(informationHolder.conversionEnabled);
            eventAggregator.subscribe("countryReceivedFreegeoip", (countryCode) => {
                if (countryCode !== "") {
                    informationHolder.convertToCountry = countryCode;
                    yahooQuotesService.loadQuotes(sfYahooQuotesService, informationHolder.getConvertFroms(), informationHolder.convertToCurrency);
                }
                else {
                    geoServiceNekudo.loadUserCountry(sfGeoServiceNekudo);
                }
            });
            eventAggregator.subscribe("countryReceivedNekudo", (countryCode) => {
                if (countryCode !== "") {
                    informationHolder.convertToCountry = countryCode;
                }
                else {
                    informationHolder.convertToCountry = "CH";
                }
                yahooQuotesService.loadQuotes(sfYahooQuotesService, informationHolder.getConvertFroms(), informationHolder.convertToCurrency);
            });
            eventAggregator.subscribe("quotesFromTo", (eventArgs) => {
                yahooQuotesService.quotesHandlerFromTo(eventArgs);
            });
            eventAggregator.subscribe("quotesToFrom", (eventArgs) => {
                yahooQuotesService.quotesHandlerToFrom(eventArgs);
            });
            eventAggregator.subscribe("quoteReceived", (eventArgs) => {
                informationHolder.setConversionQuote(eventArgs.convertFromCurrencyName, eventArgs.quote);
                if (informationHolder.isAllCurrenciesRead()) {
                    contentInterface.watchForPages();
                    contentInterface.toggleConversion(informationHolder.conversionEnabled);
                    chromeInterface.setConversionButtonState(informationHolder.conversionEnabled);
                }
            });
            eventAggregator.subscribe("toggleConversion", (eventArgs) => {
                contentInterface.toggleConversion(eventArgs);
                chromeInterface.setConversionButtonState(eventArgs);
            });
            eventAggregator.subscribe("showSettingsTab", () => {
                contentInterface.showSettingsTab();
            });
            eventAggregator.subscribe("showTestTab", () => {
                contentInterface.showTestTab();
            });
            eventAggregator.subscribe("showQuotesTab", () => {
                contentInterface.showQuotesTab();
            });
            eventAggregator.subscribe("saveSettings", (eventArgs) => {
                const toCurrencyChanged = informationHolder.convertToCurrency != eventArgs.contentScriptParams.convertToCurrency;
                informationHolder.resetReadCurrencies();
                new ParseContentScriptParams(eventArgs.contentScriptParams, informationHolder);
                if (toCurrencyChanged) {
                    yahooQuotesService.loadQuotes(sfYahooQuotesService, informationHolder.getConvertFroms(),
                        informationHolder.convertToCurrency);
                }
            });
            eventAggregator.subscribe("resetQuotes", (eventArgs) => {
                informationHolder.resetReadCurrencies();
                yahooQuotesService.loadQuotes(sfYahooQuotesService, informationHolder.getConvertFroms(),
                    informationHolder.convertToCurrency);
            });
            eventAggregator.subscribe("resetSettings", () => {
                informationHolder.resetSettings(iso4217Currencies);
                informationHolder.resetReadCurrencies();
            });
            /**
             * Communicate with the Settings tab
             * @param message
             * @param sender
             * @param sendResponse
             */
            const onMessageFromSettings = (event) => {
                if (event.name === "showSettings") {
                    safari.application.activeBrowserWindow.activeTab.page.dispatchMessage(
                        "updateSettingsTab", new ContentScriptParams(null, informationHolder));
                }
                else if (event.name === "save") {
                    eventAggregator.publish("saveSettings", {
                        contentScriptParams: event.message
                    })
                }
                else if (event.name === "resetQuotes") {
                    eventAggregator.publish("resetQuotes");
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
                else if (event.name === "showQuotes") {
                    safari.application.activeBrowserWindow.activeTab.page.dispatchMessage(
                        "updateQuotes", new ContentScriptParams(null, informationHolder));
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
        const onStorageServiceReInitDone = (informationHolder) => {
            geoServiceFreegeoip.loadUserCountry(sfGeoServiceFreegeoip);
        };
        const onJsonsDone = () => {
            eventAggregator.subscribe("storageInitDone", () => {
                informationHolder = new InformationHolder(sfStorageServiceProvider, currencyData, currencySymbols, iso4217Currencies, regionFormats, _);
                onStorageServiceInitDone(informationHolder);
            });
            eventAggregator.subscribe("storageReInitDone", () => {
                onStorageServiceReInitDone(informationHolder);
            });
            const sfStorageServiceProvider = new SfStorageServiceProvider();
            sfStorageServiceProvider.init(iso4217Currencies, defaultExcludedDomains);
        };
        const onCurrencyData = (result) => {
            const currencyDataJson = result;
            currencyData = JSON.parse(currencyDataJson);
            if (currencyData && currencySymbols && iso4217Currencies && regionFormats) {
                onJsonsDone();
            }
        };
        const currencyDataRequest = new XMLHttpRequest();
        currencyDataRequest.overrideMimeType("application/json");
        currencyDataRequest.open("GET", "dcc-common-lib/currencyData.json", true);
        currencyDataRequest.onreadystatechange = () => {
            if (currencyDataRequest.readyState === 4 && currencyDataRequest.status === 0) {
                onCurrencyData(currencyDataRequest.responseText);
            }
        };
        currencyDataRequest.send(null);
        const onCurrencySymbols = (result) => {
            const currencySymbolsJson = result;
            currencySymbols = JSON.parse(currencySymbolsJson);
            if (currencyData && currencySymbols && iso4217Currencies && regionFormats) {
                onJsonsDone();
            }
        };
        const currencySymbolsRequest = new XMLHttpRequest();
        currencySymbolsRequest.overrideMimeType("application/json");
        currencySymbolsRequest.open("GET", "dcc-common-lib/currencySymbols.json", true);
        currencySymbolsRequest.onreadystatechange = () => {
            if (currencySymbolsRequest.readyState === 4 && currencySymbolsRequest.status === 0) {
                onCurrencySymbols(currencySymbolsRequest.responseText);
            }
        };
        currencySymbolsRequest.send(null);
        const oniso4217Currencies = (result) => {
            const iso4217CurrenciesJson = result;
            iso4217Currencies = JSON.parse(iso4217CurrenciesJson);
            if (currencyData && currencySymbols && iso4217Currencies && regionFormats) {
                onJsonsDone();
            }
        };
        const iso4217CurrenciesRequest = new XMLHttpRequest();
        iso4217CurrenciesRequest.overrideMimeType("application/json");
        iso4217CurrenciesRequest.open("GET", "dcc-common-lib/iso4217Currencies.json", true);
        iso4217CurrenciesRequest.onreadystatechange = () => {
            if (iso4217CurrenciesRequest.readyState === 4 && iso4217CurrenciesRequest.status === 0) {
                oniso4217Currencies(iso4217CurrenciesRequest.responseText);
            }
        };
        iso4217CurrenciesRequest.send(null);
        const onRegionFormats = (result) => {
            const regionFormatsJson = result;
            regionFormats = JSON.parse(regionFormatsJson);
            if (currencyData && currencySymbols && regionFormats && regionFormats) {
                onJsonsDone();
            }
        };
        const regionFormatsRequest = new XMLHttpRequest();
        regionFormatsRequest.overrideMimeType("application/json");
        regionFormatsRequest.open("GET", "dcc-common-lib/regionFormats.json", true);
        regionFormatsRequest.onreadystatechange = () => {
            if (regionFormatsRequest.readyState === 4 && regionFormatsRequest.status === 0) {
                onRegionFormats(regionFormatsRequest.responseText);
            }
        };
        regionFormatsRequest.send(null);
    })();

    this.DirectCurrencyConverter = DirectCurrencyConverter;
}
