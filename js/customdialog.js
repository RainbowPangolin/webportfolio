//TODO auto focus

const DOMPurify = window.DOMPurify;

export let config = { };

export function myAlert(param1) {
    //Template usage based on MDN Docs: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template
    
    let mainBody = document.querySelector('main');
    let template = document.querySelector(param1);

    let clone = template.content.cloneNode(true);
    
    clone.querySelector('#cancel').classList.add('hidden');  
    clone.querySelector('input').classList.add('hidden');    
    clone.querySelector('label').innerText = "Alert!";   

    mainBody.appendChild(clone);
}

export function myConfirm(param1, callback) {
    let mainBody = document.querySelector('main');
    let template = document.querySelector(param1);

    let clone = template.content.cloneNode(true);

    let cancelButton = clone.querySelector('#cancel');
    cancelButton.addEventListener('click', () =>{
        callback(false);
    });

    let confirmButton = clone.querySelector('#confirm');
    confirmButton.addEventListener('click', () =>{
        callback(true);
    });

    clone.querySelector('input').classList.add('hidden');    
    clone.querySelector('label').innerText = "Confirm?";   

    mainBody.appendChild(clone);
}

export function myPrompt(param1, callback) {
    let mainBody = document.querySelector('main');
    let template = document.querySelector(param1);

    let clone = template.content.cloneNode(true);
    let myInput = clone.querySelector('input');

    let cancelButton = clone.querySelector('#cancel');
    cancelButton.addEventListener('click', () =>{
        callback(null);
    });

    let confirmButton = clone.querySelector('#confirm');
    confirmButton.addEventListener('click', () => {
        callback(myInput.value);
    });

    mainBody.appendChild(clone);
}

/**
 * Blog entry/upload dialog
 * @param {Element} blog_entry_dialog the dialog template to attach to
 * @param {Function} post_handler Function to handle uploading to database.
 *                                takes Blog Post object as its argument.
 * @param {Object} options Misc optional params 
 */
export function upload_blog_post(blog_entry_dialog, post_handler, options = {}) {

    
    let main_body = document.querySelector('main');
    let template = document.querySelector(blog_entry_dialog);
    //create element based on blog_entry_dialog
    let clone = template.content.cloneNode(true);
    let my_title = clone.querySelector('#input_title');
    let my_content = clone.querySelector('#input_content');
    let my_date = clone.querySelector('#post_date');
    let my_id; // = clone.querySelector('#post_id');
    let cur_date = Date();
    my_date.innerText = cur_date;
    if(options.title){
        //if a title is provided, auto populate title input
        my_title.value = options.title;
    } 
    if(options.content){
        //if content is provided, auto populate content input
        my_content.value = options.content;
    }   
    if(options.id){
        my_id = options.id;
    }

    let my_blog_post = {};

    //Used MDN's exmaple code as basis for focusing on button on dialog open https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus
    let confirm_button = clone.querySelector('#confirm');
    confirm_button.addEventListener('click', () => {
        //put data from fields into object
        my_blog_post.post_id = my_id;
        my_blog_post.title = DOMPurify.sanitize(my_title.value); 
        //the updated date
        my_blog_post.date = cur_date;
        my_blog_post.content = DOMPurify.sanitize(my_content.value);
        //handler puts this my_blog_post object into database
        post_handler(my_blog_post);

    });

    
    //Creates the dialog box popup
    main_body.appendChild(clone);
}