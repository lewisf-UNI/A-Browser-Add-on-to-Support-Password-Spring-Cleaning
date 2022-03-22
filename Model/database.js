var db = null; 
const IDBrequest = indexedDB.open("historyItems", 1)

IDBrequest.onupgradeneeded = function(event) {
    db = IDBrequest.result
    db.createObjectStore("blacklist", {keyPath: "domain"})
    db.createObjectStore("extension_settings", {keyPath: "id"})
}
IDBrequest.onsuccess = function(event) {
    db = IDBrequest.result
    var transaction = db.transaction(["extension_settings"], "readwrite")
    transaction.oncomplete = function(event) {
        console.log("[IDB] Transaction Complete: Consent checked succesfully")
    }
    transaction.onerror = function(event) {
        console.log(`[IDB] ${event.target.error}`)
    }

    var objectStore = transaction.objectStore("extension_settings")
    var objectStoreRequest = objectStore.getAll()
    objectStoreRequest.onsuccess = function(event) {
        var data = objectStoreRequest.result
        if(!data.length) {
            initSettings(db, () =>  {
                runExtension()
            })
        } else if(data[0].consent === "true") {
            runExtension()
        } 
        console.log("[IDB] Request Successful: Checking consent")  
    }
}
IDBrequest.onerror = function(event) {
    console.log(`[IDB] ${event.target.error}`) 
}

function getData() {
    if(db === null) {
        console.log("[IDB] Error: Database not Initialised")
    } else {
        return new Promise((resolve, reject) => {
            var transaction = db.transaction(["blacklist"], "readonly")

            transaction.oncomplete = function(event) {
                console.log("[IDB] Transaction Complete: Data got from the DB")
            }
            transaction.onerror = function(event) {
                reject(`[IDB] ${event.target.error}`) 
            }

            var objectStore = transaction.objectStore("blacklist")
            var getAllRequest = objectStore.getAll()
            
            getAllRequest.onsuccess = function(event) {
                console.log("[IDB] Data Request Complete: Getting data from DB")
                resolve(getAllRequest.result)
            }
            getAllRequest.onerror = function(event) {
                reject(`[IDB] ${event.target.error}`) 
            }
        })
    }
}

function addData(data) {
    var transaction = db.transaction(["blacklist"], "readwrite")
    transaction.oncomplete = function(event){
        console.log("[IDB] Transaction Complete: Data added successfully")  //TODO - Change error message to something more meaningful
    }
    transaction.onerror = function(event){
        console.log(`[IDB] ${event.target.error}`) 
    }

    var objectStore = transaction.objectStore("blacklist")
    var objectStoreRequest = objectStore.add(data)
    objectStoreRequest.onsuccess = function(event) {
        console.log("[IDB] Request Successful: Adding data to DB")  //TODO - Change error message to something more meaningful
    }
}

function initSettings(db, callback) {
    var transaction = db.transaction(["extension_settings"], "readwrite")
    transaction.oncomplete = function(event) {
        console.log("[IDB] Transaction Complete: Settings Initialised")
    }
    transaction.onerror = function(event) {
        console.log(`[IDB] ${event.target.error}`)
    }

    var objectStore = transaction.objectStore("extension_settings")
    var objectStoreRequest = objectStore.add({ id: "1", consent: "true"})
    objectStoreRequest.onsuccess = function(event) {
        console.log("[IDB] Request Successful: Updating settings") 
        if(callback) {
            callback()
        }
    }
}