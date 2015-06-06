/**
 * Google Chrome browser
 */
const SfFreegeoipServiceProvider = function() {
    "use strict";
    var onComplete = function() {
        try {
            if (this.readyState === this.DONE) {
                var countryCode;
                if (this.status === 200) {
                    var response = JSON.parse(this.responseText);
                    countryCode = response.country_code;
                }
                else {
                    countryCode = "GB";
                }
                eventAggregator.publish("countryReceived", countryCode);
            }
        }
        catch(err) {
            console.error("err " + err);
            eventAggregator.publish("countryReceived", "CH");
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
