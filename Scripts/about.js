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
const ChefesContainer = document.getElementById("ChefesContainer");

function setnavbar() {
  if (!isLoginIn) {
    ProfileLink.style.display = "none";
    LoginLink.style.display = "block";
  } else {
    ProfileLink.style.display = "block";
    LoginLink.style.display = "none";
  }
}


function prepareChefBox(Div, iconimageurl, name, desc) {
  //create
  const divmain = document.createElement("div");
  divmain.className = "col-md-4 mb-4";

  // create
  const wraperDiv = document.createElement("div");
  wraperDiv.className = "card bg-black text-white h-100 d-flex flex-column";

  const image = document.createElement("img");
  image.src = iconimageurl.startsWith("http")
    ? iconimageurl
    : API + (iconimageurl.startsWith("/") ? iconimageurl : "/" + iconimageurl);
  image.alt = name + " logo";
  image.className = "card-img-top";
  wraperDiv.appendChild(image);

  const Textdiv = document.createElement("div");
  Textdiv.className = "card-body text-center";
  // Create and append title h5
  const h5 = document.createElement("h5");
  h5.className = "card-title";
  h5.textContent = name;
  Textdiv.appendChild(h5);

  const p1 = document.createElement("p");
  p1.className = "card-text";
  p1.textContent = desc;
  Textdiv.appendChild(p1);
  wraperDiv.appendChild(Textdiv);
  divmain.appendChild(wraperDiv);
  Div.appendChild(divmain);
}

function loadChefes() {
  if (!ChefesContainer) {
    console.error("ChefsContainer not found");
    return;
  }

  try {
    fetch(API + "/chefs")
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
        data.forEach((Chef) => {
          prepareChefBox(
            ChefesContainer,
            Chef.image,
            Chef.name,
            Chef.desc,
          );
        });
      })
      .catch((error) => {
        console.error("Error loading Dishes:", error);
        DishesContainer.innerHTML =
          '<p class="text-danger">Failed to load Chefs. Please try again later.</p>';
      });
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}


document.addEventListener("DOMContentLoaded",async  function () {
  API = await getApiBaseUrl();
  setnavbar();
  loadChefes();
});
