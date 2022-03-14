/* background worker, runs in background when google chrome is loaded */

// runs when extension is first installed
chrome.runtime.onInstalled.addListener(() => {
    
    // TODO should check to see if browser supports indexeddb first to prevent errors
    createDB()
})

function createDB() {

    const request = indexedDB.open("historyItems", 1)

    request.onupgradeneeded = function(e){
        db = e.target.result
        db.createObjectStore("blacklist", {keyPath: "domain"})
        db.createObjectStore("extension_settings", {keyPath: "id"})
        console.log(`upgrade is called database name: ${db.name} version: ${db.version}`)
    }

    request.onsuccess = function(e){
        db = e.target.result
        var time = new Date()
        console.log(`success is called database name: ${db.name} version: ${db.version} time: ${time.toUTCString()}`)
        initSettings(db)
    }

    request.onerror = function(e){
        console.log(`error: ${e.target.error}`)
    }
}

function initSettings(db) {
    var transaction = db.transaction(["extension_settings"], "readwrite")
    transaction.oncomplete = function(event) {
        console.log("[IDB] Transaction Complete")
    }
    transaction.onerror = function(event) {
        console.log(`[IDB] ${event.target.error}`)
    }

    var objectStore = transaction.objectStore("extension_settings")
    var objectStoreRequest = objectStore.add({ id: "1", consent: "true"})
    objectStoreRequest.onsuccess = function(event) {
        console.log("[IDB] Request Successful")  //TODO - Change error message to something more meaningful
    }
}