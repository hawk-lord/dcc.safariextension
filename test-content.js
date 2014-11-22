/**
 * Created by per on 14-11-20.
 */

(function () {

    function handleMessage(msgEvent) {
        // alert("Hello content script ");
        // alert(msgEvent.name);
        document.body.style.background = '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6);
        var messageName = msgEvent.name;
        var messageData = msgEvent.message;
        if (messageName === "activateMyScript") {
            if (messageData === "stop") {
                stopIt();
            }
            if (messageData === "start") {
                startIt();
            }
        }
    }

    // safari.self.addEventListener("message", handleMessage, false);
})();