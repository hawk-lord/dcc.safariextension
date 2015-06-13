/*
 * © 2014-2015 Per Johansson
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */
const SfYahooQuotesServiceProvider = function() {
    "use strict";
    var onCompleteFromTo = function(aResponse) {
        try {
            // console.log("onCompleteFromTo aResponse " + aResponse);
            eventAggregator.publish("quotesFromTo", aResponse);
        }
        catch(err) {
            console.error("err " + err);
        }
    };
    var onCompleteToFrom = function(aResponse) {
        try {
            // console.log("onCompleteToFrom aResponse " + aResponse);
            eventAggregator.publish("quotesToFrom", aResponse);
        }
        catch(err) {
            console.error("err " + err);
        }
    };
    var fetchQuotesFromTo = function(aUrlString) {
        // console.log("fetchQuotesFromTo ");
        var urlString = aUrlString;
        var request = new XMLHttpRequest();
        request.open("GET", aUrlString, true);
        request.onreadystatechange = function () {
            if (request.readyState === 4 && request.status === 200) {
                onCompleteFromTo(request.responseText);
            }
        };
        request.send(null);
    };
    var fetchQuotesToFrom = function(aUrlString) {
        // console.log("fetchQuotesToFrom ");
        var urlString = aUrlString;
        var request = new XMLHttpRequest();
        request.open("GET", aUrlString, true);
        request.onreadystatechange = function () {
            if (request.readyState === 4 && request.status === 200) {
                onCompleteToFrom(request.responseText);
            }
        };
        request.send(null);
    };
    return {
        fetchQuotesFromTo: fetchQuotesFromTo,
        fetchQuotesToFrom: fetchQuotesToFrom
    };
};

if (typeof exports === "object") {
    exports.SfYahooQuotesServiceProvider = SfYahooQuotesServiceProvider;
}
