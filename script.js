// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js";
import * as rtdb from "https://www.gstatic.com/firebasejs/9.0.2/firebase-database.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyCmaP-2H6R9Osnui1piG8URHOiN4UaXat4",
    authDomain: "websec21-chatapp.firebaseapp.com",
    databaseURL: "https://websec21-chatapp-default-rtdb.firebaseio.com",
    projectId: "websec21-chatapp",
    storageBucket: "websec21-chatapp.appspot.com",
    messagingSenderId: "332741772190",
    appId: "1:332741772190:web:aaa0db201b1a651b914c8f"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

let db = rtdb.getDatabase(app);
let titleRef = rtdb.ref(db, "/");
let chatRef = rtdb.child(titleRef,"chats")

rtdb.onValue(titleRef, ss=>{
  //alert(JSON.stringify(ss.val()));
});

$("#submit").on("click",function(){
  //check if name is blank
  //if name not blank, hide input&submit button
  //display text in that spot showing username in italics
})

$("#send").on("click",function(){
  let msg = $("#msg").val();
  rtdb.push(chatRef,msg);
  let history = document.getElementById("chatHist");
  let message = document.createElement("li");
  message.appendChild(document.createTextNode(msg));
  history.appendChild(message);
  
})