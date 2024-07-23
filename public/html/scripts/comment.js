
let userToken = localStorage.getItem('token') || null;  // This will store the user's JWT after login

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

async function loadComments() {
    const articleId = 1; // Replace with the actual article ID
    const response = await fetch(`api/${articleId}/comments`);
    const comments = await response.json();
    displayComments(comments);
}

function displayComments(comments, parentElement = document.getElementById('comments')) {
    parentElement.innerHTML = '';
    comments.forEach(comment => {
        const commentElement = createCommentElement(comment);
        parentElement.appendChild(commentElement);
        if (comment.replies) {
            const replyContainer = document.createElement('div');
            replyContainer.classList.add('reply');
            displayComments(comment.replies, replyContainer);
            parentElement.appendChild(replyContainer);
        }
    });
}

function createCommentElement(comment) {
    const commentElement = document.createElement('div');
    commentElement.classList.add('comment');
    commentElement.innerHTML = `
        <div class="meta">
            <img src="${comment.profilePicture}" alt="${comment.username}">
            <span class="username">${comment.username} ${comment.role === 'Admin' ? '(ADMIN)' : ''}</span>
            <span class="timestamp">${timeSince(new Date(comment.timestamp))}</span>
        </div>
        <div class="content">${comment.content}</div>
        <div class="actions">
            <span class="vote upvote">▲ ${comment.upvotes}</span>
            <span class="vote downvote">▼ ${comment.downvotes}</span>
            ${comment.canDelete ? '<span class="delete">Delete</span>' : ''}
            <span class="reply">Reply</span>
        </div>
    `;

    commentElement.querySelector('.upvote').addEventListener('click', () => upvoteComment(comment.id));
    commentElement.querySelector('.downvote').addEventListener('click', () => downvoteComment(comment.id));
    if (comment.canDelete) {
        commentElement.querySelector('.delete').addEventListener('click', () => deleteComment(comment.id));
    }
    commentElement.querySelector('.reply').addEventListener('click', () => replyToComment(comment.id));

    return commentElement;
}

async function postComment(content, parentId = null) {
    const articleId = 1; // Replace with the actual article ID
    const response = await fetch(`${API_URL}/comments`, {
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
}

async function upvoteComment(commentId) {
    const response = await fetch(`${API_URL}/comments/${commentId}/upvote`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${userToken}` }
    });
    if (response.ok) {
        loadComments();
    }
}

async function downvoteComment(commentId) {
    const response = await fetch(`${API_URL}/comments/${commentId}/downvote`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${userToken}` }
    });
    if (response.ok) {
        loadComments();
    }
}

async function deleteComment(commentId) {
    const response = await fetch(`${API_URL}/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${userToken}` }
    });
    if (response.ok) {
        loadComments();
    }
}

function replyToComment(parentId) {
    const replyContent = prompt('Enter your reply:');
    if (replyContent) {
        postComment(replyContent, parentId);
    }
}

function timeSince(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
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


// document.addEventListener('DOMContentLoaded', () => {
//     const articleId = 1; // Assuming this is the article ID
//     const userId = 1; // Replace with the logged-in user's ID
//     const role = 'Admin'; // Replace with the logged-in user's role

//     const commentsContainer = document.getElementById('comments-container');
//     const commentContent = document.getElementById('comment-content');
//     const submitComment = document.getElementById('submit-comment');

//     async function fetchComments() {
//         const response = await fetch(`/api/${articleId}/comments`);
//         const comments = await response.json();
//         displayComments(comments);
//     }

//     function displayComments(comments, parentElement = commentsContainer, parentId = null) {
//         comments.forEach(comment => {
//             if (comment.parentId === parentId) {
//                 const commentElement = createCommentElement(comment);
//                 parentElement.appendChild(commentElement);
//                 displayComments(comments, commentElement.querySelector('.replies'), comment.commentId);
//             }
//         });
//     }

//     function createCommentElement(comment) {
//         const commentElement = document.createElement('div');
//         commentElement.classList.add('comment');
//         commentElement.innerHTML = `
//             <img src="${comment.profilePicture}" alt="${comment.username}'s profile picture" width="50" height="50">
//             <div class="comment-content">
//                 <strong>${comment.username}</strong>
//                 <p>${comment.content}</p>
//                 <div class="comment-actions">
//                     <span class="upvote">Upvote (${comment.upvotes})</span>
//                     <span class="downvote">Downvote (${comment.downvotes})</span>
//                     ${comment.userId === userId || role === 'Admin' ? '<span class="delete">Delete</span>' : ''}
//                     <span class="reply">Reply</span>
//                 </div>
//                 <div class="replies"></div>
//             </div>
//         `;

//         commentElement.querySelector('.upvote').addEventListener('click', () => upvoteComment(comment.commentId));
//         commentElement.querySelector('.downvote').addEventListener('click', () => downvoteComment(comment.commentId));
//         if (commentElement.querySelector('.delete')) {
//             commentElement.querySelector('.delete').addEventListener('click', () => deleteComment(comment.commentId));
//         }
//         commentElement.querySelector('.reply').addEventListener('click', () => showReplyForm(commentElement, comment.commentId));

//         return commentElement;
//     }

//     function showReplyForm(commentElement, parentId) {
//         const replyForm = document.createElement('div');
//         replyForm.classList.add('reply');
//         replyForm.innerHTML = `
//             <textarea placeholder="Write a reply..."></textarea>
//             <button>Submit</button>
//         `;
//         replyForm.querySelector('button').addEventListener('click', () => {
//             const replyContent = replyForm.querySelector('textarea').value;
//             submitCommentOrReply(replyContent, parentId);
//             replyForm.remove();
//         });

//         commentElement.querySelector('.replies').appendChild(replyForm);
//     }

//     async function submitCommentOrReply(content, parentId = null) {
//         const response = await fetch(`/api/comments`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({
//                 userId,
//                 articleId,
//                 content,
//                 parentId
//             })
//         });
//         const result = await response.json();
//         if (result.commentId) {
//             fetchComments();
//         }
//     }

//     async function upvoteComment(commentId) {
//         // Implement upvote functionality
//     }

//     async function downvoteComment(commentId) {
//         // Implement downvote functionality
//     }

//     async function deleteComment(commentId) {
//         // Implement delete functionality
//     }

//     submitComment.addEventListener('click', () => {
//         const content = commentContent.value;
//         if (content) {
//             submitCommentOrReply(content);
//             commentContent.value = '';
//         }
//     });

//     fetchComments();
// });
