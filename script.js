// Add click handlers for interest buttons
document.querySelectorAll(".interest-button").forEach((button) => {
  button.addEventListener("click", function (e) {
    e.preventDefault(); // Prevent form submission
    this.classList.toggle("active");

    // Update hidden input with selected interests
    const selectedButtons = document.querySelectorAll(
      ".interest-button.active"
    );
    const selectedInterests = Array.from(selectedButtons).map(
      (btn) => btn.dataset.interest
    );
    document.getElementById("selected-interests").value =
      selectedInterests.join(",");
  });
});
