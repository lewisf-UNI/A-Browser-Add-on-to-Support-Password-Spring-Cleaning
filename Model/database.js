var db = null; 

function viewDB() {

    // checks to see if database exists before making a connection
    // TODO - there may be a problem with creating the database after which could throw an error, check after creating db if it exists 
    if(!db) {
        createDB()
    }
    const tx = db.transaction("history_items", "readonly")
    const hItems = tx.objectStore("history_items")
    const request = hItems.openCursor()

    request.onsuccess = function(e) {
        const cursor = e.target.result

                // take item from the db and put it into an array
                if (cursor) {
                    alert(`Title: ${cursor.key} Text: ${cursor.value.text} `)
                    //do something with the cursor
                    cursor.continue()
                }
    }

    request.onerror = function(e) {
        console.log(`somethings wrong: ${e.target.error}`)
    }
}

// data may be an array of objects so will need to add a forEach when adding items to the database
// also check if data is empty
function addToDB(data) {
    if(!db) {
        createDB()
    }
    const tx = db.transaction("history_items", "readandwrite")
    tx.onerror = function(e) {
        console.log(`somethings wrong: ${e.trarget.error}`)
    }
    const hItems = tx.objectStore("history_items")
    hItems.add(data)
}


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
        console.log(`somethings wrong: ${e.target.error}`)
    }
}