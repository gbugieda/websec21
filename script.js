//FIREBASE CONNECTION CODE
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js";
import * as rtdb from "https://www.gstatic.com/firebasejs/9.0.2/firebase-database.js";

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

// Initialize Firebase & Ref variables
const app = initializeApp(firebaseConfig);
let db = rtdb.getDatabase(app);
let titleRef = rtdb.ref(db, "/");
let chatRef = rtdb.child(titleRef,"chats")


rtdb.onValue(chatRef, ss=>{
  let message = ss.val();
  if (!!message){
    displayChats(message);
  }
})
rtdb.onChildRemoved(chatRef, ss=>{
  $("#chatHist").empty();
})

$("#submit").on("click",function(){
  //check if name is blank
  //if name not blank, hide input&submit button
  //display text in that spot showing username in italics
})

$("#clear").on("click",function(){
  rtdb.set(chatRef,{});
})

/* Sends msg to db */
$("#send").on("click",function(){
  let msg = $("#msg").val();
  let msgObj = {"msg":msg};
  rtdb.push(chatRef,msgObj);
  //$("#msg").reset();
  $("#msg").val('');
})


function displayChats(chatObj){
  $("#chatHist").empty(); //empty list on page
  Object.keys(chatObj).map(chatID=>{
    $("#chatHist").append(`<li>${chatObj[chatID]["msg"]}</li>`);
  })
  
}