let API ;

async function  getApiBaseUrl () {
   return fetch("appSettings.json")
  .then(response => response.json())
  .then(data => data.ApiBaseUrl)
  .catch(error => {
    console.error("Error fetching API base URL:", error);
  });
}
const isLoginIn = localStorage.getItem("LoggedIn") == "true";
const LoginLink = document.getElementById("LoginLink");
const ProfileLink = document.getElementById("ProfileLink");
const SignUPbtn = document.getElementById("SignUPbtn");
const KitchensContainer = document.getElementById("KitchenContainer");

function setnavbar() {
  if (!isLoginIn) {
    if (ProfileLink) ProfileLink.style.display = "none";
    if (LoginLink) LoginLink.style.display = "block";
    if (SignUPbtn) SignUPbtn.style.display = "block";
  } else {
    if (ProfileLink) ProfileLink.style.display = "block";
    if (SignUPbtn) SignUPbtn.style.display = "none";
    if (LoginLink) LoginLink.style.display = "none";
  }
}

function prepareKitchenBox(Div, iconimageurl, name, desc, id) {
  //create
  const divmain = document.createElement("div");
  divmain.className = "col-md-4 mb-4";

  // create
  const wraperDiv = document.createElement("div");
  wraperDiv.className = "feature-box bg-black text-white h-100";

  // Create and append icon
  const icon = document.createElement("a");
  icon.className =
    "navbar-brand d-flex justify-content-center align-items-center";
  icon.href = "products.html?Id=" + id;

  const image = document.createElement("img");
  image.src = iconimageurl.startsWith("http")
    ? iconimageurl
    : API + (iconimageurl.startsWith("/") ? iconimageurl : "/" + iconimageurl);
  image.alt = name + " logo";
  image.width = 80;
  image.height = 80;
  image.className = "rounded-circle border border-white shadow"; // ✅ Makes it circular and styled

  icon.appendChild(image);
  wraperDiv.appendChild(icon);

  // Create and append title h3
  const h2 = document.createElement("h2");
  h2.textContent = name;
  wraperDiv.appendChild(h2);
  // Create and append title h6
  const h6 = document.createElement("h6");
  h6.textContent = desc;
  h6.style.color = "rgb(179, 167, 167)";
  wraperDiv.appendChild(h6);
  // Create and append menu link
  const a = document.createElement("a");
  a.textContent = "see menu";
  a.className = "btn custom-btn btn-lg mb-2";
  a.href = "products.html?Id=" + id;
  wraperDiv.appendChild(a);

  divmain.appendChild(wraperDiv);
  Div.appendChild(divmain);
}

function loadKitchens() {
  if (!KitchensContainer) {
    console.error("KitchenContainer not found");
    return;
  }

  try {
    fetch(API + "/kitchens")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        return res.json();
      })
      .then((data) => {
        if (!data || !Array.isArray(data)) {
          throw new Error("Invalid data format");
        }
        data.forEach((kitchen) => {
          prepareKitchenBox(
            KitchensContainer,
            kitchen.image,
            kitchen.name,
            kitchen.desc,
            kitchen.id
          );
        });
      })
      .catch((error) => {
        console.error("Error loading kitchens:", error);
        KitchensContainer.innerHTML =
          '<p class="text-danger">Failed to load kitchens. Please try again later.</p>';
      });
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  API = await getApiBaseUrl(); // Now it's a promise
  setnavbar();
  loadKitchens();
});
