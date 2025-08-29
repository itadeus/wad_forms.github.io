document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get("id"), 10);

  const profiles = JSON.parse(localStorage.getItem("students")) || [];
  const student = profiles.find(p => p.id === id);

  const container = document.getElementById("profileDetail");

  if (student) {
    container.innerHTML = `
      <div class="card-person">
        <img src="${student.photo}" alt="Student photo">
        <h2>${student.first} ${student.last}</h2>
        <p><strong>Email:</strong> ${student.email}</p>
        <p><strong>Programme:</strong> ${student.prog}</p>
        <p><strong>Year:</strong> ${student.year}</p>
        <p><strong>Interests:</strong> ${student.interests || "—"}</p>
        <button onclick="window.location.href='index.html?id=${student.id}&edit=true'">Edit Profile</button>
      </div>`;
  } else {
    container.textContent = "Profile not found.";
  }
});
