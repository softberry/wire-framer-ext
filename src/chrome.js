/**
 * Created by emresakarya on 30.12.15.
 */

chrome.browserAction.onClicked.addListener(function (tab) {
    //var style = chrome.extension.getURL("ruler.min.css");
    chrome.tabs.executeScript(null, {file: 'main.min.js'});
    chrome.tabs.insertCSS(null, {file: 'ruler.min.css'});
});