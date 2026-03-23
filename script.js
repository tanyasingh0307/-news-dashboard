async function fetchNews() {
    const query = document.getElementById("searchInput").value || "india";

    const url = `https://newsdata.io/api/1/latest?apikey=pub_b101a058a0144a5a87e3cd56514b8ff3&q=${query}&language=en`;

    const container = document.getElementById("news-container");
    container.innerHTML = "<h2 style='text-align:center;'>⏳ Loading...</h2>";

    try {
        const response = await fetch(url);
        const data = await response.json();

        console.log(data); // Debug

        if (!data.results || data.results.length === 0) {
            container.innerHTML = "<h2>No news found</h2>";
            return;
        }

        container.innerHTML = "";

        data.results.slice(0, 6).forEach(news => {
            const card = document.createElement("div");
            card.className = "news-card";

            card.innerHTML = `
                ${news.image_url ? `<img src="${news.image_url}" />` : ""}
                <h3>${news.title}</h3>
                <p><strong>Source:</strong> ${news.source_id}</p>
                <a href="${news.link}" target="_blank">Read More →</a>
            `;

            container.appendChild(card);
        });

    } catch (error) {
        console.error(error);
        container.innerHTML = "<h2 style='color:red;'>❌ Error fetching news</h2>";
    }
}