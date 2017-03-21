/*
 * © Per Johansson
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Based on code from Simple Currency Converter
 * https://addons.mozilla.org/addon/simple-currency-converter/
 *
 * Module pattern is used.
 */

"use strict";

if (!this.SettingsAdapter) {

    const SettingsAdapter = function() {
        const messageListener = (event) => {
            if (event.name === "updateSettingsTab") {
                DirectCurrencySettings.showSettings(event.message);
            }
        };
        safari.self.addEventListener("message", messageListener, false);
        const dispatchSettingsShow = () => {
            safari.self.tab.dispatchMessage("showSettings");
        };
        window.onload = dispatchSettingsShow;
        return {
            save : (contentScriptParams) => {
                safari.self.tab.dispatchMessage("save", contentScriptParams);
                window.close();
            },
            reset : () => {
                safari.self.tab.dispatchMessage("reset");
                window.close();
            },
            resetQuotes : () => {
                safari.self.tab.dispatchMessage("resetQuotes");
            }
        }
    }();

    this.SettingsAdapter = SettingsAdapter;
}
