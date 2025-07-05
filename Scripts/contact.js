    const isLoginIn = localStorage.getItem("LoggedIn") =="true";
    const LoginLink = document.getElementById("LoginLink");
    const ProfileLink = document.getElementById("ProfileLink");
  

    function setnavbar() {
     if (!isLoginIn) {
       ProfileLink.style.display="none";
       LoginLink.style.display="block";
      
     }
     else{
       ProfileLink.style.display="block";
       LoginLink.style.display="none";
     }
    }
    document.addEventListener("DOMContentLoaded", function () {
    setnavbar();
  });