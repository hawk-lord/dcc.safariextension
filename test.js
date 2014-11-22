/**
 * Created by per on 14-11-20.
 */

//alert("Hello main script");

const DCCTest = function () {

    // SafariEventListener
    const finishedTabProcessing = function(event) {
        console.log(event.name + " " + event.message);
    };
    safari.application.addEventListener("message", finishedTabProcessing, false);

    // Never
    const openEvent1 = function(event) {
        console.log("open app " + event);
    };
    // called when open in a new tab by target blank?
    const openEvent2 = function(event) {
        console.log("open win " + event);
    };
    // Never
    const openEvent3 = function(event) {
        console.log("open tab " + event);
    };
    safari.application.addEventListener("open", openEvent1, false);
    safari.application.activeBrowserWindow.addEventListener("open", openEvent2, false);
    safari.application.activeBrowserWindow.activeTab.addEventListener("open", openEvent3, false);

    //
    const closeEvent1 = function(event) {
        console.log("close app " + event);
    };
    // When window is closed
    const closeEvent2 = function(event) {
        console.log("close win " + event);
    };
    // When window is closed
    // When tab is closed
    const closeEvent3 = function(event) {
        console.log("close tab " + event);
    };
    safari.application.addEventListener("close", closeEvent1, false);
    safari.application.activeBrowserWindow.addEventListener("close", closeEvent2, false);
    safari.application.activeBrowserWindow.activeTab.addEventListener("close", closeEvent3, false);

    const activateEvent = function(event) {
        console.log("activate " + event);
    };
    safari.application.addEventListener("activate", activateEvent, false);

    /*
     event: SafariNavigateEvent
     BUBBLING_PHASE: 3
     CAPTURING_PHASE: 1
     TARGETING_PHASE: 2
     bubbles: true
     cancelable: false
     currentTarget: SafariApplication
     defaultPrevented: false
     eventPhase: 3
     target: SafariBrowserTab
     timeStamp: 1416683225794
     type: "navigate"
     __proto__: CallbackObject
     this: SafariApplication
     */

    //
    const navigateEvent1 = function(event) {
        console.log("navigate app " + event);
    };
    // When a tab is reloaded
    const navigateEvent2 = function(event) {
        console.log("navigate win " + event);
        convert(event);
    };
    // When a tab is loaded
    const navigateEvent3 = function(event) {
        console.log("navigate tab " + event);
        convert(event);
    };
    safari.application.addEventListener("navigate", navigateEvent1, false);
    safari.application.activeBrowserWindow.addEventListener("navigate", navigateEvent2, false);
    safari.application.activeBrowserWindow.activeTab.addEventListener("navigate", navigateEvent3, false);

    const validateEvent = function(event) {
        console.log("validate " + event);
    };
    safari.application.addEventListener("validate", validateEvent, false);
    console.log("addEventListener");

    const convert = function (event) {
        const contentScriptParams = {};
        contentScriptParams.conversionQuotes = {
            AED: 0.2172,
            AFN: 0.0137,
            ALL: 0.0071310908429662485,
            AMD: 0.0019123139055626727,
            ANG: 0.45,
            AOA: 0.007906075819267108,
            ARS: 0.0937,
            AUD: 0.6871,
            AWG: 0.4456,
            AZN: 1.0169,
            BAM: 0.5103,
            BBD: 0.3988,
            BDT: 0.0103,
            BGN: 0.5098,
            BHD: 2.1153,
            BIF: 0.0005129797469953109,
            BMD: 0.7977,
            BND: 0.6129,
            BOB: 0.1154,
            BOV: 0,
            BRL: 0.3101,
            BSD: 0.7977,
            BTN: 0.0129,
            BWP: 0.0865,
            BYR: 0.00007338394966800367,
            BZD: 0.3998,
            CAD: 0.7051,
            CDF: 0.0008727391800632858,
            CHE: 0,
            CHF: 0.8319,
            CHW: 0,
            CLF: 32.5718,
            CLP: 0.0013305592060925773,
            CNY: 0.1303,
            COP: 0.00036912702749940983,
            COU: 0,
            CRC: 0.0014830139292083301,
            CUC: 0,
            CUP: 0.7977,
            CVE: 0.009195199370312747,
            CZK: 0.0361,
            DJF: 0.0044070918922730455,
            DKK: 0.1344,
            DOP: 0.0182,
            DZD: 0.009381751929591828,
            EGP: 0.1115,
            ERN: 0.0528,
            ETB: 0.0397,
            EUR: 1.00,
            FJD: 0.4075,
            FKP: 1.2523,
            GBP: 1.2508,
            GEL: 0.4468,
            GHS: 0.2506,
            GIP: 1.2522,
            GMD: 0.0185,
            GNF: 0.00011354925329443287,
            GTQ: 0.1047,
            GYD: 0.0038267375684603346,
            HKD: 0.1028,
            HNL: 0.0375,
            HRK: 0.1302,
            HTG: 0.0172,
            HUF: 0.003282716040466697,
            IDR: 0.00006527688522516714,
            ILS: 0.2078,
            INR: 0.0129,
            IQD: 0.0006861794134099219,
            IRR: 0.000029748769352165722,
            ISK: 0.00647155363882518,
            JMD: 0.007062271579653596,
            JOD: 1.1283,
            JPY: 0.006743170180083103,
            KES: 0.008853310385552813,
            KGS: 0.0138,
            KHR: 0.00019671603432592507,
            KMF: 0.002031926441011753,
            KPW: 0.0008863150300416479,
            KRW: 0.000716922247058002,
            KWD: 2.7388,
            KYD: 0.9728,
            KZT: 0.004407944703215287,
            LAK: 0.00009912190972949839,
            LBP: 0.0005263500853371393,
            LKR: 0.0060857049832795254,
            LRD: 0.009553096588493678,
            LSL: 0.0727,
            LTL: 0.2898,
            LYD: 0.6635,
            MAD: 0.0906,
            MDL: 0.0528,
            MGA: 0.0002927279126837131,
            MKD: 0.0162,
            MMK: 0.0007560981584775691,
            MNT: 0.00042486475067959244,
            MOP: 0.0998,
            MRO: 0.002745898657118262,
            MUR: 0.025,
            MVR: 0.0519,
            MWK: 0.001630421313910885,
            MXN: 0.0584,
            MXV: 0.305,
            MYR: 0.2369,
            MZN: 0.0253,
            NAD: 0.0727,
            NGN: 0.004523296560440063,
            NIO: 0.0299,
            NOK: 0.1178,
            NPR: 0.008008065723797008,
            NZD: 0.6268,
            OMR: 2.0714,
            PAB: 0.7977,
            PEN: 0.2724,
            PGK: 0.3134,
            PHP: 0.0177,
            PKR: 0.007851216310430812,
            PLN: 0.2372,
            PYG: 0.00017135451200848135,
            QAR: 0.219,
            RON: 0.2252,
            RSD: 0.008327809219884144,
            RUB: 0.0172,
            RWF: 0.0011594237849296707,
            SAR: 0.2126,
            SBD: 0.1068,
            SCR: 0.0563,
            SDG: 0.1401,
            SEK: 0.1078,
            SGD: 0.6133,
            SHP: 1.2522,
            SLL: 0.0001840100493040206,
            SOS: 0.001035280388611129,
            SRD: 0.2436,
            SSP: 0,
            STD: 0.00004116014037517698,
            SVC: 0.0912,
            SYP: 0.00467301511346548,
            SZL: 0.0727,
            THB: 0.0243,
            TJS: 0.1568,
            TMT: 0.2799,
            TND: 0.4364,
            TOP: 0.4004,
            TRY: 0.3592,
            TTD: 0.1257,
            TWD: 0.0258,
            TZS: 0.00046282769299880083,
            UAH: 0.0527,
            UGX: 0.00029059508759465846,
            USD: 0.7977,
            USN: 0,
            UYI: 0,
            UYU: 0.0333,
            UZS: 0.00033281329037956257,
            VEF: 0.1269,
            VND: 0.000037449931688328606,
            VUV: 0.008061480071618188,
            WST: 0.3278,
            XAF: 0.0015252442411734497,
            XAG: 12.869,
            XAU: 952.1151,
            XBA: 0,
            XBB: 0,
            XBC: 0,
            XBD: 0,
            XCD: 0.2954,
            XDR: 1.1702,
            XOF: 0.0015244787845147714,
            XPD: 611.6638,
            XPF: 0.008392253949604515,
            XPT: 962.0861,
            XSU: 0,
            XTS: 0,
            XUA: 0,
            XXX: 0,
            YER: 0.0037117967954573548,
            ZAR: 0.0728,
            ZMW: 0.1256,
            ZWL: 0.0024745498731916916
        };
        contentScriptParams.convertToCountry = "AX";
        contentScriptParams.convertToCurrency = "EUR";
        contentScriptParams.currencyNames = {};
        contentScriptParams.currencySymbols = {};
        contentScriptParams.customSymbols = {};
        contentScriptParams.enableOnStart = true;
        contentScriptParams.enabledCurrencies = {
            "CHF": true,
            "DKK": true,
            "EUR": true,
            "GBP": true,
            "ISK": true,
            "JPY": true,
            "NOK": true,
            "RUB": true,
            "SEK": true,
            "USD": true
        };
        contentScriptParams.excludedDomains = [];
        contentScriptParams.isEnabled = false;
        contentScriptParams.quoteAdjustmentPercent = "0";
        contentScriptParams.roundAmounts = false;
        contentScriptParams.separatePrice = true;
        contentScriptParams.showOriginalPrices = true;
        contentScriptParams.subUnitSeparator = ",";
        contentScriptParams.tempConvertUnits = false;
        contentScriptParams.thousandSep = ".";
        contentScriptParams.unitAfter = true;
        safari.application.activeBrowserWindow.activeTab.page.dispatchMessage("contentScriptParams", contentScriptParams);
        const status = {};
        status.isEnabled = true;
        status.hasConvertedElements = false;
        safari.application.activeBrowserWindow.activeTab.page.dispatchMessage("sendEnabledStatus", status);
        // alert("command");
    };
    //safari.application.addEventListener("command", convert);
    alert("created DCCTest");
}();


/*
 Chrome API used in background.js and url

 chrome.browserAction.onClicked.addListener(onBrowserAction);
 safari.application.addEventListener("command", function (event) {

 chrome.i18n.getMessage(aCurrency);;

 chrome.runtime.getURL(aUrl);

 chrome.runtime.onMessage.addListener(onMessageFromSettings);
 safari.application.addEventListener("message", waitForMessage, false);

 chrome.runtime.Port.onMessage.addListener(finishedTabProcessingHandler);
 safari.application.activeBrowserWindow.activeTab.addEventListener("message", finishedTabProcessing, false);
 //safari.application.activeBrowserWindow.addEventListener("message", waitForMessage, false);
 //safari.application.addEventListener("message", waitForMessage, false);

 chrome.storage.local.get(null, function(aStorage) {

 chrome.storage.local.set(storage);

 chrome.tabs.connect(tabId, {name: "dccContentPort"});
 // Not needed, just sets contentPort

 chrome.runtime.Port.postMessage(makeContentScriptParams(tab, informationHolder));
 safari.application.activeBrowserWindow.activeTab.page.dispatchMessage("contentScriptParams", contentScriptParams);


 chrome.tabs.executeScript({file: "dcc-chrome-content-adapter.js", allFrames: true}, onScriptExecuted);
 chrome.tabs.executeScript({file: "dcc-content.js", allFrames: true}, function(){
 chrome.tabs.executeScript({file: "dcc-regexes.js", allFrames: true}, function(){
 // onScriptExecuted run everytime a tab has been loaded

 chrome.tabs.onCreated.addListener(attachCreationHandler);
 Unused

 chrome.tabs.onUpdated.addListener(attachHandler);
 chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {

 chrome.tabs.query({active: true}, tabCallback);

 */

/*

 In content scripts

 chrome.runtime.onConnect.addListener(portListener);
 chrome.runtime.sendMessage({command: "show"}, DirectCurrencySettings.showSettings);

 */

/*
 In CCC Main

 // readonly attribute SafariBrowserWindow activeBrowserWindow
 // readonly attribute SafariBrowserTab activeTab
 // readonly attribute SafariWebPageProxy page
 // void dispatchMessage (in DOMString name, in any message);
 safari.application.activeBrowserWindow.activeTab.page).dispatchMessage('convert', JSON.stringify(this.data));
 safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('toggle', !CCC.tabs[CCC.tabID] );

 // SafariEventListener  is undocumented
 // SafariEventTarget:
 // void addEventListener(in DOMString type, in SafariEventListener listener, in boolean useCapture);
 safari.application.addEventListener("message", function(event) {
 safari.application.addEventListener('command', function(event) {

 // SafariEventTarget:
 // void addEventListener(in DOMString type, in SafariEventListener listener, in boolean useCapture);
 safari.extension.settings.addEventListener("change", function(event) {
 safari.extension.settings.currency;

 In CCC content script

 safari.self.addEventListener("message", function(event) {
 safari.self.tab.dispatchMessage('action', 'send');

 */