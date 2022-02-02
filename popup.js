var domains = [] 

// when HTML page is fully loaded, the function is fired
document.addEventListener('DOMContentLoaded', function() {

    // use the chrome.history API to search the users history 
    chrome.history.search({text: '', maxResults: 10000}, function(data) {

        var count = 0

        data.forEach(function(page) {

            let domain = (new URL(`${page.url}`))

            if (domains.includes(`${domain.hostname}`)) {
                return true 
            } else {
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

                domains.push(`${domain.hostname}`)
            }

            // add link to the page url 
            /* 
            var a = document.createElement('a')
            a.href = `${page.url}`
            document.getElementById(`item-container-${count}`).appendChild(a)
            */
            count++
        })
    })
}, false)

