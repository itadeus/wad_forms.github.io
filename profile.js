//run this code after the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  //get the profile id from URL
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get("id"), 10);

//fetch profiles from localStorage
  const profiles = JSON.parse(localStorage.getItem("students")) || [];

  //find the profile with the matching id
  const student = profiles.find(p => p.id === id);

//get the container to display profile details
  const container = document.getElementById("profileDetail");


  //if profile found, display its details
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
    //if not found, show message
    container.textContent = "Profile not found.";
  }
});
