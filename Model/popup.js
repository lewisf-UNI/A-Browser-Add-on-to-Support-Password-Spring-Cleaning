var domains = []
var no_of_results = 25
var pages = [{}]
const keywords = ['login', 'username', 'uname', 'password', 'pword', 'auth', 'authenticate', 'register', 'signup']

function sortHistory(data) {
    let recentLogins = [{}]

    // let ts = [{}]

    if(!Array.isArray(data) || !data.length) {
        console.log("no history objects exist")
        return true 
    } else {

        data.forEach(function(page) {

            let domain = (new URL(`${page.url}`))

            // if(topSites.includes(domain.hostname) && !domains.includes(domain.hostname)) {
            //     ts.push({
            //         domain: `${domain.hostname}`,
            //         last_visit: `${page.lastVisitTime}`,
            //         visit_count: `${page.visitCount}`
            //     })
            //     domains.push(domain.hostname)
            // }

            if(checkForLoginPage(page) && !domains.includes(domain.hostname)) {
                recentLogins.push({
                    domain: `${domain.hostname}`,
                    last_visit: `${page.lastVisitTime}`,
                    visit_count: `${page.visitCount}`
                })
                domains.push(domain.hostname)
            } else if(!domains.includes(domain.hostname)) {
                pages.push({
                    domain: `${domain.hostname}`,
                    last_visit: `${page.lastVisitTime}`,
                    visit_count: `${page.visitCount}`
                })
                domains.push(domain.hostname)
            }
        })
        
        pages.sort(function(a, b) {
            return (parseFloat(b.visit_count) - parseFloat(a.visit_count))
        })

        let TEMP = []
        let TEMP_RESULTS = [{}]
        getData()
        .then((DBData) => {
            DBData.forEach((d) => {
                TEMP.push(d.domain)
            })
            
            for(i = 0; i < recentLogins.length; i++) {
                if(!isEmpty(recentLogins[i])) {
                    if(!TEMP.includes(recentLogins[i].domain)) {
                        TEMP_RESULTS.push(recentLogins[i])
                    }
                }
            }

            TEMP_RESULTS = TEMP_RESULTS.filter(value => Object.keys(value).length !== 0)
            if(TEMP_RESULTS.length) {
                addRecentLogins(TEMP_RESULTS)
            }

            TEMP_RESULTS = [{}]
            for(i = 0; i < pages.length; i++) {
                if(!isEmpty(pages[i])) {
                    if(!TEMP.includes(pages[i].domain)) {
                        TEMP_RESULTS.push(pages[i])
                    }
                }
            }
            pages = TEMP_RESULTS.filter(value => Object.keys(value).length !== 0)
            if(pages.length) {
                let RESULTS = pages.slice(0, no_of_results)
                addHistoryToExtension(RESULTS) 
            }
        }).catch(err => { console.log(err) })
    }
}

function addRecentLogins(recentLogins) {

    let count = 0; 
    const header = document.createElement('h1')
    header.className = "history-header"
    header.appendChild(document.createTextNode("Recent Logins"))
    document.getElementById("items").appendChild(header)

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

            const div = document.createElement('div')
            div.textContent = lastVisit.toLocaleString()
            document.getElementById(`login-container-${count}`).appendChild(div)
            div.className = "last-visit"

            const div2 = document.createElement('div')
            div2.textContent = page.domain
            document.getElementById(`login-container-${count}`).appendChild(div2)
            div2.className = "domain"

            const btn = document.createElement('button')
            btn.className = "btn"
            btn.appendChild(document.createTextNode("-->"))
            btn.addEventListener("click", function() {
                window.open(`http://${page.domain}`)
            }) 
            document.getElementById(`login-container-${count}`).appendChild(btn)     

            const btn2 = document.createElement('button')
            btn2.className = "btn"
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

function addHistoryToExtension(results) {
    /*
    if this is the first instance of the domain showing in the users history, 
    extract information from the HistoryItem using the google API 
    and append this information onto the HTML page
    */
    if(no_of_results === 25) {
        var count = 0
        const header = document.createElement('h1')
        header.className = "history-header"
        header.appendChild(document.createTextNode("Frequently Used Sites"))
        document.getElementById("items").appendChild(header)
    } else {
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
            btn.appendChild(document.createTextNode("-->"))
            btn.addEventListener("click", function() {
                window.open(`http://${page.domain}`)
            }) 
            document.getElementById(`item-container-${count}`).appendChild(btn)     

            const btn2 = document.createElement('button')
            btn2.className = "btn"
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

// function getTopSites() {
//     chrome.topSites.get(function(sites) {
//         sites.forEach(function(page) {
//             let domain = (new URL(page.url))
//             if(!data.includes(domain.hostname) && !domains.includes(domain.hostname)) {
//                 data.push(domain.hostname)
//             }
//         }) 
//     })
// }

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}