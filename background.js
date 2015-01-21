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
const DirectCurrencyConverter = (function() {
    // Event function from SOLID Javascript
    // http://aspiringcraftsman.com/series/solid-javascript/
    const Event = function(name) {
        this._handlers = [];
        this.name = name;
    };
    Event.prototype.addHandler = function(handler) {
        this._handlers.push(handler);
    };
    Event.prototype.removeHandler = function(handler) {
        for (var i = 0; i < this._handlers.length; i++) {
            if (this._handlers[i] == handler) {
                this._handlers.splice(i, 1);
                break;
            }
        }
    };
    Event.prototype.fire = function(eventArgs) {
        this._handlers.forEach(function(h) {
            h(eventArgs);
        });
    };
    const eventAggregator = (function() {
        const events = [];
        const getEvent = function(eventName) {
            return grep(events, function(event) {
                return event.name === eventName;
            })[0];
        };
        return {
            publish: function(eventName, eventArgs) {
                var event = getEvent(eventName);
                if (!event) {
                    event = new Event(eventName);
                    events.push(event);
                }
                event.fire(eventArgs);
            },
            subscribe: function(eventName, handler) {
                var event = getEvent(eventName);
                if (!event) {
                    event = new Event(eventName);
                    events.push(event);
                }
                event.addHandler(handler);
            }
        };
    })();
    const CustomTabObject = function() {
        "use strict";
        this.enabled = false;
        this.hasConvertedElements = false;
        this.port = null;
    };
    // Stereotype Service provider
    // Named Function Expression
    const YahooQuotesServiceProvider = function() {
        var convertToCurrency;
        var quoteQueriesFromTo;
        var quoteQueriesToFrom;
        var quotesFromTo;
        var quotesToFrom;
        const makeQuoteQuery = function(aConvertFromCurrency) {
            if (convertToCurrency === "gAu") {
                quoteQueriesFromTo.push(aConvertFromCurrency + "XAU" + "=X");
                quoteQueriesToFrom.push("XAU" + aConvertFromCurrency + "=X");
            }
            else {
                quoteQueriesFromTo.push(aConvertFromCurrency + convertToCurrency + "=X");
                quoteQueriesToFrom.push(convertToCurrency + aConvertFromCurrency + "=X");
            }
        };
        const quotesHandlerFromTo = function() {
            try {
                if (this.readyState == this.DONE) {
                    if (this.status == "200") {
                        const response = JSON.parse(this.responseText);
                        quotesFromTo = response.query.results.row;
                        if (quotesFromTo.length > 0 && quotesToFrom.length > 0) {
                            makeOneResponse();
                        }
                    }
                }
            }
            catch(err) {
                console.log("err " + err);
            }
        };
        const quotesHandlerToFrom = function() {
            try {
                if (this.readyState == this.DONE) {
                    if (this.status == "200") {
                        const response = JSON.parse(this.responseText);
                        quotesToFrom = response.query.results.row;
                        if (quotesFromTo.length > 0 && quotesToFrom.length > 0) {
                            makeOneResponse();
                        }
                    }
                }
            }
            catch(err) {
                console.log("err " + err);
            }
        };
        const gramsPerOunce = 31.1034768;
        // Since Yahoo quote response only has four decimals, we sometimes get imprecise quotes
        // In such cases, we use the inverse quote and invert it.
        const makeOneResponse = function() {
            quotesFromTo.forEach(function(anElement, anIndex) {
                var convertFromCurrency = anElement.symbol.substr(0, 3);
                var quote = anElement.rate;
                if (quote < 0.01) {
                    convertFromCurrency = quotesToFrom[anIndex].symbol.substr(3, 3);
                    const reverseQuote = quotesToFrom[anIndex].rate;
                    quote = reverseQuote > 0 ? 1 / reverseQuote : 0;
                }
                if (convertToCurrency == "gAu") {
                    quote = quote * gramsPerOunce;
                }
                if (convertFromCurrency.length > 0) {
                    eventAggregator.publish("quoteReceived", {
                        convertFromCurrency: convertFromCurrency,
                        quote: quote
                    });
                }
            });
        };
        return {
            loadUserCountry: function() {
                const urlString = "http://freegeoip.net/json/";
                const request = new XMLHttpRequest();
                const onComplete = function() {
                    try {
                        if (this.readyState == this.DONE) {
                            if (this.status == "200") {
                                const response = JSON.parse(this.responseText);
                                informationHolder.setUserCountry(response.country_code);
                                controller.loadQuotes();
                            }
                            else {
                                informationHolder.setUserCountry("GB");
                                controller.loadQuotes();
                            }
                        }
                    }
                    catch(err) {
                        informationHolder.setUserCountry("CH");
                        controller.loadQuotes();
                    }
                };
                // If no country was stored, get it again
                if (informationHolder.convertToCountry === null || informationHolder.convertToCountry == null) {
                    const method = "GET";
                    request.open(method, urlString);
                    request.onreadystatechange = onComplete;
                    request.send();
                }
                else {
                    controller.loadQuotes();
                }
            },
            loadQuotes: function(aConvertFromCurrencies, aConvertToCurrency) {
                quoteQueriesFromTo = [];
                quoteQueriesToFrom = [];
                quotesFromTo = [];
                quotesToFrom = [];
                convertToCurrency = aConvertToCurrency;
                aConvertFromCurrencies.forEach(makeQuoteQuery);
                const innerUrlStringFromTo = "http://download.finance.yahoo.com/d/quotes?s=" + quoteQueriesFromTo.join(",") + "&f=snl1d1t1ab";
                const innerUrlStringToFrom = "http://download.finance.yahoo.com/d/quotes?s=" + quoteQueriesToFrom.join(",") + "&f=snl1d1t1ab";
                const yqlFromTo = "select symbol, rate from csv where url='" + innerUrlStringFromTo + "' and columns='symbol,Name,rate,Date,Time,Ask,Bid'";
                const yqlToFrom = "select symbol, rate from csv where url='" + innerUrlStringToFrom + "' and columns='symbol,Name,rate,Date,Time,Ask,Bid'";
                const urlStringFromTo = "http://query.yahooapis.com/v1/public/yql?q=" + encodeURIComponent(yqlFromTo) + "&format=json";
                const urlStringToFrom = "http://query.yahooapis.com/v1/public/yql?q=" + encodeURIComponent(yqlToFrom) + "&format=json";
                const method = "GET";
                const requestFromTo = new XMLHttpRequest();
                requestFromTo.open(method, urlStringFromTo);
                requestFromTo.onreadystatechange = quotesHandlerFromTo;
                requestFromTo.send();
                const requestToFrom = new XMLHttpRequest();
                requestToFrom.open(method, urlStringToFrom);
                requestToFrom.onreadystatechange = quotesHandlerToFrom;
                requestToFrom.send();
            }
        };
    };
    //Stereotype Service provider
    const StorageServiceProvider = function() {
        return {
            init: function(aDefaultEnabledCurrencies) {
                    if (safari.extension.settings.excludedDomains == null) {
                        safari.extension.settings.excludedDomains = ["images.google.com", "docs.google.com", "drive.google.com", "twitter.com"];
                    }
                        if (safari.extension.settings.customSymbols == null) {
                            safari.extension.settings.customSymbols = {};
                        }
                        if (safari.extension.settings.subUnitSeparator == null) {
                            safari.extension.settings.subUnitSeparator = ",";
                        }
                        if (safari.extension.settings.enableOnStart == null) {
                            safari.extension.settings.enableOnStart = "on";
                        }
                        if (safari.extension.settings.quoteAdjustmentPercent == null) {
                            safari.extension.settings.quoteAdjustmentPercent = 0;
                        }
                        if (safari.extension.settings.roundAmounts == null) {
                            safari.extension.settings.roundAmounts = false;
                        }
                        if (safari.extension.settings.separatePrice == null) {
                            safari.extension.settings.separatePrice = true;
                        }
                        if (safari.extension.settings.showOriginalPrices == null) {
                            safari.extension.settings.showOriginalPrices = true;
                        }
                        if (safari.extension.settings.unitAfter == null) {
                            safari.extension.settings.unitAfter = true;
                        }
                        if (safari.extension.settings.tempConvertUnits == null) {
                            safari.extension.settings.tempConvertUnits = false;
                        }
                        if (safari.extension.settings.thousandSep == null) {
                            safari.extension.settings.thousandSep = ".";
                        }
                        if (safari.extension.settings.enabledCurrencies == null) {
                            safari.extension.settings.enabledCurrencies = aDefaultEnabledCurrencies;
                        }
            },
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
            get decimalSep () {
                return safari.extension.settings.subUnitSeparator;
            },
            set decimalSep (aDecimalSep) {
                safari.extension.settings.subUnitSeparator = aDecimalSep;
            },
            get enableOnStart () {
                if (safari.extension.settings != null) {
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
            get enabledCurrencies () {
                return safari.extension.settings.enabledCurrencies;
            },
            set enabledCurrencies (anEnabledCurrencies) {
                safari.extension.settings.enabledCurrencies = anEnabledCurrencies;
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
            get separatePrice () {
                return safari.extension.settings.separatePrice;
            },
            set separatePrice (aSeparatePrice) {
                safari.extension.settings.separatePrice = aSeparatePrice;
            },
            get showOriginalPrices () {
                return safari.extension.settings.showOriginalPrices;
            },
            set showOriginalPrices (aShowOriginalPrices) {
                safari.extension.settings.showOriginalPrices = aShowOriginalPrices;
            },
            get unitAfter () {
                return safari.extension.settings.unitAfter;
            },
            set unitAfter (aUnitAfter) {
                safari.extension.settings.unitAfter = aUnitAfter;
            },
            get thousandSep () {
                return safari.extension.settings.thousandSep;
            },
            set thousandSep (aThousandSep) {
                safari.extension.settings.thousandSep = aThousandSep;
            },
            get tempConvertUnits () {
                return safari.extension.settings.tempConvertUnits;
            },
            set tempConvertUnits (aTempConvertUnits) {
                safari.extension.settings.tempConvertUnits = aTempConvertUnits;
            },
            resetSettings: function() {
                safari.extension.settings.clear();
                controller.loadStorage();
                controller.loadUserCountryAndQuotes();
            }
        };
    };
    // Stereotype Information holder
    const InformationHolder = function(aUrlProvider, aStorageService) {
        // TODO L10N
        // const _ = chrome.i18n;
        var fromCurrencies = ["AFN", "AED", "ALL", "AMD", "ANG", "AOA", "ARS", "AUD", "AWG", "AZN", "BAM", "BBD", "BDT", "BGN", "BHD", "BIF", "BMD", "BND", "BOB", "BOV", "BRL", "BSD", "BTN", "BWP", "BYR", "BZD", "CAD", "CDF", "CHE", "CHF", "CHW", "CLF", "CLP", "CNY", "COP", "COU", "CRC", "CUC", "CUP", "CVE", "CZK", "DJF", "DKK", "DOP", "DZD", "EGP", "ERN", "ETB", "EUR", "FJD", "FKP", "GBP", "GEL", "GHS", "GIP", "GMD", "GNF", "GTQ", "GYD", "HKD", "HNL", "HRK", "HTG", "HUF", "IDR", "ILS", "INR", "IQD", "IRR", "ISK", "JMD", "JOD", "JPY", "KES", "KGS", "KHR", "KMF", "KPW", "KRW", "KWD", "KYD", "KZT", "LAK", "LBP", "LKR", "LRD", "LSL", "LTL", "LYD", "MAD", "MDL", "MGA", "MKD", "MMK", "MNT", "MOP", "MRO", "MUR", "MVR", "MWK", "MXN", "MXV", "MYR", "MZN", "NAD", "NGN", "NIO", "NOK", "NPR", "NZD", "OMR", "PAB", "PEN", "PGK", "PHP", "PKR", "PLN", "PYG", "QAR", "RON", "RSD", "RUB", "RWF", "SAR", "SBD", "SCR", "SDG", "SEK", "SGD", "SHP", "SLL", "SOS", "SRD", "SSP", "STD", "SVC", "SYP", "SZL", "THB", "TJS", "TMT", "TND", "TOP", "TRY", "TTD", "TWD", "TZS", "UAH", "UGX", "USD", "USN", "UYI", "UYU", "UZS", "VEF", "VND", "VUV", "WST", "XAF", "XAG", "XAU", "XBA", "XBB", "XBC", "XBD", "XCD", "XDR", "XOF", "XPD", "XPF", "XPT", "XSU", "XTS", "XUA", "XXX", "YER", "ZAR", "ZMW", "ZWL"];
        // Conversion is made in the following priority order
        // Normal default
        var defaultEnabledCurrencies = {"SEK":true, "CHF":true, "DKK":true, "EUR":true, "GBP":true, "ISK":true, "JPY":true, "NOK":true, "RUB":true, "USD":true};
        // Test default
        // defaultEnabledCurrencies = {"AFN":true, "AED":true, "ALL":true, "AMD":true, "ANG":true, "AOA":true, "ARS":true, "AUD":true, "AWG":true, "AZN":true, "BAM":true, "BBD":true, "BDT":true, "BGN":true, "BHD":true, "BIF":true, "BMD":true, "BND":true, "BOB":true, "BOV":true, "BRL":true, "BSD":true, "BTN":true, "BWP":true, "BYR":true, "BZD":true, "CAD":true, "CDF":true, "CHE":true, "CHF":true, "CHW":true, "CLF":true, "CLP":true, "CNY":true, "COP":true, "COU":true, "CRC":true, "CUC":true, "CUP":true, "CVE":true, "CZK":true, "DJF":true, "DKK":true, "DOP":true, "DZD":true, "EGP":true, "ERN":true, "ETB":true, "EUR":true, "FJD":true, "FKP":true, "GBP":true, "GEL":true, "GHS":true, "GIP":true, "GMD":true, "GNF":true, "GTQ":true, "GYD":true, "HKD":true, "HNL":true, "HRK":true, "HTG":true, "HUF":true, "IDR":true, "ILS":true, "INR":true, "IQD":true, "IRR":true, "ISK":true, "JMD":true, "JOD":true, "JPY":true, "KES":true, "KGS":true, "KHR":true, "KMF":true, "KPW":true, "KRW":true, "KWD":true, "KYD":true, "KZT":true, "LAK":true, "LBP":true, "LKR":true, "LRD":true, "LSL":true, "LTL":true, "LYD":true, "MAD":true, "MDL":true, "MGA":true, "MKD":true, "MMK":true, "MNT":true, "MOP":true, "MRO":true, "MUR":true, "MVR":true, "MWK":true, "MXN":true, "MXV":true, "MYR":true, "MZN":true, "NAD":true, "NGN":true, "NIO":true, "NOK":true, "NPR":true, "NZD":true, "OMR":true, "PAB":true, "PEN":true, "PGK":true, "PHP":true, "PKR":true, "PLN":true, "PYG":true, "QAR":true, "RON":true, "RSD":true, "RUB":true, "RWF":true, "SAR":true, "SBD":true, "SCR":true, "SDG":true, "SEK":true, "SGD":true, "SHP":true, "SLL":true, "SOS":true, "SRD":true, "SSP":true, "STD":true, "SVC":true, "SYP":true, "SZL":true, "THB":true, "TJS":true, "TMT":true, "TND":true, "TOP":true, "TRY":true, "TTD":true, "TWD":true, "TZS":true, "UAH":true, "UGX":true, "USD":true, "USN":true, "UYI":true, "UYU":true, "UZS":true, "VEF":true, "VND":true, "VUV":true, "WST":true, "XAF":true, "XAG":true, "XAU":true, "XBA":true, "XBB":true, "XBC":true, "XBD":true, "XCD":true, "XDR":true, "XOF":true, "XPD":true, "XPF":true, "XPT":true, "XSU":true, "XTS":true, "XUA":true, "XXX":true, "YER":true, "ZAR":true, "ZMW":true, "ZWL":true};
        // defaultEnabledCurrencies = {"CHF":true, "DKK":true, "EUR":true, "GBP":true, "ISK":true, "JPY":true, "NOK":true, "RUB":true, "SEK":true, "USD":true, "AFN":true, "AED":true, "ALL":true, "AMD":true, "ANG":true, "AOA":true, "ARS":true, "AUD":true, "AWG":true, "AZN":true, "BAM":true, "BBD":true, "BDT":true, "BGN":true, "BHD":true, "BIF":true, "BMD":true, "BND":true, "BOB":true, "BOV":true, "BRL":true, "BSD":true, "BTN":true, "BWP":true, "BYR":true, "BZD":true, "CAD":true, "CDF":true, "CHE":true, "CHW":true, "CLF":true, "CLP":true, "CNY":true, "COP":true, "COU":true, "CRC":true, "CUC":true, "CUP":true, "CVE":true, "CZK":true, "DJF":true, "DOP":true, "DZD":true, "EGP":true, "ERN":true, "ETB":true, "FJD":true, "FKP":true, "GEL":true, "GHS":true, "GIP":true, "GMD":true, "GNF":true, "GTQ":true, "GYD":true, "HKD":true, "HNL":true, "HRK":true, "HTG":true, "HUF":true, "IDR":true, "ILS":true, "INR":true, "IQD":true, "IRR":true, "JMD":true, "JOD":true, "KES":true, "KGS":true, "KHR":true, "KMF":true, "KPW":true, "KRW":true, "KWD":true, "KYD":true, "KZT":true, "LAK":true, "LBP":true, "LKR":true, "LRD":true, "LSL":true, "LTL":true, "LYD":true, "MAD":true, "MDL":true, "MGA":true, "MKD":true, "MMK":true, "MNT":true, "MOP":true, "MRO":true, "MUR":true, "MVR":true, "MWK":true, "MXN":true, "MXV":true, "MYR":true, "MZN":true, "NAD":true, "NGN":true, "NIO":true, "NPR":true, "NZD":true, "OMR":true, "PAB":true, "PEN":true, "PGK":true, "PHP":true, "PKR":true, "PLN":true, "PYG":true, "QAR":true, "RON":true, "RSD":true, "RWF":true, "SAR":true, "SBD":true, "SCR":true, "SDG":true, "SGD":true, "SHP":true, "SLL":true, "SOS":true, "SRD":true, "SSP":true, "STD":true, "SVC":true, "SYP":true, "SZL":true, "THB":true, "TJS":true, "TMT":true, "TND":true, "TOP":true, "TRY":true, "TTD":true, "TWD":true, "TZS":true, "UAH":true, "UGX":true, "USN":true, "UYI":true, "UYU":true, "UZS":true, "VEF":true, "VND":true, "VUV":true, "WST":true, "XAF":true, "XAG":true, "XAU":true, "XBA":true, "XBB":true, "XBC":true, "XBD":true, "XCD":true, "XDR":true, "XOF":true, "XPD":true, "XPF":true, "XPT":true, "XSU":true, "XTS":true, "XUA":true, "XXX":true, "YER":true, "ZAR":true, "ZMW":true, "ZWL":true};
        // defaultEnabledCurrencies = {"SEK":true, "CHF":true, "DKK":true, "EUR":true, "GBP":true, "ISK":true, "JPY":true, "NOK":true, "RUB":true, "USD":true, "AFN":true, "AED":true, "ALL":true, "AMD":true, "ANG":true, "AOA":true, "ARS":true, "AUD":true, "AWG":true, "AZN":true, "BAM":true, "BBD":true, "BDT":true, "BGN":true, "BHD":true, "BIF":true, "BMD":true, "BND":true, "BOB":true, "BOV":true, "BRL":true, "BSD":true, "BTN":true, "BWP":true, "BYR":true, "BZD":true, "CAD":true, "CDF":true, "CHE":true, "CHW":true, "CLF":true, "CLP":true, "CNY":true, "COP":true, "COU":true, "CRC":true, "CUC":true, "CUP":true, "CVE":true, "CZK":true, "DJF":true, "DOP":true, "DZD":true, "EGP":true, "ERN":true, "ETB":true, "FJD":true, "FKP":true, "GEL":true, "GHS":true, "GIP":true, "GMD":true, "GNF":true, "GTQ":true, "GYD":true, "HKD":true, "HNL":true, "HRK":true, "HTG":true, "HUF":true, "IDR":true, "ILS":true, "INR":true, "IQD":true, "IRR":true, "JMD":true, "JOD":true, "KES":true, "KGS":true, "KHR":true, "KMF":true, "KPW":true, "KRW":true, "KWD":true, "KYD":true, "KZT":true, "LAK":true, "LBP":true, "LKR":true, "LRD":true, "LSL":true, "LTL":true, "LYD":true, "MAD":true, "MDL":true, "MGA":true, "MKD":true, "MMK":true, "MNT":true, "MOP":true, "MRO":true, "MUR":true, "MVR":true, "MWK":true, "MXN":true, "MXV":true, "MYR":true, "MZN":true, "NAD":true, "NGN":true, "NIO":true, "NPR":true, "NZD":true, "OMR":true, "PAB":true, "PEN":true, "PGK":true, "PHP":true, "PKR":true, "PLN":true, "PYG":true, "QAR":true, "RON":true, "RSD":true, "RWF":true, "SAR":true, "SBD":true, "SCR":true, "SDG":true, "SGD":true, "SHP":true, "SLL":true, "SOS":true, "SRD":true, "SSP":true, "STD":true, "SVC":true, "SYP":true, "SZL":true, "THB":true, "TJS":true, "TMT":true, "TND":true, "TOP":true, "TRY":true, "TTD":true, "TWD":true, "TZS":true, "UAH":true, "UGX":true, "USN":true, "UYI":true, "UYU":true, "UZS":true, "VEF":true, "VND":true, "VUV":true, "WST":true, "XAF":true, "XAG":true, "XAU":true, "XBA":true, "XBB":true, "XBC":true, "XBD":true, "XCD":true, "XDR":true, "XOF":true, "XPD":true, "XPF":true, "XPT":true, "XSU":true, "XTS":true, "XUA":true, "XXX":true, "YER":true, "ZAR":true, "ZMW":true, "ZWL":true};
        var currencyNames = {};
        fromCurrencies.forEach(function(aCurrency) {
            if (defaultEnabledCurrencies[aCurrency] == undefined) {
                defaultEnabledCurrencies[aCurrency] = false;
            }
            // TODO L10N
            // currencyNames[aCurrency] = _.getMessage(aCurrency);
            currencyNames[aCurrency] = aCurrency;
        });
        var numberOfFromCurrencies = fromCurrencies.length;
        // Used for check if all currencies have been read
        var numberOfReadCurrencies = 0;
        const conversionQuotes = {};
        const country_currency = {"AX":"EUR","ALL":"USD","AF":"AFN","AL":"ALL","DZ":"DZD","AS":"USD","AD":"ADP","AO":"AON","AI":"XCD","AG":"XCD","AR":"ARS","AM":"AMD","AW":"AWG","AU":"AUD","AT":"EUR","AZ":"AZN","BS":"BSD","BH":"BHD","BD":"BDT","BB":"BBD","BY":"BYR","BE":"EUR","BZ":"BZD","BJ":"XOF","BM":"BMD","BT":"BTN","BO":"BOB","BA":"BAM","BW":"BWP","BR":"BRL","BN":"BND","BG":"BGN","BF":"XOF","BI":"BIF","KH":"KHR","CM":"XAF","CA":"CAD","CV":"CVE","KY":"KYD","CF":"XAF","TD":"XAF","CL":"CLP","CN":"CNY","CX":"AUD","CO":"COP","KM":"KMF","CG":"XAF","CD":"CDF","CK":"NZD","CR":"CRC","HR":"HRK","CU":"CUP","CY":"CYP","CZ":"CZK","DK":"DKK","DJ":"DJF","DM":"XCD","DO":"DOP","EC":"USD","EG":"EGP","SV":"SVC","GQ":"XAF","ER":"USD","ET":"ETB","FO":"DKK","FJ":"FJD","FI":"EUR","FR":"EUR","GF":"FRF","PF":"XPF","TF":"USD","GA":"XAF","GM":"GMD","GE":"GEL","DE":"EUR","GH":"GHS","GI":"GIP","GR":"EUR","GL":"DKK","GD":"XCD","GP":"FRF","GU":"USD","GT":"GTQ","GG":"USD","GN":"GNF","GW":"XAF","GY":"GYD","HT":"HTG","HN":"HNL","HK":"HKD","HU":"HUF","IS":"ISK","IN":"INR","ID":"IDR","IR":"IRR","IQ":"IQD","IE":"EUR","IL":"ILS","IT":"EUR","CI":"USD","JM":"JMD","JP":"JPY","JO":"JOD","KZ":"KZT","KE":"KES","KI":"AUD","KP":"KPW","KR":"KRW","KW":"KWD","KG":"KGS","LA":"LAK","LB":"LBP","LS":"LSL","LR":"LRD","LY":"LYD","LI":"CHF","LT":"LTL","LU":"EUR","MK":"MKD","MG":"MGF","MW":"MWK","MY":"MYR","MV":"MVR","ML":"XOF","MT":"MTL","MH":"USD","MQ":"FRF","MR":"MRO","MU":"MUR","MX":"MXN","FM":"USD","MD":"MDL","MC":"FRF","MN":"MNT","ME":"EUR","MS":"XCD","MA":"MAD","MZ":"MZN","MM":"MMK","NA":"NAD","NR":"AUD","NP":"NPR","NL":"EUR","AN":"ANG","NC":"XPF","NZ":"NZD","NI":"NIO","NE":"XOF","NG":"NGN","MP":"AUD","NO":"NOK","OM":"OMR","PK":"PKR","PW":"USD","PA":"PAB","PG":"PGK","PY":"PYG","PE":"PEN","PH":"PHP","PL":"PLN","PT":"EUR","PR":"USD","QA":"QAR","RE":"FRF","RO":"RON","RU":"RUB","RW":"USD","SH":"SHP","KN":"XCD","LC":"XCD","MF":"USD","PM":"FRF","VC":"XCD","WS":"WST","SM":"ITL","ST":"STD","SA":"SAR","SN":"XOF","RS":"RSD","SC":"SCR","SL":"SLL","SG":"SGD","SK":"SKK","SI":"EUR","SB":"SBD","SO":"SOS","ZA":"ZAR","ES":"EUR","LK":"LKR","SD":"SDD","SR":"SRG","SZ":"SZL","SE":"SEK","CH":"CHF","SY":"SYP","TW":"TWD","TJ":"RUB","TZ":"TZS","TH":"THB","TL":"USD","TG":"XOF","TO":"TOP","TT":"TTD","TN":"TND","TR":"TRY","TM":"TMT","TC":"USD","TV":"AUD","UG":"UGX","UA":"UAH","AE":"AED","GB":"GBP","US":"USD","UY":"UYU","UZ":"UZS","VU":"VUV","VE":"VEF","VN":"VND","VG":"GBP","VI":"USD","EH":"ESP","YE":"YER","ZM":"ZMW"};
        const country_format = {"AX":"3","AF":"0","AL":"5","DZ":"0","AS":"0","AD":"0","AO":"0","AI":"0","AG":"0","AR":"0","AM":"0","AW":"0","AU":"0","AT":"0","AZ":"3","BS":"0","BH":"0","BD":"0","BB":"0","BY":"1","BE":"0","BZ":"0","BJ":"0","BM":"0","BT":"0","BO":"0","BA":"0","BW":"0","BR":"0","BN":"0","BG":"4","BF":"0","BI":"0","KH":"0","CM":"0","CA":"0","CV":"0","KY":"0","CF":"0","TD":"0","CL":"0","CN":"0","CX":"0","CO":"0","KM":"0","CG":"0","CD":"0","CK":"0","CR":"0","HR":"0","CU":"0","CY":"0","CZ":"0","DK":"0","DJ":"0","DM":"0","DO":"0","EC":"0","EG":"0","SV":"0","GQ":"0","ER":"0","EE":"0","ET":"0","FO":"0","FJ":"0","FI":"3","FR":"1","GF":"0","PF":"0","TF":"0","GA":"0","GM":"0","GE":"0","DE":"2","GH":"0","GI":"0","GR":"0","GL":"0","GD":"0","GP":"0","GU":"0","GT":"0","GG":"0","GN":"0","GW":"0","GY":"0","HT":"0","HN":"0","HK":"0","HU":"0","IS":"0","IN":"0","ID":"0","IR":"0","IQ":"0","IE":"0","IL":"0","IT":"2","CI":"0","JM":"0","JP":"0","JO":"0","KZ":"0","KE":"0","KI":"0","KP":"0","KR":"0","KW":"0","KG":"0","LA":"0","LV":"0","LB":"0","LS":"0","LR":"0","LY":"0","LI":"0","LT":"0","LU":"0","MK":"0","MG":"0","MW":"0","MY":"0","MV":"0","ML":"0","MT":"0","MH":"0","MQ":"0","MR":"0","MU":"0","MX":"0","FM":"0","MD":"0","MC":"0","MN":"0","ME":"0","MS":"0","MA":"0","MZ":"0","MM":"0","NA":"0","NR":"0","NP":"0","NL":"1","AN":"0","NC":"0","NZ":"0","NI":"0","NE":"0","NG":"0","MP":"0","NO":"0","OM":"0","PK":"0","PW":"0","PA":"0","PG":"0","PY":"0","PE":"0","PH":"0","PL":"3","PT":"0","PR":"0","QA":"0","RE":"0","RO":"0","RU":"3","RW":"0","SH":"0","KN":"0","LC":"0","MF":"0","PM":"0","VC":"0","WS":"0","SM":"0","ST":"0","SA":"0","SN":"0","RS":"0","SC":"0","SL":"0","SG":"0","SK":"0","SI":"0","SB":"0","SO":"0","ZA":"0","ES":"2","LK":"0","SD":"0","SR":"0","SZ":"0","SE":"0","CH":"0","SY":"0","TW":"0","TJ":"3","TZ":"0","TH":"0","TL":"0","TG":"0","TO":"0","TT":"0","TN":"0","TR":"0","TM":"0","TC":"0","TV":"0","UG":"0","UA":"0","AE":"0","GB":"0","US":"0","UY":"0","UZ":"0","VU":"0","VE":"0","VN":"0","VG":"0","VI":"0","EH":"0","YE":"0","ZM":"0"};
        const formats = [];
        // format 0: ¤1,234.56
        formats.push({"unitAfter": false, "thousandsSeparator": ",", "subUnitSeparator": ".", "isAmountUnitSeparated": false});
        // format 1: ¤1 234,56
        formats.push({"unitAfter": true, "thousandsSeparator": " ", "subUnitSeparator": ",", "isAmountUnitSeparated": false});
        // format 2: 1.234,56 ¤
        formats.push({"unitAfter": true, "thousandsSeparator": ".", "subUnitSeparator": ",", "isAmountUnitSeparated": true});
        // format 3: 1 234,56 ¤
        formats.push({"unitAfter": true, "thousandsSeparator": " ", "subUnitSeparator": ",", "isAmountUnitSeparated": true});
        // format 4: 1 234.56 ¤
        formats.push({"unitAfter": true, "thousandsSeparator": " ", "subUnitSeparator": ".", "isAmountUnitSeparated": true});
        // format 5: 1.234,56¤
        formats.push({"unitAfter": true, "thousandsSeparator": ".", "subUnitSeparator": ",", "isAmountUnitSeparated": false});
        const currencySymbols = {
            "BGN" : "лв",
            "EUR" : "€",
            "GBP" : "£",
            "ILS" : "₪",
            "JPY" : "¥",
            "NGN" : "₦",
            "PHP" : "₱",
            "PLN" : "zł",
            "PYG" : "₲",
            "RUB" : "руб.",
            "THB" : "฿",
            "USD" : "$"
        };
        var quoteStrings = [];
        const makeQuoteStringCallback = function(aConvertFromCurrency) {
            const quote = conversionQuotes[aConvertFromCurrency];
            const conversionQuote = (parseFloat(quote)).toFixed(4);
            if (aConvertFromCurrency != aStorageService.convertToCurrency) {
                const quoteString = "1 " + aConvertFromCurrency + " = " + conversionQuote.replace(".", informationHolder.decimalSep) + " " + aStorageService.convertToCurrency;
                quoteStrings.push(quoteString);
            }
        };
        return {
            get conversionEnabled () {
                return aStorageService.enableOnStart;
            },
            set conversionEnabled (aConversionEnabled) {
                aStorageService.enableOnStart = aConversionEnabled;
            },
            setConversionQuote : function (aConvertFromCurrency, quote) {
                conversionQuotes[aConvertFromCurrency] = quote;
                numberOfReadCurrencies++;
            },
            getConversionQuotes : function () {
                return conversionQuotes;
            },
            get convertToCurrency () {
                return aStorageService.convertToCurrency;
            },
            set convertToCurrency (aCurrency) {
                aStorageService.convertToCurrency = aCurrency;
            },
            get convertToCountry () {
                return aStorageService.convertToCountry;
            },
            set convertToCountry (aCountry) {
                aStorageService.convertToCountry = aCountry;
            },
            getCurrencySymbols : function () {
                return currencySymbols;
            },
            get customSymbols () {
                return aStorageService.customSymbols;
            },
            set customSymbols (aCustomSymbols) {
                aStorageService.customSymbols = aCustomSymbols;
            },
            get decimalSep () {
                return aStorageService.decimalSep;
            },
            set decimalSep (aDecimalSep) {
                aStorageService.decimalSep = aDecimalSep;
            },
            getDefaultEnabledCurrencies : function () {
                return defaultEnabledCurrencies;
            },
            getCurrencyNames : function () {
                return currencyNames;
            },
            get excludedDomains () {
                return aStorageService.excludedDomains;
            },
            set excludedDomains (anExcludedDomains) {
                aStorageService.excludedDomains = anExcludedDomains;
            },
            get enabledCurrencies () {
                return aStorageService.enabledCurrencies;
            },
            set enabledCurrencies (aEnabledCurrencies) {
                aStorageService.enabledCurrencies = aEnabledCurrencies;
            },
            getFromCurrencies : function () {
                return fromCurrencies;
            },
            get enableOnStart () {
                return aStorageService.enableOnStart;
            },
            set enableOnStart (anEnableOnStart) {
                aStorageService.enableOnStart = anEnableOnStart;
            },
            get quoteAdjustmentPercent () {
                return aStorageService.quoteAdjustmentPercent;
            },
            set quoteAdjustmentPercent (aQuoteAdjustmentPercent) {
                aStorageService.quoteAdjustmentPercent = aQuoteAdjustmentPercent;
            },
            getQuoteString : function () {
                quoteStrings = [];
                fromCurrencies.forEach(makeQuoteStringCallback);
                return quoteStrings.join("; ");
            },
            get roundPrices () {
                return aStorageService.roundPrices;
            },
            set roundPrices (aRoundPrices) {
                aStorageService.roundPrices = aRoundPrices;
            },
            get separatePrice () {
                return aStorageService.separatePrice;
            },
            set separatePrice (aSeparatePrice) {
                aStorageService.separatePrice = aSeparatePrice;
            },
            get showOriginalPrices () {
                return aStorageService.showOriginalPrices;
            },
            set showOriginalPrices (aShowOriginalPrices) {
                aStorageService.showOriginalPrices = aShowOriginalPrices;
            },
            get unitAfter () {
                return aStorageService.unitAfter;
            },
            set unitAfter (aUnitAfter) {
                aStorageService.unitAfter = aUnitAfter;
            },
            get tempConvertUnits () {
                return aStorageService.tempConvertUnits;
            },
            set tempConvertUnits (aTempConvertUnits) {
                aStorageService.tempConvertUnits = aTempConvertUnits;
            },
            get thousandSep () {
                return aStorageService.thousandSep;
            },
            set thousandSep (aThousandSep) {
                aStorageService.thousandSep = aThousandSep;
            },
            setUserCountry: function(aUserCountry) {
                aStorageService.convertToCountry = aUserCountry;
                aStorageService.convertToCurrency = country_currency[aUserCountry];
                const formatNumber = country_format[aUserCountry];
                aStorageService.format = formats[formatNumber];
            },
            isAllCurrenciesRead: function() {
                return numberOfReadCurrencies >= numberOfFromCurrencies;
            },
            resetReadCurrencies: function() {
                numberOfReadCurrencies = 0;
            },
            resetSettings: function() {
                aStorageService.resetSettings();
            }
        };
    };

    const makeContentScriptParams = function (aTab, anInformationHolder) {
        const contentScriptParams = {};
        contentScriptParams.conversionQuotes = anInformationHolder.getConversionQuotes();
        contentScriptParams.convertToCurrency = anInformationHolder.convertToCurrency;
        contentScriptParams.convertToCountry = anInformationHolder.convertToCountry;
        contentScriptParams.currencySymbols = anInformationHolder.getCurrencySymbols();
        contentScriptParams.customSymbols = anInformationHolder.customSymbols;
        contentScriptParams.subUnitSeparator = anInformationHolder.decimalSep;
        contentScriptParams.enableOnStart = anInformationHolder.enableOnStart;
        contentScriptParams.excludedDomains = anInformationHolder.excludedDomains;
        contentScriptParams.enabledCurrencies = anInformationHolder.enabledCurrencies;
        contentScriptParams.quoteAdjustmentPercent = anInformationHolder.quoteAdjustmentPercent;
        contentScriptParams.roundAmounts = anInformationHolder.roundPrices;
        contentScriptParams.separatePrice = anInformationHolder.separatePrice;
        contentScriptParams.showOriginalPrices = anInformationHolder.showOriginalPrices;
        contentScriptParams.unitAfter = anInformationHolder.unitAfter;
        contentScriptParams.tempConvertUnits = anInformationHolder.tempConvertUnits;
        contentScriptParams.thousandSep = anInformationHolder.thousandSep;
        contentScriptParams.isEnabled = anInformationHolder.conversionEnabled;
        contentScriptParams.currencyNames = anInformationHolder.getCurrencyNames();
        return contentScriptParams;
    };
    const parseContentScriptParams = function(aContentScriptParams, anInformationHolder) {
        anInformationHolder.convertToCurrency = aContentScriptParams.convertToCurrency;
        anInformationHolder.convertToCountry = aContentScriptParams.convertToCountry;
        anInformationHolder.customSymbols = aContentScriptParams.customSymbols;
        anInformationHolder.decimalSep = aContentScriptParams.subUnitSeparator;
        anInformationHolder.enableOnStart = aContentScriptParams.enableOnStart;
        anInformationHolder.excludedDomains = aContentScriptParams.excludedDomains;
        anInformationHolder.enabledCurrencies = aContentScriptParams.enabledCurrencies;
        anInformationHolder.quoteAdjustmentPercent = aContentScriptParams.quoteAdjustmentPercent;
        anInformationHolder.roundPrices = aContentScriptParams.roundAmounts;
        anInformationHolder.separatePrice = aContentScriptParams.separatePrice;
        anInformationHolder.showOriginalPrices = aContentScriptParams.showOriginalPrices;
        anInformationHolder.unitAfter = aContentScriptParams.unitAfter;
        anInformationHolder.tempConvertUnits = aContentScriptParams.tempConvertUnits;
        anInformationHolder.thousandSep = aContentScriptParams.thousandSep;
    };
    /**
     * Communicate with the Settings tab
     * @param message
     * @param sender
     * @param sendResponse
     */
    const onMessageFromSettings = function(event) {
        if (event.name === "show") {
            safari.application.activeBrowserWindow.activeTab.page.dispatchMessage(
                "updateSettingsTab", makeContentScriptParams(null, informationHolder));
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
                "updateSettings", makeContentScriptParams(null, informationHolder));
            eventAggregator.publish("toggleConversion", anInformationHolder.conversionEnabled);
        }
    };
    safari.application.addEventListener("message", onMessageFromSettings, false);

    const customTabObjects = [];

    /**
     * Runs when tab has been loaded
     * Like PageMod
     */
    const ContentScriptInterface = function(aUrlProvider, anInformationHolder) {
        const attachHandlerSafari = function(event) {
            safari.application.activeBrowserWindow.activeTab.page.dispatchMessage(
                "updateSettings", makeContentScriptParams(null, informationHolder));
            const finishedTabProcessing = function(event) {
                // TODO do something
                // console.log(event.name + " " + event.message);
            };
            safari.application.addEventListener("message", finishedTabProcessing, false);
        };
        // When a tab has been reloaded?
        safari.application.addEventListener("navigate", attachHandlerSafari, false);
        // initialise all tabs
        for (var i = 0; i < safari.application.browserWindows.length; ++i) {
            var browserWindow = safari.application.browserWindows[i];
            for (var j = 0; j < browserWindow.tabs.length; ++j)
                browserWindow.tabs[j].page.dispatchMessage(
                    "updateSettings", makeContentScriptParams(null, informationHolder));
        }
        return {
            sendEnabledStatusSafari: function(status) {
                const sendStatusToTab = function(tab) {
                    tab.page.dispatchMessage("sendEnabledStatus", status);
                };
                const sendStatusToWindow = function(window) {
                    window.tabs.forEach(sendStatusToTab);
                };
                safari.application.browserWindows.forEach(sendStatusToWindow);
                const checkToggleButton = function(element) {
                    if (element != null && element.identifier === "dcc-tools-button") {
                        element.badge = buttonStatus ? 1 : 0;
                    }
                };
                safari.extension.toolbarItems.forEach(checkToggleButton);
            }
        }
    };
    const TabsInterface = function(aUrlProvider, anInformationHolder) {
        var isRegisteredToTabsEvents = false;
        var testPageWorker = null;
        return {
            toggleConversion: function (aStatus) {
                const status = {};
                status.isEnabled = aStatus;
                status.hasConvertedElements = true;
                try {
                    contentScriptInterface.sendEnabledStatusSafari(status);
                }
                catch (err) {
                    console.error(err);
                }
            },
            showSettingsTab: function() {
                const settingsUrl = safari.extension.baseURI + "settings.html";
                const currentWindow = safari.application.activeBrowserWindow;
                const currentTab = currentWindow.activeTab;
                if (currentTab.url === "") {
                    currentTab.url = settingsUrl;
                }
                else {
                    for (var i = 0; i < safari.application.browserWindows.length; ++i) {
                        var browserWindow = safari.application.browserWindows[i];
                        for (var j = 0; j < browserWindow.tabs.length; ++j)
                            if (browserWindow.tabs[j].url === settingsUrl ) {
                                browserWindow.activate();
                                browserWindow.tabs[j].activate();
                                return;
                            }
                    }
                    currentWindow.openTab("foreground").url = settingsUrl;
                }
            },
            showTestTab: function() {
                const pricesUrl = safari.extension.baseURI + "prices.html";
                const currentWindow = safari.application.activeBrowserWindow;
                const currentTab = currentWindow.activeTab;
                if (currentTab.url === "") {
                    currentTab.url = pricesUrl;
                }
                else {
                    currentWindow.openTab("foreground").url = pricesUrl;
                }
            },
            registerToTabsEvents: function() {
                const setTabs = function(aTab) {
                    if (customTabObjects[aTab.id] == null) {
                        customTabObjects[aTab.id] = new CustomTabObject();
                        customTabObjects[aTab.id].isEnabled = anInformationHolder.conversionEnabled;
                        eventAggregator.publish("toggleConversion", anInformationHolder.conversionEnabled);
                    }
                };
                const releaseTabs = function(aTab) {
                    if (settingsWorker != null && settingsWorker.settingsTab != null) {
                        if (settingsWorker.settingsTab.title == aTab.title) {
                            settingsWorker.settingsTab = null;
                        }
                        else {
                            customTabObjects[aTab.id] = null;
                        }
                    }
                    else {
                        customTabObjects[aTab.id] = null;
                    }
                };
                if (!isRegisteredToTabsEvents) {
                    const navigateEvent2 = function(event) {
                        eventAggregator.publish("toggleConversion", anInformationHolder.conversionEnabled);
                    };
                    for (var i = 0; i < safari.application.browserWindows.length; ++i) {
                        var browserWindow = safari.application.browserWindows[i];
                        browserWindow.addEventListener("navigate", navigateEvent2, false);
                    }
                    navigateEvent2(null);
                    isRegisteredToTabsEvents = true;
                }
            }
        };
    };
    //Stereotype Controller
    const Controller = function(anEventAggregator) {
        anEventAggregator.subscribe("quoteReceived", function(eventArgs) {
            informationHolder.setConversionQuote(eventArgs.convertFromCurrency, eventArgs.quote);
            if (informationHolder.isAllCurrenciesRead()) {
                contentScriptInterface = new ContentScriptInterface(urlProvider, informationHolder);
                tabsInterface.registerToTabsEvents();
            }
        });
        anEventAggregator.subscribe("saveSettings", function(eventArgs) {
            const reloadQuotes = informationHolder.convertToCurrency != eventArgs.contentScriptParams.convertToCurrency;
            informationHolder.resetReadCurrencies();
            parseContentScriptParams(eventArgs.contentScriptParams, informationHolder);
            if (reloadQuotes) {
                controller.loadQuotes();
            }
        });
        anEventAggregator.subscribe("resetSettings", function() {
            informationHolder.resetSettings();
            controller.loadStorage();
        });
        anEventAggregator.subscribe("tabActivated", function(eventArgs) {
            const customTabObject = tabsInterface.getCustomTabObjects()[eventArgs.tab.id];
            if (customTabObject != null) {
                tabsInterface.toggleConversion(customTabObject.isEnabled);
            }
            else {
            }
        });
        anEventAggregator.subscribe("toggleConversion", function(eventArgs) {
            tabsInterface.toggleConversion(eventArgs);
        });
        anEventAggregator.subscribe("showSettingsTab", function() {
            tabsInterface.showSettingsTab();
        });
        anEventAggregator.subscribe("showTestTab", function() {
            tabsInterface.showTestTab();
        });
        this.loadStorage = function() {
            storageService.init(informationHolder.getDefaultEnabledCurrencies());
        };
        this.loadUserCountryAndQuotes = function() {
            quotesService.loadUserCountry();
        };
        this.loadQuotes = function() {
            quotesService.loadQuotes(informationHolder.getFromCurrencies(), informationHolder.convertToCurrency);
        };
    };
    var contentScriptInterface;
    const urlProvider = UrlProvider;
    const quotesService = new YahooQuotesServiceProvider();
    const storageService = new StorageServiceProvider();
    const informationHolder = new InformationHolder(urlProvider, storageService);
    const tabsInterface = new TabsInterface(urlProvider, informationHolder);
    const controller = new Controller(eventAggregator);
    controller.loadStorage();
    controller.loadUserCountryAndQuotes();
    var buttonStatus = informationHolder.conversionEnabled;
    const onBrowserAction = function(event) {
        if (event.command === "toggle") {
            buttonStatus = !buttonStatus;
            eventAggregator.publish("toggleConversion", buttonStatus);
        }
        else if (event.command === "open-settings") {
            eventAggregator.publish("showSettingsTab");
        }
        else if (event.command === "open-testpage") {
            eventAggregator.publish("showTestTab");
        }
    };
    safari.application.addEventListener("command", onBrowserAction, false);
})();

