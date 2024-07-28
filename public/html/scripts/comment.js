let tokenObj = localStorage.getItem('token') || null;  // This will store the user's JWT after login
let userToken;

if (tokenObj) {
    tokenObj = JSON.parse(tokenObj);
    userToken = tokenObj.token;
}   
const urlParams = new URLSearchParams(window.location.search);
const articleID = urlParams.get('id');
console.log('Token:', userToken);
        
let payload = null;

if (userToken) {
    payload = jwt_decode(userToken);
    console.log(payload);
}

document.addEventListener('DOMContentLoaded', () => {
    loadComments();

    document.getElementById('comment-submit').addEventListener('click', () => {
        const commentInput = document.getElementById('comment-input');
        const content = commentInput.value.trim();
        if (content) {
            postComment(content);
            commentInput.value = '';
        }
    });
});

// Function to extract numeric ID
const extractId = (id) => String(id).replace('comment-', '');

async function loadComments() {
    const response = await fetch(`api/${articleID}/comments`);
    if (!response.ok) {
        alert('Error occurred while fetching comments.');
        return;
    }
    const comments = await response.json();
    displayComments(comments);
}

function displayComments(comments, parentElement = document.getElementById('comments'), level = 0) {
    parentElement.innerHTML = '';
    comments.forEach(comment => {
        const commentElement = createCommentElement(comment, level);
        parentElement.appendChild(commentElement);
        if (comment.replies && level < 2) {
            const replyContainer = document.createElement('div');
            replyContainer.classList.add('reply');
            displayComments(comment.replies, replyContainer, level + 1);
            parentElement.appendChild(replyContainer);
        }
    });
}

function createCommentElement(comment, level) {
    const commentElement = document.createElement('div');
    commentElement.classList.add('comment');
    commentElement.id = `comment-${comment.commentId}`;
    commentElement.style.marginLeft = `${level * 20}px`;

    let profilePictureUrl = '';


    console.log("Comment: " + comment);
    console.log("Comment ID: " + comment.commentId);
    console.log("timestamp: " + comment.createdAt); 

    let canDelete = false;

    // if admin or user who created the comment
    if (payload && (payload.role === 'Admin' || payload.userId === comment.userId)) {
        canDelete = true;
    }

    profilePictureUrl = `data:image/png;base64,${comment.profilePicture}`;

    if (!comment.profilePicture) {
        profilePictureUrl = `./images/profile-pictures/defaultProfile-black.png`;
    }

    commentElement.innerHTML = `
        <div class="meta">
            <img src="${profilePictureUrl}" alt="${comment.username}">
            <span class="username">${comment.username} ${comment.role === 'Admin' ? '(ADMIN)' : ''}</span>
            <span class="timestamp">${timeSince(new Date(comment.createdAt))}</span>
        </div>
        <div class="content">${comment.content}</div>
        <div class="actions">
            <span class="vote upvote">▲ ${comment.upvotes}</span>
            <span class="vote downvote">▼ ${comment.downvotes}</span>
            ${canDelete ? '<span class="delete">Delete</span>' : ''}
            ${level < 2 ? '<span class="reply">Reply</span>' : ''}
        </div>
    `;

    // if logged in
    if (payload.userId) {
        commentElement.querySelector('.upvote').classList.add('clickable');
        commentElement.querySelector('.upvote').addEventListener('click', () => upvoteComment(comment.commentId));
        commentElement.querySelector('.downvote').classList.add('clickable');
        commentElement.querySelector('.downvote').addEventListener('click', () => downvoteComment(comment.commentId));   
    }

    if (canDelete) {
        commentElement.querySelector('.delete').addEventListener('click', () => deleteComment(comment.commentId));
    }
    if (level < 2) {
        commentElement.querySelector('.reply').addEventListener('click', () => replyToComment(comment.commentId));
    }

    return commentElement;
}

async function postComment(content, parentId = null) {
    const articleId = articleID;
    const response = await fetch(`api/comments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ articleId, content, parentId })
    });
    if (response.ok) {
        loadComments();
    }
    if (!response.ok) {
        alert('Error occurred while posting comment.');
    }
}

async function upvoteComment(commentId) {
    const response = await fetch(`api/comments/${commentId}/upvote`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${userToken}` },
    });
    if (response.ok) {
        loadComments();
    }
    if (!response.ok) {
        alert('Error occurred while upvoting comment.');
    }
}

async function downvoteComment(commentId) {
    const response = await fetch(`api/comments/${commentId}/downvote`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${userToken}` },
    });
    if (response.ok) {
        loadComments();
    }
    if (!response.ok) {
        alert('Error occurred while downvoting comment.');
    }
}

async function deleteComment(commentId) {
    const response = await fetch(`api/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${userToken}` }
    });
    if (response.ok) {
        loadComments();
    }
    if (!response.ok) {
        alert('Error occurred while deleting comment.');
    }
}

function replyToComment(parentId) {
    // Find the parent comment element
    const parentComment = document.getElementById(`comment-${parentId}`);

    // Check if a reply container already exists
    if (parentComment.querySelector('.reply-container')) {
        return; // Exit the function if a reply container already exists
    }
        
    // Create a container for the reply input and button
    const replyContainer = document.createElement('div');
    replyContainer.className = 'reply-container';
    
    // Create the reply input textbox
    const replyInput = document.createElement('textarea');
    replyInput.className = 'reply-input';
    replyInput.placeholder = 'Enter your reply...';
    
    // Create the submit button
    const submitButton = document.createElement('button');
    submitButton.className = 'reply-submit';
    submitButton.innerText = 'Submit';
    
    // Append the input and button to the reply container
    replyContainer.appendChild(replyInput);
    replyContainer.appendChild(submitButton);
    
    // Append the reply container to the parent comment
    parentComment.appendChild(replyContainer);
    
    // Handle the submit button click event
    submitButton.addEventListener('click', () => {
        const replyContent = replyInput.value;
        if (replyContent) {
            postComment(replyContent, parentId);
            // Remove the reply container after submitting
            parentComment.removeChild(replyContainer);
        } else {
            alert('Reply cannot be empty.');
        }
    });
}


function timeSince(date) {
    const now = new Date();
    const past = new Date(date);

    console.log("Before: " + past);
    // Convert past date to Singapore time
    const singaporeTimeZone = 'Asia/Singapore';
    const singaporeDate = dateFnsTz.utcToZonedTime(past, singaporeTimeZone);

    console.log("After: " + singaporeDate);
    const seconds = Math.floor((now - singaporeDate) / 1000);
    // Log the input date
    console.log("Input date:", date);
    console.log("Now:" + now);
    console.log("Past:" + singaporeDate);
    console.log(seconds);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    return Math.floor(seconds) + ' seconds ago';
}