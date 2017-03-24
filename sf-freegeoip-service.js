/*
 * © Per Johansson
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */

"use strict";

if (!this.SfFreegeoipServiceProvider) {

    const SfFreegeoipServiceProvider = function() {
        const onComplete = function() {
            try {
                if (this.readyState === this.DONE) {
                    let countryCode;
                    if (this.status === 200) {
                        const response = JSON.parse(this.responseText);
                        countryCode = response.country_code;
                    }
                    else {
                        countryCode = "";
                    }
                    eventAggregator.publish("countryReceivedFreegeoip", countryCode);
                }
            }
            catch(err) {
                console.error("err " + err);
                eventAggregator.publish("countryReceivedFreegeoip", "");
            }
        };
        const findCountry = (aUrlString, aConvertToCountry) => {
            const urlString = aUrlString;
            const request = new XMLHttpRequest();
            const method = "GET";
            request.open(method, urlString);
            request.onreadystatechange = onComplete;
            request.send();
        };
        return {
            findCountry: findCountry
        };
    };
    this.SfFreegeoipServiceProvider = SfFreegeoipServiceProvider    ;
}
