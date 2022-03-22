/**
 * 
 * @description - Adds event listener that fires when all HTML content is loaded on the document e.g. the extension.
 */
document.addEventListener('DOMContentLoaded', function() {

    /**
     * 
     * @description - Adds a click event listener to the help button in the top right of the extension. Navigates to the help page, or help.html, when triggered. 
     */
    document.getElementById("hb1").addEventListener("click", function() {
        window.location.href="/View/help.html"
    })

    /**
     * 
     * @description - Adds a click event listener to the settings button in the nav bar at the bottom of the extension. Used for checking consent to comply with my ethics application.
     */
    document.getElementById("nav3").addEventListener("click", function() {

        /**
         * 
         * @description - Displays an alert to the user with a message about consent. 
         */
        if(window.confirm("If you want the extension to stop tracking your data, press 'Cancel'. Otherwise press 'Ok'!")) {
            updateSettings("true")
        } else {
            updateSettings("false")
        }
    })
}, false)

/**
 * 
 * @description - When called, runs the main logic of the extension. This is in it's own funtion as the extension checks for consent first before getting the users data.
 */
function runExtension() {

    /**
     * 
     * @param {string} text - Specifies any specific queries to search for in the users history. Leaving this empty retrieves all pages in the users history. 
     * @param {number} maxResults - Specifies the maximum number of results to retrieve. Defaults to 100 but when set to 0, retrieves all results.
     * @param {number} startTime - Specifies a date, represented in milliseconds since the epoch, which limits results to only those visited after it. 
     * Defaults to 24 hours but when set to 0, retrieves all results. 
     * @description - Uses the chrome.history API to search the users Google Chrome history. Returns all results in a callback function. 
     */
    chrome.history.search({text: '', maxResults: 0, startTime: 0}, function(data) { 

        // Call to the sortHistory method in popup.js
        sortHistory(data)
    })
}

/**
 * 
 * @param {boolean} bool - Boolean that indicates user consent. 
 * @description - Updates the user consent status in the extension_settings object store in the IndexedDB database. 
 */
function updateSettings(bool) {
    const IDBrequest = indexedDB.open("historyItems", 1)
    IDBrequest.onsuccess = function(event) {
        db = IDBrequest.result
        var transaction = db.transaction(["extension_settings"], "readwrite")
        transaction.oncomplete = function(event) {
            console.log("[IDB] Transaction Complete: Settings updated succesfully")
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
                        console.log("[IDB] Request Complete: Updating settings")
                    } 
                }
                cursor.continue()
            }
        }
    }
    IDBrequest.onerror = function(event) {
        console.log(`[IDB] ${event.target.error}`)
    }
}