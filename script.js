document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".travel-form");
  const loadingMessage = document.getElementById("loading-message");
  const travelPlanContainer = document.getElementById("travel-plan-container");
  const interestButtons = document.querySelectorAll(".interest-button");
  const selectedInterestsInput = document.getElementById("selected-interests");
  const weatherCard = document.getElementById("weather-card");

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

  function displayWeather(weatherData) {
    const h3 = `Current Weather at ${destination}`;
    weatherCard.innerHTML = `
      <h3>${h3}</h3>
      <div class="weather-info">
        <div class="weather-detail">
          <span>Temperature</span>
          ${Math.round(weatherData.main.temp)}°C
        </div>
        <div class="weather-detail">
          <span>Condition</span>
          ${weatherData.weather[0].description}
        </div>
        <div class="weather-detail">
          <span>Humidity</span>
          ${weatherData.main.humidity}%
        </div>
        <div class="weather-detail">
          <span>Wind Speed</span>
          ${weatherData.wind.speed} m/s
        </div>
      </div>
    `;
    weatherCard.style.display = "block";
    weatherCard.classList.add("visible");
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    loadingMessage.style.display = "block";
    travelPlanContainer.innerHTML = "";
    travelPlanContainer.classList.remove("visible");
    weatherCard.style.display = "none";
    weatherCard.classList.remove("visible");

    const destination = document.getElementById("destination").value.trim();
    const from = document.getElementById("from").value.trim();
    const duration = document.getElementById("duration").value.trim();
    const budget = document.getElementById("budget").value.trim();
    const interests = selectedInterestsInput.value.trim();
    const specialRequirements = document
      .getElementById("special-requirements")
      .value.trim();

    if (!destination || !from || !duration || !budget) {
      alert("Please fill in all required fields.");
      loadingMessage.style.display = "none";
      return;
    }

    // OpenWeather API
    const weatherApiKey = "cbfae166ed8241a12093367b15d4b392";
    const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${destination}&units=metric&appid=${weatherApiKey}`;

    let weatherInfo = "";

    try {
      const weatherResponse = await fetch(weatherApiUrl);
      if (!weatherResponse.ok) throw new Error("Weather data not found.");
      const weatherData = await weatherResponse.json();

      // Display weather card
      displayWeather(weatherData);

      weatherInfo = `The current weather in ${destination} is ${Math.round(
        weatherData.main.temp
      )}°C with ${weatherData.weather[0].description}. Humidity is ${
        weatherData.main.humidity
      }%, and the wind speed is ${weatherData.wind.speed} m/s.`;

      console.log("Weather Data:", weatherData);
    } catch (error) {
      console.error("Error fetching weather:", error);
      weatherInfo = "Weather data unavailable.";
      weatherCard.style.display = "none";
    }

    // Generate AI Travel Itinerary (Gemini API)
    const prompt = `Generate a personalized travel itinerary for travelers travelling from ${from} to ${destination} for ${duration} days. 
    The budget per person is ${budget} INR. Preferences include: ${
      interests || "None"
    }. 
    Special requirements: ${
      specialRequirements || "None"
    }.Mention proper transportation.  
      Format the results in HTML for dark mode with proper line gaps.`;

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
        throw new Error(
          `API request failed: ${
            errorData.error?.message || response.statusText
          }`
        );
      }

      const data = await response.json();
      console.log("Full API Response:", data);

      loadingMessage.style.display = "none";
      travelPlanContainer.classList.add("visible");

      if (
        data.candidates &&
        data.candidates.length > 0 &&
        data.candidates[0].content &&
        data.candidates[0].content.parts &&
        data.candidates[0].content.parts.length > 0
      ) {
        const sanitizedOutput = data.candidates[0].content.parts[0].text || "";
        travelPlanContainer.innerHTML = `<div class='travel-plan-content'>${sanitizedOutput}</div>`;
      } else {
        console.error("Unexpected API response structure:", data);
        travelPlanContainer.innerHTML =
          "<p>Sorry, we couldn't generate a travel plan at this time. Please try again.</p>";
      }
    } catch (error) {
      console.error("Error fetching travel plan:", error);
      travelPlanContainer.innerHTML = `<p>An error occurred: ${error.message}. Please try again later.</p>`;
      loadingMessage.style.display = "none";
    }
  });
});
