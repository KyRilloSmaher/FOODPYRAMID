let API ;

async function  getApiBaseUrl () {
   return fetch("appSettings.json")
  .then(response => response.json())
  .then(data => data.ApiBaseUrl)
  .catch(error => {
    console.error("Error fetching API base URL:", error);
  });
}
const isLoginIn = localStorage.getItem("LoggedIn") === "true";
const clientId = localStorage.getItem("user_id");

const LoginLink = document.getElementById("LoginLink");
const ProfileLink = document.getElementById("ProfileLink");
const DishesContainer = document.getElementById("DishesContainer");

const params = new URLSearchParams(window.location.search);
const kitchenId = params.get("Id");

function setnavbar() {
  if (!isLoginIn) {
    ProfileLink.style.display = "none";
    LoginLink.style.display = "block";
  } else {
    ProfileLink.style.display = "block";
    LoginLink.style.display = "none";
  }
}

function prepareDishBox(Div, iconimageurl, name, desc, price, dishId, isFavorited) {
  const divmain = document.createElement("div");
  divmain.className = "col-md-4";

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
  Textdiv.className = "card-body flex-grow-1";

  const h5 = document.createElement("h5");
  h5.className = "card-title d-flex justify-content-between align-items-center";

  const titleSpan = document.createElement("span");
  titleSpan.textContent = name;

  const heartIcon = document.createElement("i");
  heartIcon.className = isFavorited ? "fa fa-heart text-danger" : "fa fa-heart text-light";
  heartIcon.style.cursor = "pointer";


  heartIcon.addEventListener("click", () => {
    if (!isLoginIn || !clientId) {
      alert("Please log in to use favorites.");
      return;
    }

    const url = `${API}/clients/${clientId}/favorites/${dishId}`;
    const method = heartIcon.classList.contains("text-light") ? "POST" : "DELETE";

    fetch(url, { method })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update favorites");
        console.log(res.data);
        return res.json();
      })
      .then(() => {
        heartIcon.classList.toggle("fa-heart");
        heartIcon.classList.toggle("fa-heart");
        heartIcon.classList.toggle("text-danger");
        heartIcon.classList.toggle("text-light");
      })
      .catch((err) => {
        console.error("Error toggling favorite:", err);
        alert("Could not update favorite.");
      });
  });

  h5.appendChild(titleSpan);
  h5.appendChild(heartIcon);
  Textdiv.appendChild(h5);

  const p1 = document.createElement("p");
  p1.className = "card-text";
  p1.textContent = desc;
  Textdiv.appendChild(p1);

  const p2 = document.createElement("p");
  p2.className = "fw-bold text-success";
  p2.textContent = "$" + price;
  Textdiv.appendChild(p2);

  wraperDiv.appendChild(Textdiv);
  divmain.appendChild(wraperDiv);
  Div.appendChild(divmain);
}

function loadDishes() {
  if (!DishesContainer) {
    console.error("DishesContainer not found");
    return;
  }

  let userFavorites = [];
const fetchFavorites = isLoginIn && clientId
  ? fetch(`${API}/clients/${clientId}/favorites`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Favorite list received:", data);
        if (!Array.isArray(data.favorites)) {
          throw new Error("Invalid format: 'favorites' key missing or not an array");
        }
        userFavorites = data.favorites.map(f => f.id); // assuming `id` is dish ID
      })
      .catch((err) => {
        console.error("Failed to fetch favorites", err);
        userFavorites = [];
      })
  : Promise.resolve();



  fetchFavorites.then(() => {
    fetch(`${API}/kitchens/${kitchenId}/dishes`)
      .then((res) => res.json())
      .then((dishes) => {
        DishesContainer.innerHTML = "";
        dishes.forEach((dish) => {
          const isFav = userFavorites.includes(dish.id);
          prepareDishBox(
            DishesContainer,
            dish.image,
            dish.name,
            dish.desc,
            dish.price,
            dish.id,
            isFav
          );
        });
      })
      .catch((error) => {
        console.error("Error loading Dishes:", error);
        DishesContainer.innerHTML =
          '<p class="text-danger">Failed to load Dishes. Please try again later.</p>';
      });
  });
}

document.addEventListener("DOMContentLoaded", async function () {
  API = await getApiBaseUrl(); 
  setnavbar();
  loadDishes();
});
