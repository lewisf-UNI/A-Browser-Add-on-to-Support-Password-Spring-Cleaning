/* controller to tie the model and view togther */

// when HTML page is fully loaded, the function is fired
document.addEventListener('DOMContentLoaded', function() {


    document.getElementById("hb1").addEventListener("click", function() {
        window.location.href="/View/help.html"
    })

    document.getElementById("nav3").addEventListener("click", function() {
        if(window.confirm("If you want the extension to stop tracking your data, press 'Cancel'. Otherwise press 'Ok'!")) {
            updateSettings("true")
        } else {
            updateSettings("false")
        }
    })

}, false)

function runExtension() {
    // use the chrome.history API to search the users history and return HistoryItems     
    chrome.history.search({text: '', maxResults: 0, startTime: 0}, function(data) { // BUG WITH chrome.history NOT RETURNING ALL RESULTS, ADDED A startTime AND THIS SEEMED TO FIX ISSUE
        sortHistory(data)
    })
}

function updateSettings(bool) {
    const IDBrequest = indexedDB.open("historyItems", 1)
    IDBrequest.onsuccess = function(event) {
        db = IDBrequest.result
        var transaction = db.transaction(["extension_settings"], "readwrite")
        transaction.oncomplete = function(event) {
            console.log("[IDB] Transaction Complete")
        }
        transaction.onerror = function(event) {
            console.log(`[IDB] ${event.target.error}`)
        }

        var objectStore = transaction.objectStore("extension_settings")
        objectStore.openCursor().onsuccess = function(event) {
            const cursor = event.target.result
            if(cursor) {
                if(cursor.value.id === '1') {
                    const updateData = cursor.value

                    updateData.consent = bool
                    const UpdateRequest = cursor.update(updateData)
                    UpdateRequest.onsuccess = function() {
                        console.log("[IDB] Settings Updated")
                    } 
                }
                cursor.continue()
            }
        }
    }
}