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
let userId = "anonymous"
let userFlag = 0;



/********* START USER AUTHENTICATION *********/
$("#login").on("click",function(){
  let tempUid = $("#uid").val();
  if (tempUid.trim().length == 0){ //empty string or only spaces
    alert("Please enter an actual username!")
  }
  else{
    userId = $("#uid").val();
    $(".user-auth").hide(); //hide enter userID section
    $( "<h3 class=header >USER: " + userId + "</h3>" ).insertAfter( ".user-auth" );
    $(".discord").show();
    userFlag = 1;
  }
})
/********* END USER AUTHENTICATION *********/


rtdb.onValue(chatRef, ss=>{
  let message = ss.val();
  if (!!message){
    displayChats(message);
  }
})
rtdb.onChildRemoved(chatRef, ss=>{
  $("#chatHist").empty();
})



$("#clear").on("click",function(){
  rtdb.set(chatRef,{});
})

/* Sends msg to db */
$("#send").on("click",function(){
  if (userFlag == 1){
    let date = getDate();
    let msg = $("#msg").val();
    let msgObj = {"msg":msg,"user":userId,"date":date};
    rtdb.push(chatRef,msgObj);
    $("#msg").val('');
  }
  else{
    alert("You must enter a username before sending a message!");
    $("#msg").val('');
  }
  
})


$(document).on("click", ".chatElem", function(){
//  if (userId === 
})

function displayChats(chatObj){
  $("#chatHist").empty(); //empty list on page
  Object.keys(chatObj).map(chatID=>{
    console.log("howdy");
    $("#chatHist").append(`<li class="chatElem" data-id=${chatID}><span class=header> ${chatObj[chatID]["user"]}</span>` + ": " + `${chatObj[chatID]["msg"]}</li>`);
  })
  //With date below:
  
  //$("#chatHist").append(`<li><span class=header> ${chatObj[chatID]["user"]}</span>` + ": " + `${chatObj[chatID]["msg"]}` + '(' + `<i>${chatObj[chatID]["date"]}` + ')' + `</i></li>`);
  //alert("here");

}

function getDate(){
  let date = new Date();
  let month = date.getMonth();
  let day = date.getDate();
  let year = date.getFullYear();
  let res = month + '/' + day + '/' + year;
  return res;
  
}

//if user authenticates, then block discord display none, hide user auth