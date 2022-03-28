/**
 * @description - Adds listener that fires when extension is first installed to initialise database.
 */
chrome.runtime.onInstalled.addListener(() => {

    // makes call to the createDB function below which initialises the database.
    createDB()
})

/**
 * @description - Creates the IndexedDB database and the object stores.
 */
function createDB() {

    // request to open up the database with the name and version.
    const request = indexedDB.open("historyItems", 1)

    request.onupgradeneeded = function(event){
        db = event.target.result
        // creates the object stores and initialises a name for them.
        // key path must be specified as every entry to an IndexedDB database must have a unique key.
        db.createObjectStore("blacklist", {keyPath: "domain"})
        db.createObjectStore("extension_settings", {keyPath: "id"})
        console.log(`upgrade is called database name: ${db.name} version: ${db.version}`)
    }

    request.onsuccess = function(event){
        db = event.target.result
        var time = new Date()
        console.log(`success is called database name: ${db.name} version: ${db.version} time: ${time.toUTCString()}`)
        // makes a call to the initSettings function below which initialises the settings.
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

    // request to make a read and write transaction with the 'extension_settings' object store
    var transaction = db.transaction(["extension_settings"], "readwrite")
    transaction.oncomplete = function(event) {
        console.log("[IDB] Transaction Complete: Settings initialised")
    }
    transaction.onerror = function(event) {
        console.log(`[IDB] ${event.target.error}`)
    }

    // opens the object store and adds the initial data. 
    var objectStore = transaction.objectStore("extension_settings")
    var objectStoreRequest = objectStore.add({ id: "1", consent: "true"})
    objectStoreRequest.onsuccess = function(event) {
        console.log("[IDB] Request Successful: Initalising settings") 
    }
}