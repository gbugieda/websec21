/********* START FIREBASE CONNECTION CODE *********/
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js";
import * as rtdb from "https://www.gstatic.com/firebasejs/9.0.2/firebase-database.js";
import * as fbauth from "https://www.gstatic.com/firebasejs/9.0.2/firebase-auth.js"

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

let userRef = rtdb.child(titleRef,"users")
let currentChannel = "general";
let channelRef = rtdb.child(titleRef,"channels");
let channelNavRef = rtdb.child(titleRef,"channel-nav");
let channelCreatedRef = rtdb.ref(db, `/channels/${currentChannel}`);
let chatRef = rtdb.ref(db, `/channels/${currentChannel}/chats`);


//let userName = "";
let auth = fbauth.getAuth(app);
let currentUser = null;

/********* END FIREBASE CONNECTION CODE *********/






/********* START USER AUTHENTICATION *********/


//Login to discord
$("#login").on("click",function(){
  let email = $("#userEmail").val();
  let password = $("#userPassword").val()
  fbauth.signInWithEmailAndPassword(auth, email, password).then(currUser=>{
    //console.log(currUser);
    }).catch(function(error){
    let errorCode = error.code;
    let errorMsg = error.message;
    console.log(errorCode);
    console.log(errorMsg);
  })
})

//logout of discord
$("#logout").on("click",function(){
  fbauth.signOut(auth).then(()=>{
    console.log("sign out success");
  })
})


fbauth.onAuthStateChanged(auth, user=> {
  if (!!user) { //user is signed in
    //show login options and hide register options
    $(".user-auth-reg").hide();
    $(".user-auth-reset").hide();
    $(".user-auth-login").show();
    currentUser = user;
    renderDiscord(currentUser.displayName);
    loadChats();
  }
  else{ //user is signed out
    currentUser = null;
    $('.user-auth').find('input:text').val('');
    $('.user-auth').find('input:password').val('');
    $('.discord').hide();
    $('.user-info').hide();
    $('#logout').hide();
    $(".user-auth").show();
  }
});


//register new account
$("#register").on("click",function(){
  $(".user-auth-login").hide();
  $(".user-auth-reset").hide();
  $(".user-auth-reg").show();
  let email = $("#regEmail").val();
  let password = $("#regPassword").val();
  let username = $("#regUsername").val();

  fbauth.createUserWithEmailAndPassword(auth, email, password).then(newUser=>{
    let uid = newUser.user.uid;
    let userObj = {"uid":uid,"username":username,active:true,"roles":{"user":true}};
    let userRef = rtdb.ref(db, `/users/${uid}`);
    rtdb.update(userRef,userObj);

    fbauth.updateProfile(auth.currentUser,{
      displayName: username,
      photoURL: ""
    }).then(function() {
    }, function(error) {
    });

    }).catch(function(error){
    let errorCode = error.code;
    let errorMsg = error.message;
    if (errorCode == "auth/weak-password"){
      alert("Password needs to be at least 6 characters!");
    }
    console.log(errorCode);
    console.log(errorMsg);
  })

  fbauth.signOut(auth).then(()=>{
    console.log("sign out success");
  })
  

})

$("#resetPassword").on("click",function(){
  $(".user-auth-login").hide();
  $(".user-auth-reg").hide();
  $(".user-auth-reset").show();
  let email = $("#userEmailReset").val();

  fbauth.sendPasswordResetEmail(auth, email)
  .then(() => {
    alert("Password reset email sent!");
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
  });

})

function renderDiscord(username){
  $(".user-auth").hide();
  $("<div class=user-info></div>").insertAfter( ".user-auth" );
  $("#logout").show();
  $(".user-info").append($( "<h3 class=header  id=screenName>USER: " + username + "</h3>" ));
  $(".discord").show();
}


/********* END USER AUTHENTICATION *********/

function loadChats(){
  rtdb.onValue(chatRef, ss=>{
  let message = ss.val();
  //if (!!message){
     displayChats(message);
 // }
  })
} 

rtdb.onChildRemoved(chatRef, ss=>{
  $("#chatHist").empty();
})


rtdb.onValue(channelNavRef, ss=>{
  let channel = ss.val();
  if (!!channel){
    console.log(channel);
    displayChannels(channel);
  }
})
/*
$("#clear").on("click",function(){
  rtdb.set(chatRef,{});
})
*/

/* Sends msg to db */
$("#send").on("click",function(){
    let date = getDate();
    let msg = $("#msg").val();
    let msgObj = {"msg":msg,"user":userName,"uid":currentUser.user.uid, "date":date};
    //let channelChatRef = rtdb.ref(db, `/${currentChannel}/chats`);
    rtdb.push(chatRef,msgObj);
    $("#msg").val('');
    loadChats();
})


function loadChannels(){
  rtdb.onValue(channelCreatedRef, ss=>{
    let message = ss.val();
    if (!!message){
      displayChats(message);
    }
  })
}


$("#addChannel").on("click",function(){
  let channelName = $("#addChannelBox").val();
  let currChannel = channelName;
  channelCreatedRef = rtdb.ref(db, `/channels/${currChannel}`);
  chatRef = rtdb.ref(db, `/channels/${currentChannel}/chats`);
  let navRef = rtdb.ref(db,`/channel-nav/${currChannel}/`);
  //call load chat function, 
 // let channelInfoRef = rtdb.ref(db, `/channels/${currentChannel}/info`);
  rtdb.push(navRef,{"active":true});
  loadChannels();
  loadChats();

})





//TODO: If current content editable is insecure, adapt this function to fix security issues
function editMessage(evt, msgId){
  //get userID from database
  //check if user id matches msg ID
  //if so, allow edit, if not don't allow
  if (evt.target === evt.currentTarget && $(`[data-id=${msgId}]`).children("#editMsg").length == 0){
    //console.log(child(String(msgId)));
    alert(msgId);
   // $(`[data-id=${msgId}]`).attr()
    //$(`[data-id=${msgId}]`).hide();
  
   $(`[data-id=${msgId}]`).append(`<input type="text" id="editMsg" name="msg">`);
   $(`[data-id=${msgId}]`).append(`<button id=editChat>Make Edit</button>`);
   $(`[data-id=${msgId}]`).append(`<button id=cancelEditChat>Cancel</button>`);

  

   
   $("#editChat").on("click",function(){
     //console.log("here edit click");
    let editedMsg = $("#editMsg").val();
    //alert(editedMsg);
    let editRef = rtdb.ref(db, `/channels/${currentChannel}/chats/${msgId}`);
    rtdb.update(editRef,{"msg":editedMsg});
    
   });
   $("#cancelEditChat").on("click",function(){
    $(`[data-id=${msgId}]`).empty();
  });

  }
}

function displayChannels(channelObj){
  $("#channelList").empty(); //empty list on page

  Object.keys(channelObj).map(channelID=>{
    console.log(channelID);
    let $li = $(`<button class="channelElem" id=${channelID}>${channelID}</button>`);
    $("#channelList").append($li);
    $li.click((event)=>{
      
      //let clickedChat = $(event.currentTarget).attr("data-id");
      currentChannel = $(event.currentTarget).attr("id");
      alert(currentChannel);
      chatRef = rtdb.ref(db, `/channels/${currentChannel}/chats`);
      loadChats();
    })

  })


}
function displayChats(chatObj){
  $("#chatHist").empty(); //empty list on page
  let divide = ": "
  if(chatObj != null){
  Object.keys(chatObj).map(chatID=>{
    //CHECK W/ PROF if I leave following code like this, can someone change plaintext only to true, thus incurring security issue
    let $li = $(`<li class="chatElem"  data-id=${chatID}><span class=header> ${chatObj[chatID]["user"]}${divide}</span><span> ${chatObj[chatID]["msg"]}</span></li>`);
    $("#chatHist").append($li);
    $li.click((event)=>{
      let clickedChat = $(event.currentTarget).attr("data-id");
      editMessage(event,clickedChat);
     // alert("here");
    })
   // $("#chatHist").append(`<li class="chatElem" data-id=${chatID}><span class=header> ${chatObj[chatID]["user"]}</span>` + ": " + `${chatObj[chatID]["msg"]}</li>`);
  })
  //With date below:
}
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




/********* HELPER FUNCTIONS *********/
/*
function channelSanitize(name){
  let sanitizedName = name.replace(/\s/g, '-').toLowerCase();
  sanitizedName = sanitizedName.
  
}

function sanitizeHTML(input){

}
*/
/********* HELPER FUNCTIONS *********/