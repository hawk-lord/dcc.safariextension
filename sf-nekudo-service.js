/*
 * © Per Johansson
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */
const SfNekudoServiceProvider = function() {
    // "use strict";
    var onComplete = function() {
        try {
            if (this.readyState === this.DONE) {
                var countryCode;
                if (this.status === 200) {
                    var response = JSON.parse(this.responseText);
                    countryCode = response.country_code;
                }
                else {
                    countryCode = "";
                }
                eventAggregator.publish("countryReceivedNekudo", countryCode);
            }
        }
        catch(err) {
            console.error("err " + err);
            eventAggregator.publish("countryReceivedNekudo", "");
        }
    };
    var findCountry = function (aUrlString, aConvertToCountry) {
        var urlString = aUrlString;
        var userCountry = aConvertToCountry;
        var request = new XMLHttpRequest();
        var method = "GET";
        request.open(method, urlString);
        request.onreadystatechange = onComplete;
        request.send();
    };
    return {
        findCountry: findCountry
    };
};
