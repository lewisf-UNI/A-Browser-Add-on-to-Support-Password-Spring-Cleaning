// array of domain names fetched from the users history
var domains = [] 

// when HTML page is fully loaded, the function is fired
document.addEventListener('DOMContentLoaded', function() {

    // use the chrome.history API to search the users history and return HistoryItems 
    chrome.history.search({text: '', maxResults: 500}, function(data) {

        var count = 0

        // cycles through each HistoryItem fetched by chrome.history.search
        data.forEach(function(page) {

            /*
            create a URL object using the URL from the HistoryItem,
            .hostname will return the domain name of the URL.
            */
            let domain = (new URL(`${page.url}`))
            if (domains.includes(`${domain.hostname}`)) {
                // breaks if the domain name has already shown up in the users history 
                return true 
            } else {
                /*
                if this is the first instance of the domain showing in the users history, 
                extract information from the HistoryItem using the google API 
                and append this information onto the HTML page
                */
                const itemContainer = document.createElement('div')
                itemContainer.className = "item-container"
                itemContainer.id = `item-container-${count}`
                document.getElementById("items").appendChild(itemContainer)

                let time = Math.floor(`${page.lastVisitTime}`)
                let lastVisit = new Date(time)

                const div = document.createElement('div')
                div.textContent = lastVisit.toLocaleString()
                document.getElementById(`item-container-${count}`).appendChild(div)
                div.id = "last-visit"

                const div2 = document.createElement('div')
                div2.textContent = domain.hostname
                document.getElementById(`item-container-${count}`).appendChild(div2)
                div2.id = "domain"

                // add domain to the domains array 
                domains.push(`${domain.hostname}`)
            } 

            // add link to the page url -- TODO
            /* 
            var a = document.createElement('a')
            a.href = `${page.url}`
            document.getElementById(`item-container-${count}`).appendChild(a)
            */
            count++
        })
    })
}, false)

