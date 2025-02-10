document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".travel-form");
  const loadingMessage = document.getElementById("loading-message");
  const travelPlanContainer = document.getElementById("travel-plan-container");
  const interestButtons = document.querySelectorAll(".interest-button");
  const selectedInterestsInput = document.getElementById("selected-interests");
  const weatherCard = document.getElementById("weather-card");
  const imageContainer = document.getElementById("destination-image");


  // Handle interest button selection
  interestButtons.forEach((button) => {
    button.addEventListener("click", () => {
      button.classList.toggle("active");
      updateSelectedInterests();
    });
  });

  function updateSelectedInterests() {
    const selected = Array.from(interestButtons)
      .filter((btn) => btn.classList.contains("active"))
      .map((btn) => btn.dataset.interest);
    selectedInterestsInput.value = selected.join(", ");
  }

  function displayWeather(weatherData, destination) {
    weatherCard.innerHTML = `
      <h3>Current Weather in ${destination}</h3>
      <div class="weather-info">
        <div class="weather-detail"><span>Condition:</span> ${weatherData.weather[0].description}</div>
        <div class="weather-detail"><span>Temperature:</span> ${Math.round(weatherData.main.temp)}°C</div>
        <div class="weather-detail"><span>Humidity:</span> ${weatherData.main.humidity}%</div>
        <div class="weather-detail"><span>Wind Speed:</span> ${weatherData.wind.speed} m/s</div>
      </div>
    `;
    weatherCard.style.display = "block";
    weatherCard.classList.add("visible");
  }
  
  

  async function fetchDestinationImages(destination) {
    const UNSPLASH_ACCESS_KEY = "VDe53wmJz2fr6bUtiu5UgDbgNNGrJNgn2SMdBAfGsWw"; // Use your actual Unsplash Access Key
    const unsplashUrl = `https://api.unsplash.com/search/photos?query=${destination}&client_id=${UNSPLASH_ACCESS_KEY}&per_page=12&orientation=landscape`; // Increase `per_page` to 10
  
    try {
      const response = await fetch(unsplashUrl);
      if (!response.ok) throw new Error("Failed to fetch images");
      const data = await response.json();
  
      if (data.results.length > 0) {
        imageContainer.innerHTML = data.results
          .map(
            (img) =>
              `<img src="${img.urls.regular}" alt="${destination}" class="destination-img">`
          )
          .join(""); // Display multiple images
      } else {
        imageContainer.innerHTML = `<p>No images available for ${destination}</p>`;
      }
    } catch (error) {
      console.error("Error fetching destination images:", error);
      imageContainer.innerHTML = `<p>Image not available</p>`;
    }
  }
  

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    loadingMessage.style.display = "flex";
    travelPlanContainer.innerHTML = "";
    travelPlanContainer.classList.remove("visible");
    weatherCard.style.display = "none";
    weatherCard.classList.remove("visible");
    imageContainer.innerHTML = ""; // Clear previous images

    const destination = document.getElementById("destination").value.trim();
    const from = document.getElementById("from").value.trim();
    const duration = document.getElementById("duration").value.trim();
    const budget = document.getElementById("budget").value.trim();
    const interests = selectedInterestsInput.value.trim();
    const specialRequirements = document.getElementById("special-requirements").value.trim();

    if (!destination || !from || !duration || !budget) {
      alert("Please fill in all required fields.");
      loadingMessage.style.display = "none";
      return;
    }

    await fetchDestinationImages(destination); // Fetch multiple images

    // OpenWeather API
    const weatherApiKey = "cbfae166ed8241a12093367b15d4b392";
    const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${destination}&units=metric&appid=${weatherApiKey}`;

    try {
      const weatherResponse = await fetch(weatherApiUrl);
      if (!weatherResponse.ok) throw new Error("Weather data not found.");
      const weatherData = await weatherResponse.json();

      // Display weather card
      displayWeather(weatherData, destination);

      console.log("Weather Data:", weatherData);
    } catch (error) {
      console.error("Error fetching weather:", error);
      weatherCard.style.display = "none";
    }

    // Generate AI Travel Itinerary (Gemini API)
    const prompt = `
Generate a structured travel itinerary for a trip from **${from}** to **${destination}** for **${duration} days**. 

- **Budget**: ${budget} INR per person  
- **Preferences**: ${interests || "None"}  
- **Special Requirements**: ${specialRequirements || "None"}  

**Format (Use HTML with Dark Mode Styling)**:  
- **Title**: "Travel Itinerary for ${destination}"  
- **Day-wise Plan** (Morning, Afternoon, Evening)  
- **Transportation & Stay Recommendations**  
- **Must-Try Food**  
- **Packing & Safety Tips**  

Return the response in **HTML format**.
`;

    const apiKey = "AIzaSyC56g30u8bjTqn4cHd5P1eolfe5iwHMc7E";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API request failed: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      console.log("Full API Response:", data);

      loadingMessage.style.display = "none";
      travelPlanContainer.classList.add("visible");

      if (data.candidates?.length > 0 && data.candidates[0].content?.parts?.length > 0) {
        let sanitizedOutput = data.candidates[0].content.parts[0].text || "";
        sanitizedOutput = sanitizedOutput.replace(/```html|```/g, "").trim();

        travelPlanContainer.innerHTML = `<div class='travel-plan-content'>${sanitizedOutput}</div>`;
      } else {
        travelPlanContainer.innerHTML = "<p>Sorry, we couldn't generate a travel plan at this time. Please try again.</p>";
      }
    } catch (error) {
      console.error("Error fetching travel plan:", error);
      travelPlanContainer.innerHTML = `<p>An error occurred: ${error.message}. Please try again later.</p>`;
      loadingMessage.style.display = "none";
    }
  });
});
