/* controller to tie the model and view togther */

// when HTML page is fully loaded, the function is fired
document.addEventListener('DOMContentLoaded', function() {

    // use the chrome.history API to search the users history and return HistoryItems 
    chrome.history.search({text: '', maxResults: 0, startTime: 0}, function(data) { // BUG WITH chrome.history NOT RETURNING ALL RESULTS, ADDED A startTime AND THIS SEEMED TO FIX ISSUE

        sortHistory(data)

    })
}, false)