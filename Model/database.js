var db = null; 

// makes a request to open the database when this JavaScript file is first loaded
const IDBrequest = indexedDB.open("historyItems", 1)

// initialises the database if not done already, mainly used for catching errors if somehow the request was made and the database didn't exist.
// if the database exists then this will be skipped over.
IDBrequest.onupgradeneeded = function(event) {
    db = IDBrequest.result
    db.createObjectStore("blacklist", {keyPath: "domain"})
    db.createObjectStore("extension_settings", {keyPath: "id"})
}
// if database request was successfull, checks for consent in the 'extension_settings' DB to see if the logic of the extension can be run.
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
    // calls the getAll function on the object store which gets all of the entries within. 
    var objectStoreRequest = objectStore.getAll()
    objectStoreRequest.onsuccess = function(event) {
        var data = objectStoreRequest.result
        // if there is no data in the data settings then run the initSettings and after run the rest of the extension.
        if(!data.length) {
            initSettings(db, () =>  {
                runExtension()
            })
        // since there is only ever one entry in the 'extension_settings' object store, just checks the consent value of the first entry.
        // if it is true then the extension can be run. 
        } else if(data[0].consent === "true") {
            runExtension()
        } 
        console.log("[IDB] Request Successful: Checking consent")  
    }
}
IDBrequest.onerror = function(event) {
    console.log(`[IDB] ${event.target.error}`) 
}

/**
 * 
 * @description - Makes a call to the IndexedDB database and gets the data from the blacklist object store. This is a list of all domains the user has previously deleted from the extension.
 * This data is then sent back to the function that called the getData function and is used to determine which domains should no longer be shown on the extension. 
 * @returns {Promise} - Since the call to the IndexedDB database is asynchronus, it returns a Promise which represent the completion or failure of this operation. If the promise completes
 * successfully, it will resolve with the data from the database. If an error occurs, then the promise will reject with that error.
 */
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
                // if successfull then this promise will resolve with the result of the getAll request which is just all of the entrys in the object the getAll was requested on.
                resolve(getAllRequest.result)
            }
            getAllRequest.onerror = function(event) {
                reject(`[IDB] ${event.target.error}`) 
            }
        })
    }
}

/**
 * 
 * @param {Object} data - Object consisting only of a domain name.
 * @description - Makes a request to open the blacklist object store and, once successfull, adds the data into the object store. 
 */
function addData(data) {
    var transaction = db.transaction(["blacklist"], "readwrite")
    transaction.oncomplete = function(event){
        console.log("[IDB] Transaction Complete: Data added successfully")  
    }
    transaction.onerror = function(event){
        console.log(`[IDB] ${event.target.error}`) 
    }

    var objectStore = transaction.objectStore("blacklist")
    // *.add function just adds an object to the object store.
    var objectStoreRequest = objectStore.add(data)
    objectStoreRequest.onsuccess = function(event) {
        console.log("[IDB] Request Successful: Adding data to DB")  
    }
    objectStoreRequest.onerror = function(event) {
        console.log(`[IDB] ${event.target.error}`)
    }
}

/**
 * 
 * @param {IDBRequest} db - Request to open the database. This is passed in so the database does not have to be opened again. 
 * @description - Initialises the 'extension_settings' object store with default values. This is used for consent to comply with my ethics application. 
 */
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
        // callbacks utilised as the IndexedDB database request all run asynchronusly
        if(callback) {
            callback()
        }
    }
}