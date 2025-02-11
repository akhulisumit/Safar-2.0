document.addEventListener("DOMContentLoaded", () => {
    // 🌍 Backend URL (Render)
    const BACKEND_URL = "https://safar-2-0-backend.onrender.com";
  
    // 🌍 DOM Elements
    const form = document.querySelector(".travel-form");
    const loadingMessage = document.getElementById("loading-message");
    const travelPlanContainer = document.getElementById("travel-plan-container");
    const interestButtons = document.querySelectorAll(".interest-button");
    const selectedInterestsInput = document.getElementById("selected-interests");
    const weatherCard = document.getElementById("weather-card");
    const imageContainer = document.getElementById("destination-image");
  
    // ✅ Handle Interest Button Selection
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
  
    // ✅ Fetch & Display Weather Information
    async function fetchWeather(destination) {
      try {
        const response = await fetch(`${BACKEND_URL}/api/weather?destination=${destination}`);
        if (!response.ok) throw new Error("Weather data not found.");
        const weatherData = await response.json();
  
        displayWeather(weatherData, destination);
      } catch (error) {
        console.error("Error fetching weather:", error);
        weatherCard.style.display = "none";
      }
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
  
    // ✅ Fetch & Display Destination Images
    async function fetchDestinationImages(destination) {
      try {
        const response = await fetch(`${BACKEND_URL}/api/images?destination=${destination}`);
        if (!response.ok) throw new Error("Failed to fetch images");
        const data = await response.json();
  
        if (data.results.length > 0) {
          imageContainer.innerHTML = data.results
            .map((img) => `<img src="${img.urls.regular}" alt="${destination}" class="destination-img">`)
            .join("");
        } else {
          imageContainer.innerHTML = `<p>No images available for ${destination}</p>`;
        }
      } catch (error) {
        console.error("Error fetching destination images:", error);
        imageContainer.innerHTML = `<p>Image not available</p>`;
      }
    }
  
    // ✅ Generate AI-Based Travel Plan using Gemini API
    async function generateTravelPlan(from, destination, duration, budget, interests, specialRequirements) {
      try {
        const response = await fetch(`${BACKEND_URL}/api/generate-plan`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ from, destination, duration, budget, interests, specialRequirements }),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`API request failed: ${errorData.error?.message || response.statusText}`);
        }
  
        const data = await response.json();
        displayTravelPlan(data);
      } catch (error) {
        console.error("Error fetching travel plan:", error);
        travelPlanContainer.innerHTML = `<p>An error occurred: ${error.message}. Please try again later.</p>`;
        loadingMessage.style.display = "none";
      }
    }
  
    function displayTravelPlan(data) {
      loadingMessage.style.display = "none";
      travelPlanContainer.classList.add("visible");
  
      if (data.candidates?.length > 0 && data.candidates[0].content?.parts?.length > 0) {
        let sanitizedOutput = data.candidates[0].content.parts[0].text || "";
        sanitizedOutput = sanitizedOutput.replace(/```html|```/g, "").trim();
  
        travelPlanContainer.innerHTML = `<div class='travel-plan-content'>${sanitizedOutput}</div>`;
      } else {
        travelPlanContainer.innerHTML = "<p>Sorry, we couldn't generate a travel plan at this time. Please try again.</p>";
      }
    }
  
    // ✅ Handle Form Submission
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
  
      loadingMessage.style.display = "flex";
      travelPlanContainer.innerHTML = "";
      travelPlanContainer.classList.remove("visible");
      weatherCard.style.display = "none";
      weatherCard.classList.remove("visible");
      imageContainer.innerHTML = "";
  
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
  
      await fetchWeather(destination);
      await generateTravelPlan(from, destination, duration, budget, interests, specialRequirements);
      await fetchDestinationImages(destination);
    });
  });
  
  // ✅ Hidden Easter Egg in Console
  window.whoMadeYou = function () {
    console.log("%c🔥 I was created by HellO! 🚀", "color: green; font-size: 16px; font-weight: bold;");
  };
  
  function whoMade(){
    console.log("Sumit");
  }
  