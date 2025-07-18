// === DOM ELEMENTS ===
const LoginLink = document.getElementById("LoginLink");
const ProfileLink = document.getElementById("ProfileLink");
const ProfileImg = document.getElementById("ProfileImg");
const Uploadnewimagebtn = document.getElementById("Uploadnewimagebtn");
const inputUsername = document.getElementById("inputUsername");
const inputEmailAddress = document.getElementById("inputEmailAddress");
const inputPhone = document.getElementById("inputPhone");
const inputBirthday = document.getElementById("inputBirthday");
const SaveChangesbtn = document.getElementById("SaveChangesbtn");
const favoritesContainer = document.getElementById("favoritesContainer");

const clientId = localStorage.getItem("user_id");
let API = "";
let uploadBtnInitialized = false;
let saveBtnInitialized = false;

/* === Get API Base URL from config === */
async function getApiBaseUrl() {
  try {
    const response = await fetch("appSettings.json");
    const data = await response.json();
    return data.ApiBaseUrl;
  } catch (error) {
    console.error("Error fetching API base URL:", error);
    alert("Could not load configuration.");
    return null;
  }
}

/* === Set Navbar Visibility Based on Login Status === */
function setNavbar(isLoginIn) {
  if (!LoginLink || !ProfileLink) return;
  LoginLink.style.display = isLoginIn ? "none" : "block";
  ProfileLink.style.display = isLoginIn ? "block" : "none";
}

/* === Load Profile Info from API === */
async function loadProfile() {
  if (!clientId) {
    alert("Client ID missing. Please log in.");
    return;
  }

  try {
    const response = await fetch(`${API}/clients/${clientId}`);
    const data = await response.json();

    if (!data.id) {
      alert(data.message || "Failed to load profile.");
      return;
    }

    populateProfileFields(data);
   
    setFavorites(data.favorites || []);
    initUploadImageButton();
    initSaveChangesButton();

  } catch (error) {
    console.error("Error loading profile:", error);
    alert("An error occurred while loading the profile.");
  }
}

/* === Fill Profile Input Fields === */
function populateProfileFields(data) {
  inputUsername.value = data.name;
  inputEmailAddress.value = data.email;
  inputPhone.value = data.phone;
  inputBirthday.value = data.birthday ?? "2000-01-01";
  ProfileImg.src = `${API}/${data.image}`;
  ProfileImg.alt = `${data.name}'s profile picture`;
}

/* === Upload Profile Image === */
function initUploadImageButton() {
  if (uploadBtnInitialized || !Uploadnewimagebtn) return;

  Uploadnewimagebtn.addEventListener("click", () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";

    fileInput.onchange = async (event) => {
      const file = event.target.files[0];
      if (file) {
        const formData = new FormData();
        formData.append("image", file);

        try {
          const uploadResponse = await fetch(`${API}/clients/${clientId}`, {
            method: "PUT",
            body: formData,
          });

          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            ProfileImg.src = `${API}/${uploadData.image}`;
            ProfileImg.alt = `${inputUsername.value}'s profile picture`;
          } else {
            alert("Failed to upload image.");
          }
        } catch (error) {
          console.error("Image upload failed:", error);
          alert("Error occurred while uploading image.");
        }
      }
    };

    fileInput.click();
  });

  uploadBtnInitialized = true;
}

/* === Save Profile Changes === */
function initSaveChangesButton() {
  if (saveBtnInitialized || !SaveChangesbtn) return;

  SaveChangesbtn.addEventListener("click", async () => {
    const updatedData = {
      name: inputUsername.value,
      email: inputEmailAddress.value,
      phone: inputPhone.value,

    };

    try {
      const response = await fetch(`${API}/clients/${clientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
      });

      const result = await response.json();
      if (result.success) {
        alert("Profile updated successfully.");
      } else {
        alert(result.message || "Failed to update profile.");
      }

    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred while updating the profile.");
    }
  });

  saveBtnInitialized = true;
}

/* === Set Favorite Dishes === */
function setFavorites(favorites) {
   console.log("Profile loaded successfully:",favorites);
  if (!favoritesContainer) return;
  favoritesContainer.innerHTML = "";

  if (favorites.length === 0) {
    favoritesContainer.innerHTML = "<p>No favorite dishes found.</p>";
    return;
  }

  favorites.forEach((dish) => {
    const dishDiv = document.createElement("div");
    dishDiv.className = "favorite-dish";
    dishDiv.innerHTML = `
      <img src="${API}/${dish.image}" alt="${dish.name}" class="favorite-dish-image">
      <div class="favorite-dish-info">
        <h5>${dish.name}</h5>
        <p>${dish.desc}</p>
        <p>Price: $${dish.price}</p>
        <button class="btn btn-danger remove-favorite" data-id="${dish.id}">
          Remove from Favorites
        </button>
      </div>
    `;

    const removeButton = dishDiv.querySelector(".remove-favorite");
    removeButton.addEventListener("click", () => removeFavoriteDish(dish.id, dishDiv));

    favoritesContainer.appendChild(dishDiv);
  });
}

/* === Remove Dish from Favorites === */
async function removeFavoriteDish(dishId, dishElement) {
  try {
    const response = await fetch(`${API}/clients/${clientId}/favorites/${dishId}`, {
      method: "DELETE"
    });

    const result = await response.json();
    if (result.success) {
      alert("Dish removed from favorites.");
      dishElement.remove();
    } else {
      alert(result.message || "Failed to remove dish.");
    }
  } catch (error) {
    console.error("Error removing favorite:", error);
    alert("An error occurred while removing the dish.");
  }
}

/* === MAIN INITIALIZATION === */
document.addEventListener("DOMContentLoaded", async function () {
  API = await getApiBaseUrl();
  if (!API) return;

  const isLoginIn = localStorage.getItem("LoggedIn") === "true";
  setNavbar(isLoginIn);

  if (isLoginIn) {
    await loadProfile();
  }
});
