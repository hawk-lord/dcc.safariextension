/**
 * Created by per on 14-11-20.
 */

//alert("Hello main script");

safari.application.addEventListener("command", function (event) {
//    alert("You clicked");
    safari.application.activeBrowserWindow.activeTab.page.dispatchMessage("name", "data");
//    alert("Message dispatched");
});




