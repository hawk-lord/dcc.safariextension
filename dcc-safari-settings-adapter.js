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

const SettingsAdapter = function() {
    const messageListener = function(event) {
        if (event.name === "updateSettingsTab") {
            DirectCurrencySettings.showSettings(event.message);
        }
    };
    safari.self.addEventListener("message", messageListener, false);
    const dispatchSettingsShow = function() {
        safari.self.tab.dispatchMessage("settings", "show");
    };
    window.onload = dispatchSettingsShow;
    return {
        showSettings: messageListener
    }

}();