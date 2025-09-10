// Import Firebase auth functions
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } 
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { initializeApp } 
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

// Firebase config (your own values from Firebase)
const firebaseConfig = {
  apiKey: "AIzaSyBVnqeK19IG8idjKYw0rhzbfjmlQEQHV2U",
  authDomain: "student-notes-5d5b2.firebaseapp.com",
  projectId: "student-notes-5d5b2",
  storageBucket: "student-notes-5d5b2.appspot.com",
  messagingSenderId: "859137535173",
  appId: "1:859137535173:web:9722d1dd0e324bacc154ac"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Handle Register
document.getElementById("registerForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      alert("Registration successful! Please login.");
      window.location.href = "login.html";
    })
    .catch((error) => {
      alert(error.message);
    });
});
