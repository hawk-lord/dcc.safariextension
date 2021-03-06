/*
 * © Per Johansson
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */
const Localisation = function() {
    "use strict";

    /**
     * Returns a localised String from /_locales/xx/messages.json
     * @param parameter
     * @returns {*}
     * @private
     */
    var _ = function(parameter) {
        //const _ = chrome.i18n;
        //return _.getMessage(parameter);
        return parameter;
    };
    return {
        _ : _
    }
};

if (typeof exports === "object") {
    exports.Localisation = Localisation;
}
