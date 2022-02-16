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
        const hItems = db.createObjectStore("history_items", {keyPath: "domain"})
        console.log(`upgrade is called database name: ${db.name} version: ${db.version}`)
    }

    request.onsuccess = function(e){
        db = e.target.result
        console.log(`success is called database name: ${db.name} version: ${db.version}`)
    }

    request.onerror = function(e){
        console.log(`error: ${e.target.error}`)
    }
}
