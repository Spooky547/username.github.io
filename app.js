document.addEventListener("DOMContentLoaded", function () {
    // Fetch token information from the contract
    fetch("/api/token-info")
        .then(response => response.json())
        .then(data => updateTokenInfo(data))
        .catch(error => console.error("Error fetching token information:", error));

    function updateTokenInfo(data) {
        document.getElementById("totalSupply").textContent = `Total Supply: ${data.totalSupply}`;
        document.getElementById("circulatingSupply").textContent = `Circulating Supply: ${data.circulatingSupply}`;
        document.getElementById("lockedTokens").textContent = `Locked Tokens: ${data.lockedTokens}`;
    }

    // Handle scam report form submission
    document.getElementById("scamReportForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const scamAddress = document.getElementById("scamAddress").value;

        // Send scam report to the backend
        fetch("/api/report-scam", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ scamAddress })
        })
            .then(response => response.json())
            .then(data => {
                document.getElementById("reportStatus").textContent = data.message;
                document.getElementById("scamReportForm").reset();
            })
            .catch(error => console.error("Error reporting scam:", error));
    });
});
