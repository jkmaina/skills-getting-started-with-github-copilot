document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const emailInput = document.getElementById("email");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const res = await fetch("/activities");
      const data = await res.json();
      renderActivities(data);
      populateSelect(data);
    } catch (err) {
      showMessage("error", "Failed to load activities.");
      console.error(err);
    }
  }

  function renderActivities(data) {
    activitiesList.innerHTML = "";
    if (!Object.keys(data).length) {
      activitiesList.innerHTML = "<p>No activities available.</p>";
      return;
    }

    Object.entries(data).forEach(([name, activity]) => {
      const card = document.createElement("div");
      card.className = "activity-card";

      const title = document.createElement("h4");
      title.textContent = name;

      const desc = document.createElement("p");
      desc.textContent = activity.description;

      const schedule = document.createElement("p");
      schedule.innerHTML = `<strong>Schedule:</strong> ${activity.schedule}`;

      const capacity = document.createElement("p");
      capacity.innerHTML = `<strong>Capacity:</strong> ${activity.participants.length} / ${activity.max_participants}`;

      // Participants section
      const participantsSection = document.createElement("div");
      participantsSection.className = "participants-section";

      const participantsTitle = document.createElement("h5");
      participantsTitle.textContent = "Participants";

      participantsSection.appendChild(participantsTitle);

      if (activity.participants && activity.participants.length > 0) {
        const ul = document.createElement("ul");
        ul.className = "participants-list";

        activity.participants.forEach((p) => {
          const li = document.createElement("li");
          li.className = "participant-item";

          // show as a small badge + email
          const badge = document.createElement("span");
          badge.className = "participant-badge";
          badge.textContent = p.split("@")[0]; // display user part
          li.appendChild(badge);

          const emailSpan = document.createElement("span");
          emailSpan.className = "participant-email";
          emailSpan.textContent = ` ${p}`;
          li.appendChild(emailSpan);

          ul.appendChild(li);
        });

        participantsSection.appendChild(ul);
      } else {
        const none = document.createElement("p");
        none.className = "info";
        none.textContent = "No participants yet.";
        participantsSection.appendChild(none);
      }

      card.appendChild(title);
      card.appendChild(desc);
      card.appendChild(schedule);
      card.appendChild(capacity);
      card.appendChild(participantsSection);

      activitiesList.appendChild(card);
    });
  }

  function populateSelect(data) {
    // Keep the default placeholder option
    const defaultOption = activitySelect.querySelector('option[value=""]');
    activitySelect.innerHTML = "";
    if (defaultOption) activitySelect.appendChild(defaultOption);

    Object.keys(data).forEach((name) => {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      activitySelect.appendChild(opt);
    });
  }

  function showMessage(type, text) {
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = text;
    messageDiv.classList.remove("hidden");
    setTimeout(() => {
      messageDiv.classList.add("hidden");
    }, 5000);
  }

  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const activity = activitySelect.value;

    if (!email || !activity) {
      showMessage("error", "Please provide an email and select an activity.");
      return;
    }

    const btn = signupForm.querySelector("button[type='submit']");
    btn.disabled = true;
    btn.textContent = "Signing up...";

    try {
      const res = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        { method: "POST" }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Signup failed" }));
        showMessage("error", err.detail || "Signup failed.");
        return;
      }

      const body = await res.json();
      showMessage("success", body.message || "Signed up successfully.");
      emailInput.value = "";
      await fetchActivities(); // refresh participants
    } catch (err) {
      console.error(err);
      showMessage("error", "Signup failed. Try again.");
    } finally {
      btn.disabled = false;
      btn.textContent = "Sign Up";
    }
  });

  // initial load
  fetchActivities();
});
