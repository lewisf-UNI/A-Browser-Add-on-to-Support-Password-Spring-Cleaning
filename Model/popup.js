var domains = []
const keywords = ['login', 'username', 'uname', 'password', 'pword', 'auth', 'authenticate', 'register', 'signup']

function sortHistory(data) {
    let pages = [{}]
    let recentLogins = [{}]
    let ts = [{}]
    if(!Array.isArray(data) || !data.length) {
        console.log("no history objects exist")
        return true 
    } else {
        let topSites = []
        topSites = getTopSites()

        data.forEach(function(page) {

            let domain = (new URL(`${page.url}`))

            if(checkForLoginPage(page) && !domains.includes(`${domain.hostname}`)) {
                recentLogins.push({
                    domain: `${domain.hostname}`,
                    last_visit: `${page.lastVisitTime}`,
                    visit_count: `${page.visitCount}`
                })
                domains.push(`${domain.hostname}`)
            } else if(topSites.includes(domain.hostname) && !domains.includes(domain.hostname)) {
                ts.push({
                    domain: `${domain.hostname}`,
                    last_visit: `${page.lastVisitTime}`,
                    visit_count: `${page.visitCount}`
                })
            } else if(!domains.includes(`${domain.hostname}`)) {
                pages.push({
                    domain: `${domain.hostname}`,
                    last_visit: `${page.lastVisitTime}`,
                    visit_count: `${page.visitCount}`
                })

                domains.push(`${domain.hostname}`)
            }
        })

        pages.sort(function(a, b) {
            return (parseFloat(b.visit_count) - parseFloat(a.visit_count))
        })
        addHistoryToExtension(recentLogins.concat(ts, pages))
    }
}

function addHistoryToExtension(pages) {
    /*
    if this is the first instance of the domain showing in the users history, 
    extract information from the HistoryItem using the google API 
    and append this information onto the HTML page
    */
    let count = 0 

    pages.forEach(function(page){

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
            div.id = "last-visit"

            const div2 = document.createElement('div')
            div2.textContent = page.domain
            document.getElementById(`item-container-${count}`).appendChild(div2)
            div2.id = "domain"

            const btn = document.createElement('button')
            btn.id = "yes"
            btn.addEventListener("click", function() {
                window.open(`http://${page.domain}`)
            }) 
            document.getElementById(`item-container-${count}`).appendChild(btn)     

            const btn2 = document.createElement('button')
            btn2.id = "no"
            document.getElementById(`item-container-${count}`).appendChild(btn2)             
        }
    count++
    })
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

function getTopSites() {
    let data = []
    chrome.topSites.get(function(sites) {
        sites.forEach(function(page) {
            let domain = (new URL(page.url))
            if(!data.includes(domain.hostname) && !domains.includes(domain.hostname)) {
                data.push(domain.hostname)
            }
        }) 
    })
    return data
}

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}



