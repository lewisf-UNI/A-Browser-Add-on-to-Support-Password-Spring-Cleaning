/**
 * @description - Adds listener that fires when extension is first installed to initialise database.
 */
chrome.runtime.onInstalled.addListener(() => {
    createDB()
})

/**
 * @description - Creates the IndexedDB database and the object stores.
 */
function createDB() {

    const request = indexedDB.open("historyItems", 1)

    request.onupgradeneeded = function(event){
        db = event.target.result
        db.createObjectStore("blacklist", {keyPath: "domain"})
        db.createObjectStore("extension_settings", {keyPath: "id"})
        console.log(`upgrade is called database name: ${db.name} version: ${db.version}`)
    }

    request.onsuccess = function(event){
        db = event.target.result
        var time = new Date()
        console.log(`success is called database name: ${db.name} version: ${db.version} time: ${time.toUTCString()}`)
        initSettings(db)
    }

    request.onerror = function(event){
        console.log(`[IDB] ${event.target.error}`)
    }
}

/**
 * 
 * @param {IDBRequest} db 
 * @description - Initialises the 'extension_settings' object store with default values. This is used for consent to comply with my ethics application. 
 */
function initSettings(db) {

    var transaction = db.transaction(["extension_settings"], "readwrite")

    transaction.oncomplete = function(event) {
        console.log("[IDB] Transaction Complete: Settings initialised")
    }

    transaction.onerror = function(event) {
        console.log(`[IDB] ${event.target.error}`)
    }

    var objectStore = transaction.objectStore("extension_settings")

    var objectStoreRequest = objectStore.add({ id: "1", consent: "true"})

    objectStoreRequest.onsuccess = function(event) {
        console.log("[IDB] Request Successful: Initalising settings") 
    }
}