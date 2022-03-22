/**
 * 
 * @description - Adds event listener that fires when all HTML content is loaded on the document e.g. the extension.
 */
document.addEventListener('DOMContentLoaded', function() {

    /**
     * 
     * @description - Adds a click event listener to the frequently used websites button in the nav bar at the bottom of the extension. 
     * Navigates to the main popup page, or popup.html, when triggered.
     */
    document.getElementById('nav1').addEventListener("click", function() {
        window.location.href = "/View/popup.html"
    })

    /**
     * 
     * @description - Adds a click event listener to the button on the help page that navigates to the government page on browser password stores.
     */
    document.getElementById("ncsc-button").addEventListener("click", function() {
        window.open("https://www.ncsc.gov.uk/collection/top-tips-for-staying-secure-online/password-managers")
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
})

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

