import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.8/firebase-app.js'

//get function to create blog post upload dialog
import {upload_blog_post} from './customdialog.js';

//firestore database
import { 
    getFirestore,
    collection, 
    getDocs, setDoc, deleteDoc, addDoc,
    doc, 
    updateDoc,
    query, orderBy
} from 'https://www.gstatic.com/firebasejs/9.6.8/firebase-firestore.js';

//firebase auth
import { 
    getAuth, 
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from 'https://www.gstatic.com/firebasejs/9.6.8/firebase-auth.js'

const firebaseConfig = {
    apiKey: 'AIzaSyBa6nzev5ROoS-9fTyeZEL5ZStzRBFqi4U',
    authDomain: 'cse134b-hw5-kaiwentsou.firebaseapp.com',
    projectId: 'cse134b-hw5-kaiwentsou',
    storageBucket: 'cse134b-hw5-kaiwentsou.appspot.com',
    messagingSenderId: '701272215515',
    appId: '1:701272215515:web:61e13b663e3177ee2121fe',
    measurementId: 'G-90LZ0BC3FT'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore();

let cur_author = null;

//login using the login button.
document.querySelector('#sign_in_form').addEventListener('submit', function( event ){
    let user_name = document.querySelector('#username').value;
    let user_pass = document.querySelector('#password').value;
    //based on firebase docs example
    signInWithEmailAndPassword(auth, user_name, user_pass)
        .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
        });
});

//logout using logout button
document.querySelector('#logout_button').addEventListener('click', function( event ){
    signOut(auth);
});

/**
 * Firebase Firestore rules already restrict write/delete/edit access to logged in users. 
 * Will only be used to update CSS and change appeareance for user
 */
const monitorAuthState = async () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in, see docs for a list of available properties
            // https://firebase.google.com/docs/reference/js/firebase.User
            console.log('Signed in');
            cur_author = user.email;
            show_all();
            document.querySelector('#signed_in_block > pre').innerText = cur_author;
        } else {
            console.log('Signed OUT');
            hide_all();
        }
    });
}

update_post_list();

/**
 * Just hides things you shouldn't see while signed out
 * Items are hidden and unhidden via CSS. No need for it to be securely hidden.
 */
function hide_all(){
    document.querySelector('#sign_in_form').classList.remove('hidden');
    document.querySelector('#signed_in_block').classList.add('hidden');
    //hide add, delete and edit buttons
    let edit_buttons_list = document.querySelectorAll('.edit_button');
    let delete_buttons_list = document.querySelectorAll('.delete_button');
    edit_buttons_list.forEach( element => {
        element.classList.add('hidden');
    });
    delete_buttons_list.forEach( element => {
        element.classList.add('hidden');
    });
    document.querySelector('#add_blog_post_button').classList.add('hidden');
}

/**
 * Shows things you should see while logged in
 * Items are hidden and unhidden via CSS. No need for it to be securely hidden.
 */
function show_all(){
    document.querySelector('#sign_in_form').classList.add('hidden');
    document.querySelector('#signed_in_block').classList.remove('hidden');
    //Unhide add, delete and edit buttons
    let edit_buttons_list = document.querySelectorAll('.edit_button');
    let delete_buttons_list = document.querySelectorAll('.delete_button');
    edit_buttons_list.forEach( element => {
        element.classList.remove('hidden');
    });
    delete_buttons_list.forEach( element => {
        element.classList.remove('hidden');
    });
    document.querySelector('#add_blog_post_button').classList.remove('hidden');
}

let blog_template = document.querySelector('#blog_post_template');

/**
 * Rewrites the list of posts. Inefficient from a performance standpoint,
 * but very simple to do.
 */
async function update_post_list(){
    //depopulate current list 
    let blog_parent = document.querySelector('#blog_post_entries');
    // Used example code from MDN https://developer.mozilla.org/en-US/docs/Web/API/Node/removeChild
    while (blog_parent.firstChild) {
        blog_parent.removeChild(blog_parent.firstChild);
    }
    const posts = query(collection(db, 'blog posts'), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(posts);
    // populate list with new database snapshot
    querySnapshot.forEach((blog_post) => {
        let post_obj = JSON.parse(JSON.stringify(blog_post.data()));
        let clone = blog_template.content.cloneNode(true);
        //fill in clone with relevant info
        clone.querySelector('.title').innerHTML = post_obj.title;
        clone.querySelector('.post_id').innerHTML = blog_post.id;
        clone.querySelector('.content').innerHTML = post_obj.content;
        clone.querySelector('.date').innerHTML = post_obj.date;
        clone.querySelector('.author').innerHTML = post_obj.author;
        clone.querySelector('.edit_button').addEventListener('click', () => {
            upload_blog_post('#blog_entry_dialog', edit_post, {'id' : blog_post.id,'title': post_obj.title, 'content': post_obj.content });
        });
        clone.querySelector('.delete_button').addEventListener('click', () => {
            delete_post(blog_post.id);
        });
        blog_parent.appendChild(clone);
    });

    if(cur_author !== null) {
        show_all();
    }
    else {
        hide_all();
    }
}

//Create blog_entry_dialog dialog on pressing the button
document.getElementById('add_blog_post_button').addEventListener('click', () => {
    upload_blog_post('#blog_entry_dialog', add_post);
});

/**
 * @param {*} my_blog_object A JSON/js object containing filled blog-post fields
 * Adds a post to the database, then refreshes the post list.
 * Database id is set to the post's title
 * NOTE: Using a form to handle this a la methodtest.html might have been better,
 * but this doesn't seem to be significantly more vulnerable or introduce any
 * dramatic problems
 */
async function add_post(my_blog_object) {
    //based on firestore docs example
    try {
        await addDoc(collection(db, 'blog posts'),  {
            //object text is sanitized in customdialog.js, so no need to do it here
          title: my_blog_object.title,
          date: my_blog_object.date,
          content: my_blog_object.content,
          author: cur_author
        });
        console.log('Document written with title: ', my_blog_object.title);
      } catch (e) {
        console.error('Error adding document: ', e);
      }
    update_post_list();
}

/**
 * @param {*} my_blog_object A JSON/js object containing filled blog-post fields
 * Edits post on database (based on title as id), then refreshed displayed list.
 */
 async function edit_post(my_blog_object) {
    try {
        await updateDoc(doc(db, 'blog posts', my_blog_object.post_id), {
          title: my_blog_object.title,
          date: my_blog_object.date,
          content: my_blog_object.content,
          author: cur_author
        });
        console.log('Document edited with id: ', my_blog_object.post_id);
      } catch (e) {
        console.error('Error editing document: ', e);
      }
    update_post_list();
}

/**
 * @param {*} post_id The name of the post to delete
 * Deletes the post from the database, then refresehd displayed list. 
 */
 async function delete_post(post_id) {
    try {
        await deleteDoc(doc(db, 'blog posts', post_id));
        console.log('Document deleted with id: ', post_id);
      } catch (e) {post_id
        console.error('Error deleting document: ', e);
      }
    update_post_list();
}

monitorAuthState();