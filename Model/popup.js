// global variables used to hold information about the data got from the users history.
var domains = []
var pages = [{}]
// integer which is used when adding the load more button.  
var no_of_results = 25
// list of keywords that are used to check for login/signup pages. 
const keywords = ['login', 'username', 'uname', 'password', 'pword', 'auth', 'authenticate', 'register', 'signup']

/**
 * 
 * @param {HistoryItem[]} data - Array of HistoryItem objects are passed in as a parameter to this function. HistoryItems objects are what is returned from the chrome.history.search call
 * and each of them contain information about an item within the users' browsing history.  
 * @description - Takes in an array of HistoryItems which hold information about the users browsing history. Of this information, my extension only requires the URL of the page visited, 
 * the visitCount which indicates how many times the user has navigated to this page, and the lastVisitTime which indicates the last time, in milliseconds since the epoch, 
 * the user visted this page. Since this is the only inforamtion that is required, this function extracts this from the HistoryItem objects. 
 * @returns {Object[]} - Once this function has extracted the neccessary data from the HistoryItem objects, it inserts it into new objects and passes it as a parameter to the 
 * 'addRecentLogins' and 'addHistoryToExtension' functions which appends the data to the HTML page.
 */
function sortHistory(data) {
    var recentLogins = [{}]
    var URLs = []
    // checks to see if the users history is empty and if so, returns the function. 
    if(!Array.isArray(data) || !data.length) {

        console.log("Error: no history objects exist")
        return true 

    } else {

        var rlDomains = [] 

        // cycles through each of the objects in the HistoryItems array
        // checks each object to see if it is a login page and also keeps note of domains that have shown up to prevent duplicates in the extension
        data.forEach(function(page) {

            let domain = (new URL(`${page.url}`))

            if(checkForLoginPage(page) && !rlDomains.includes(domain.hostname)) {
                recentLogins.push({
                    domain: `${domain.hostname}`,
                    last_visit: `${page.lastVisitTime}`
                })
                rlDomains.push(domain.hostname)
            }

            if(!domains.includes(domain.hostname)) {
                pages.push({
                    domain: `${domain.hostname}`,
                    last_visit: `${page.lastVisitTime}`,
                    visit_count: `${page.visitCount}`
                })
                domains.push(domain.hostname)

                // latter condition in else if added to improve load times
                // only checks the websites that have been visited 3 or more times significantly reducing the amount of websites it checks making the algorithm complete faster
                // can do this because websites that have been visited less than 3 times are unlikely to have any significnace to the user  
            } else if(!URLs.includes(domain) && page.visitCount >= 3) { 
                for(i = 0; i < pages.length; i++) {
                    if(pages[i].domain == domain.hostname) {
                        if(parseInt(pages[i].visit_count) < page.visitCount){
                            pages[i].visit_count = page.visitCount 
                        }
                    }
                }
                URLs.push(domain)
            }
        })
        
        // sorts the data to be appended onto the HTML page in order of visit count which is the total amount of times the 
        pages.sort(function(a, b) {
            return (parseFloat(b.visit_count) - parseFloat(a.visit_count))
        })

        let TEMPDomains = [] // temporary array to store domain names
        let TEMPResults = [{}] // temporary array to store objects to be appended to the HTML page

        // call to getData function in database.js
        getData()
        .then((DBData) => {
            DBData.forEach((d) => {
                TEMPDomains.push(d.domain)
            })
            
            // adds the recent logins to the HTML page once the blacklisted domains from the database have been removed. 
            for(i = 0; i < recentLogins.length; i++) {
                if(!isEmpty(recentLogins[i])) {
                    if(!TEMPDomains.includes(recentLogins[i].domain) && recentLogins[i].domain) {
                        TEMPResults.push(recentLogins[i])
                    }
                }
            }
            TEMPResults = TEMPResults.filter(value => !isEmpty(value))
            if(TEMPResults.length) {
                // calls function which adds the data to the page 
                if(TEMPResults.length > 15) { // limits the amount of logins shown on the page to 15 
                    TEMPResults = TEMPResults.splice(0,15)
                    addRecentLogins(TEMPResults)
                } else {
                    addRecentLogins(TEMPResults)
                }
            }

            // adds the rest of the history to the HTML page once the blacklisted domains from the database have been removed. 
            TEMPResults = [{}]
            for(i = 0; i < pages.length; i++) {
                if(!isEmpty(pages[i])) {
                    if(!TEMPDomains.includes(pages[i].domain) && pages[i].domain) {
                        TEMPResults.push(pages[i])
                    }
                }
            }
            pages = TEMPResults.filter(value => !isEmpty(value))
            if(pages.length) {
                let RESULTS = pages.slice(0, no_of_results)
                addHistoryToExtension(RESULTS) 
            }
        }).catch(err => { console.log(err) })
    }
}

/**
 * 
 * @param {Object[]} recentLogins - Each recentLogin object contains the page domain and a last visit time. 
 * @description - Takes in a list of pages which are determined to be login/signup pages. These are passed to a seperate function than the other history as the makeup of the object is 
 * slightly different. Also, the way in which these are appended to the HTML page slightly differs from the rest of the history.
 */
function addRecentLogins(recentLogins) {

    // count used for creating unique ID's for the div elements.
    let count = 0; 
    // creates a header in the extension. 
    const header = document.createElement('h1')
    header.className = "history-header"
    header.appendChild(document.createTextNode("Recent Logins"))
    document.getElementById("items").appendChild(header)

    // goes through each of the objects in the data that has been provided as a parameter.
    // first checks if they are empty then appends them to the HTML page if they are not. 
    recentLogins.forEach(function(page) {
        if(isEmpty(page)) {
            return true
        } else {
            
            const itemContainer = document.createElement('div')
            itemContainer.className = "item-container"
            itemContainer.id = `login-container-${count}`
            document.getElementById("items").appendChild(itemContainer)

            let time = Math.floor(page.last_visit)
            let lastVisit = new Date(time)

            // adds the last visit date of the domain.
            const div = document.createElement('div')
            div.textContent = lastVisit.toLocaleString()
            document.getElementById(`login-container-${count}`).appendChild(div)
            div.className = "last-visit"

            // adds the domain name.
            const div2 = document.createElement('div')
            div2.textContent = page.domain
            document.getElementById(`login-container-${count}`).appendChild(div2)
            div2.className = "domain"

            // adds a button which goes to the site of the domain listed.
            const btn = document.createElement('button')
            btn.className = "btn"
            btn.title = "Go to Site"
            btn.appendChild(document.createTextNode("-->"))
            btn.addEventListener("click", function() {
                window.open(`http://${page.domain}`)
            }) 
            document.getElementById(`login-container-${count}`).appendChild(btn)     

            // adds a button which deletes the domain from the extension.
            const btn2 = document.createElement('button')
            btn2.className = "btn"
            btn2.title = "Delete from Extension"
            btn2.appendChild(document.createTextNode("X"))
            btn2.addEventListener("click", function(e) {
                e.preventDefault()
                var target = e.target.closest('div').id
                var node = { domain: document.getElementById(target).childNodes[1].textContent }
                addData(node)
                e.target.closest('div div').remove()
            })
            document.getElementById(`login-container-${count}`).appendChild(btn2)             
        }
    count++
    })
}

/**
 * 
 * @param {Object[]} results 
 * @description - Adds the rest of the domains the user has visited to the extension which have not been flagged as a signup/login page.
 */
function addHistoryToExtension(results) {
 
    // adds a header if it is the first time this function has been called.
    // since this function gets called again when the load more button is clicked this check is needed.
    if(no_of_results === 25) {
        var count = 0
        const header = document.createElement('h1')
        header.className = "history-header"
        header.appendChild(document.createTextNode("Frequently Used Sites"))
        document.getElementById("items").appendChild(header)
    } else {
        // if this function has been called from a click of the load more button, intialise the count for creating unique ID's for the div elements.
        var count = no_of_results-1
    } 

    results.forEach(function(page){

        if(isEmpty(page)) {
            return true
        } else {
            
            const itemContainer = document.createElement('div')
            itemContainer.className = "item-container"
            itemContainer.id = `item-container-${count}`
            document.getElementById("items").appendChild(itemContainer)

            let time = Math.floor(page.last_visit)
            let lastVisit = new Date(time)

            const div = document.createElement('div')
            div.textContent = lastVisit.toLocaleString()
            document.getElementById(`item-container-${count}`).appendChild(div)
            div.className = "last-visit"

            const div2 = document.createElement('div')
            div2.textContent = page.domain
            document.getElementById(`item-container-${count}`).appendChild(div2)
            div2.className = "domain"

            const btn = document.createElement('button')
            btn.className = "btn"
            btn.title = "Go to Site"
            btn.appendChild(document.createTextNode("-->"))
            btn.addEventListener("click", function() {
                window.open(`http://${page.domain}`)
            }) 
            document.getElementById(`item-container-${count}`).appendChild(btn)     

            const btn2 = document.createElement('button')
            btn2.className = "btn"
            btn2.title = "Delete from Extension"
            btn2.appendChild(document.createTextNode("X"))
            btn2.addEventListener("click", function(e) {
                e.preventDefault()
                var target = e.target.closest('div').id
                var node = { domain: document.getElementById(target).childNodes[1].textContent }
                addData(node)
                e.target.closest('div div').remove()
            })
            document.getElementById(`item-container-${count}`).appendChild(btn2)             
        }
    count++
    })

    // adds a load more button at the bottom of the page to stop all items loading in at once causing browser to lag 
    if(domains.length > no_of_results) {
        const loadMore = document.createElement('button')
        loadMore.className = "load-more-button"
        loadMore.appendChild(document.createTextNode("Load More"))
        loadMore.addEventListener("click", function(e) {
            e.preventDefault()
            e.target.remove()
            let RESULTS = pages.splice(no_of_results, 10)
            no_of_results += 10
            addHistoryToExtension(RESULTS)
        })
        document.getElementById("items").appendChild(loadMore)
    }
}

/**
 * 
 * @param {HistoryItem} page 
 * @description - Takes in a HistoryItem object and determines wether or not the page was a login or signup page to a website. This is done by examining the URL and trying to identify set
 * keywords within it. The keywords are stored in an array which is a global variable. 
 * @returns {boolean} - Returns a boolean corresponding to wether or not a page is a login/signup page.
 */
function checkForLoginPage(page) {
    let s = page.url
    for(i = 0; i < keywords.length; i++) {
        if((s.toLowerCase()).includes(keywords[i])) {
            return true
        } else {
            return false
        }
    }
}

/**
 * 
 * @param {Object} obj
 * @description - Checks if an object is empty.   
 * @returns {boolean} - Returns a boolean corresponding to wether or not the object is empty.
 */
function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}