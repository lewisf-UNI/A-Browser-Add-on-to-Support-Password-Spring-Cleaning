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
        console.log("[IDB] Transaction Complete")
    }
    transaction.onerror = function(event) {
        console.log("[IDB] error")
    }

    var objectStore = transaction.objectStore("extension_settings")
    var objectStoreRequest = objectStore.getAll()
    objectStoreRequest.onsuccess = function(event) {
        var data = objectStoreRequest.result
        if(data[0].consent === "true") {
            console.log("CONSENT GIVEN")
            runExtension()
        } else {
            console.log("CONSENT NOT GIVEN")
        }
        console.log("[IDB] Request Successful")  //TODO - Change error message to something more meaningful
    }
}
IDBrequest.onerror = function(event) {
    console.log("somethings wrong") //TODO - Change error message to something more meaningful
}

function getData() {
    if(db === null) {
        console.log("somethings wrong") //TODO - Change error message to something more meaningful
    } else {
        return new Promise((resolve, reject) => {
            var transaction = db.transaction(["blacklist"], "readonly")

            transaction.oncomplete = function(event) {
                console.log("[IDB] Transaction Complete")
            }
            transaction.onerror = function(event) {
                reject("[IDB] error: somethings wrong") //TODO - Change error message to something more meaningful
            }

            var objectStore = transaction.objectStore("blacklist")
            var getAllRequest = objectStore.getAll()
            
            getAllRequest.onsuccess = function(event) {
                console.log("[IDB] Data Request Complete")
                resolve(getAllRequest.result)
            }
            getAllRequest.onerror = function(event) {
                reject("[IDB] error: somethings wrong") //TODO - Change error message to something more meaningful
            }
        })
    }
}

function addData(data) {
    var transaction = db.transaction(["blacklist"], "readwrite")
    transaction.oncomplete = function(event){
        console.log("Transaction completed")  //TODO - Change error message to something more meaningful
    }
    transaction.onerror = function(event){
        console.log("somethings wrong") //TODO - Change error message to something more meaningful
    }

    var objectStore = transaction.objectStore("blacklist")
    var objectStoreRequest = objectStore.add(data)
    objectStoreRequest.onsuccess = function(event) {
        console.log("Request successful")  //TODO - Change error message to something more meaningful
    }
}