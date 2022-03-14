document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('nav1').addEventListener("click", function() {
        window.location.href = "/View/popup.html"
    })
    document.getElementById("ncsc-button").addEventListener("click", function() {
        window.open("https://www.ncsc.gov.uk/collection/top-tips-for-staying-secure-online/password-managers")
    })
})

