    const isLoginIn = localStorage.getItem("LoggedIn") =="true";
    const LoginLink = document.getElementById("LoginLink");
    const ProfileLink = document.getElementById("ProfileLink");
    const SignUPbtn = document.getElementById("SignUPbtn");

    function setnavbar() {
        console.log("iam in");
     if (!isLoginIn) {
         console.log("iam in 2");
       ProfileLink.style.display="none";
       LoginLink.style.display="block";
       SignUPbtn.style.display="block";
     }
     else{
       ProfileLink.style.display="block";
       SignUPbtn.style.display="none";
       LoginLink.style.display="none";
     }
    }
    document.addEventListener("DOMContentLoaded", function () {
    setnavbar();
  });