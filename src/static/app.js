document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const participantCount = details.participants.length;
        const spotsAvailable = details.max_participants - participantCount;

        let html = `
          <h4>${name}</h4>
          <p><strong>Description:</strong> ${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Available Spots:</strong> ${spotsAvailable} of ${details.max_participants}</p>
        `;

        // Add participants list
        if (details.participants.length > 0) {
          html += `
            <div class="participants-list">
              <h5>Participants (${details.participants.length})</h5>
              <ul>
                ${details.participants.map(email => `<li>${email}</li>`).join('')}
              </ul>
            </div>
          `;
        }

        activityCard.innerHTML = html;
        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activityName = document.getElementById("activity").value;
    const messageDiv = document.getElementById("message");

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activityName)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (response.ok) {
        messageDiv.className = "message success";
        messageDiv.textContent = data.message;
        messageDiv.classList.remove("hidden");
        signupForm.reset();
        fetchActivities(); // Reload activities to show updated participants
      } else {
        messageDiv.className = "message error";
        messageDiv.textContent = data.detail;
        messageDiv.classList.remove("hidden");
      }
    } catch (error) {
      console.error("Error signing up:", error);
      messageDiv.className = "message error";
      messageDiv.textContent = "An error occurred. Please try again.";
      messageDiv.classList.remove("hidden");
    }
  });

  // Load activities on page load
  fetchActivities();
});
