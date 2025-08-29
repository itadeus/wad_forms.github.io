let profiles = [];

document.addEventListener("DOMContentLoaded", () => {
  loadProfiles();
  setupSearch();

  const params = new URLSearchParams(window.location.search);
  const editId = params.get("id");
  const isEditing = params.get("edit");

  if (editId && isEditing) {
    const student = profiles.find(p => p.id === parseInt(editId, 10));
    if (student) {
      fillForm(student);
      document.getElementById("regForm").dataset.editing = editId;
      document.getElementById("live").textContent = "Editing profile...";
    }
  }

  // Show preview when selecting a file
  document.getElementById("photo").addEventListener("change", function() {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      document.getElementById("photoPreview").innerHTML = `<img src="${e.target.result}" alt="Preview" />`;
    };
    reader.readAsDataURL(file);
  });
});

document.getElementById("regForm").addEventListener("submit", function (e) {
  e.preventDefault();

  getFormData()
    .then(data => {
      const isValid = validateForm(data);
      if (!isValid) {
        document.getElementById("live").textContent = "Please fix errors.";
        return;
      }

      const editingId = this.dataset.editing;

      if (editingId) {
        const index = profiles.findIndex(p => p.id === parseInt(editingId, 10));
        if (index !== -1) {
          data.id = profiles[index].id;
          profiles[index] = data;
        }
        document.getElementById("live").textContent = "Student updated.";
      } else {
        data.id = Date.now();
        profiles.unshift(data);
        document.getElementById("live").textContent = "Student added.";
      }

      saveProfiles();
      renderProfiles();
      this.reset();
      this.dataset.editing = "";
      document.getElementById("photoPreview").innerHTML = "";

      window.location.href = `profile.html?id=${data.id}`;
    })
    .catch(err => {
      document.getElementById("live").textContent = err;
    });
});

function getFormData() {
  const editIndex = document.getElementById("regForm").dataset.editing || null;
  const photoInput = document.getElementById("photo");
  const file = photoInput.files[0];

  return new Promise((resolve, reject) => {
    const data = {
      first: document.getElementById("first").value.trim(),
      last: document.getElementById("last").value.trim(),
      email: document.getElementById("email").value.trim(),
      prog: document.getElementById("prog").value.trim(),
      year: document.querySelector("input[name='year']:checked")?.value,
      interests: document.getElementById("interests").value.trim(),
    };

    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        data.photo = e.target.result;
        resolve(data);
      };
      reader.onerror = () => reject("Error reading image.");
      reader.readAsDataURL(file);
    } else if (editIndex !== null && profiles.find(p => p.id === parseInt(editIndex, 10))?.photo) {
      data.photo = profiles.find(p => p.id === parseInt(editIndex, 10)).photo;
      resolve(data);
    } else {
      document.getElementById("err-photo").textContent = "Please upload a photo.";
      reject("No photo uploaded.");
    }
  });
}

function validateForm(data) {
  let valid = true;
  const setError = (id, message) => { document.getElementById(id).textContent = message; valid = false; };

  if (!data.first) setError("err-first", "First name is required."); else document.getElementById("err-first").textContent = "";
  if (!data.last) setError("err-last", "Last name is required."); else document.getElementById("err-last").textContent = "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) setError("err-email", "Valid email required."); else document.getElementById("err-email").textContent = "";
  if (!data.prog) setError("err-prog", "Programme is required."); else document.getElementById("err-prog").textContent = "";
  if (!data.year) setError("err-year", "Year selection is required."); else document.getElementById("err-year").textContent = "";
  if (!data.photo) setError("err-photo", "Photo is required."); else document.getElementById("err-photo").textContent = "";

  return valid;
}

function renderProfiles() { renderFilteredProfiles(profiles); }

function renderFilteredProfiles(list) {
  const cards = document.getElementById("cards");
  const table = document.querySelector("#summary tbody");
  cards.innerHTML = "";
  table.innerHTML = "";

  list.forEach((data, index) => {
    const card = document.createElement("div");
    card.className = "card-person";
    card.innerHTML = `
      <img src="${data.photo}" alt="Student photo" />
      <div>
        <h3>${data.first} ${data.last}</h3>
        <p><span class="badge">${data.prog}</span> <span class="badge">Year ${data.year}</span></p>
        <p>${data.interests}</p>
        <button onclick="viewProfile(${data.id})">View</button>
        <button onclick="startEdit(${data.id})">Edit</button>
        <button onclick="removeProfile(${data.id})">Remove</button>
      </div>`;
    cards.appendChild(card);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${data.first} ${data.last}</td>
      <td>${data.prog}</td>
      <td>${data.year}</td>
      <td>
        <button onclick="startEdit(${data.id})">Edit</button>
        <button onclick="removeProfile(${data.id})">Remove</button>
      </td>`;
    table.appendChild(tr);
  });
}

function startEdit(id) {
  const student = profiles.find(p => p.id === id);
  if (!student) return;
  fillForm(student);
  document.getElementById("regForm").dataset.editing = id;
  document.getElementById("live").textContent = "Editing student...";
}

function fillForm(student) {
  document.getElementById("first").value = student.first;
  document.getElementById("last").value = student.last;
  document.getElementById("email").value = student.email;
  document.getElementById("prog").value = student.prog;
  document.querySelector(`input[name='year'][value="${student.year}"]`).checked = true;
  document.getElementById("interests").value = student.interests;
  document.getElementById("photoPreview").innerHTML = `<img src="${student.photo}" alt="Preview" />`;
}

function removeProfile(id) {
  profiles = profiles.filter(p => p.id !== id);
  saveProfiles();
  renderProfiles();
  document.getElementById("live").textContent = "Student removed.";
}

function saveProfiles() {
  localStorage.setItem("students", JSON.stringify(profiles));
}

function loadProfiles() {
  const data = localStorage.getItem("students");
  if (data) profiles = JSON.parse(data);
  renderProfiles();
}

function setupSearch() {
  document.getElementById("searchBtn").addEventListener("click", filterProfiles);
  document.getElementById("clearSearchBtn").addEventListener("click", () => {
    document.getElementById("searchInput").value = "";
    renderProfiles();
  });
}

function filterProfiles() {
  const query = document.getElementById("searchInput").value.toLowerCase().trim();
  const filtered = profiles.filter(p =>
    `${p.first} ${p.last}`.toLowerCase().includes(query) ||
    p.prog.toLowerCase().includes(query)
  );
  document.getElementById("live").textContent = filtered.length > 0 ? `${filtered.length} result(s) found.` : "No match found.";
  renderFilteredProfiles(filtered);
}

function viewProfile(id) {
  window.location.href = `profile.html?id=${id}`;
}
