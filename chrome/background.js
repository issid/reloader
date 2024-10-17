chrome.action.onClicked.addListener((tab) => {
    WsServer(tab.id, true, (str) => {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: sendAlert,
            args: [str]
        });
    });
});

function sendAlert(greeting) {
    alert(`${greeting}`);
}

var socket = null;
function WsServer(tabId, run, sendResponse) {
    if (run) {
        if (!socket) {
            socket = new WebSocket('ws://localhost:43902');
        }

        socket.onerror = function (error) {
            // console.log("err", error);
        };

        // set badge on
        socket.onopen = (event) => {
            console.log("Connected");
            sendResponse("Connected");
            chrome.action.setBadgeBackgroundColor({ color: "green" });
            chrome.action.setBadgeText({ text: "on" });
        };

        // reload tab
        socket.onmessage = function (event) {
            if (tabId !== null && event.data == 'reload') {
                console.log("reload tabsId: " + tabId);
                chrome.tabs.reload(tabId);
            }
        };

        // set badge off
        socket.onclose = () => {
            socket = null;
            console.log("Server closed");
            sendResponse("Server closed");
            chrome.action.setBadgeBackgroundColor({ color: "red" });
            chrome.action.setBadgeText({ text: "off" });
        };
    }

    if (!run) {
        if (socket) {
            socket.close();
            socket = null;
            console.log("Disconected");
        }
    }
}