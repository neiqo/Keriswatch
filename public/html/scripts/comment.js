let userToken = localStorage.getItem('token') || null;  // This will store the user's JWT after login
const urlParams = new URLSearchParams(window.location.search);
const articleID = urlParams.get('id');

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
    const response = await fetch(`api/${articleID}/comments`);
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
    commentElement.style.marginLeft = `${level * 20}px`;
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
            ${level < 2 ? '<span class="reply">Reply</span>' : ''}
        </div>
    `;

    commentElement.querySelector('.upvote').addEventListener('click', () => upvoteComment(comment.id));
    commentElement.querySelector('.downvote').addEventListener('click', () => downvoteComment(comment.id));
    if (comment.canDelete) {
        commentElement.querySelector('.delete').addEventListener('click', () => deleteComment(comment.id));
    }
    if (level < 2) {
        commentElement.querySelector('.reply').addEventListener('click', () => replyToComment(comment.id));
    }

    return commentElement;
}

async function postComment(content, parentId = null) {
    const response = await fetch(`api/comments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ articleID, content, parentId })
    });
    if (response.ok) {
        loadComments();
    }
}

async function upvoteComment(commentId) {
    const response = await fetch(`api/comments/${commentId}/upvote`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${userToken}` }
    });
    if (response.ok) {
        loadComments();
    }
}

async function downvoteComment(commentId) {
    const response = await fetch(`api/comments/${commentId}/downvote`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${userToken}` }
    });
    if (response.ok) {
        loadComments();
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
//     const commentsContainer = document.getElementById('comments-container');

//     async function fetchComments(articleId) {
//         const response = await fetch(`/api/comments?articleId=${articleId}`);
//         const comments = await response.json();
//         renderComments(comments);
//     }

//     function renderComment(comment, depth = 0) {
//         if (depth > 2) return ''; // Limit to 3 levels deep

//         const repliesHtml = comment.replies.map(reply => renderComment(reply, depth + 1)).join('');

//         return `
//             <div class="comment" data-id="${comment.commentId}" style="margin-left: ${depth * 20}px;">
//                 <div class="comment-content">
//                     <p>${comment.content}</p>
//                     <div class="comment-actions">
//                         <button class="upvote">Upvote (${comment.upvotes})</button>
//                         <button class="downvote">Downvote (${comment.downvotes})</button>
//                         <button class="reply">Reply</button>
//                     </div>
//                 </div>
//                 <div class="replies">
//                     ${repliesHtml}
//                 </div>
//                 <div class="reply-form">
//                     <textarea placeholder="Write a reply..."></textarea>
//                     <button class="submit-reply">Submit</button>
//                     <button class="cancel-reply">Cancel</button>
//                 </div>
//             </div>
//         `;
//     }

//     function renderComments(comments) {
//         commentsContainer.innerHTML = comments.map(comment => renderComment(comment)).join('');
//         attachEventListeners();
//     }

//     function attachEventListeners() {
//         document.querySelectorAll('.upvote').forEach(button => {
//             button.addEventListener('click', handleUpvote);
//         });

//         document.querySelectorAll('.downvote').forEach(button => {
//             button.addEventListener('click', handleDownvote);
//         });

//         document.querySelectorAll('.reply').forEach(button => {
//             button.addEventListener('click', handleReply);
//         });

//         document.querySelectorAll('.submit-reply').forEach(button => {
//             button.addEventListener('click', handleSubmitReply);
//         });

//         document.querySelectorAll('.cancel-reply').forEach(button => {
//             button.addEventListener('click', handleCancelReply);
//         });
//     }

//     function handleUpvote(event) {
//         const commentElement = event.target.closest('.comment');
//         const commentId = commentElement.dataset.id;
//         // Increment upvotes in database and re-render
//         updateCommentData(commentId, 'upvote');
//     }

//     function handleDownvote(event) {
//         const commentElement = event.target.closest('.comment');
//         const commentId = commentElement.dataset.id;
//         // Increment downvotes in database and re-render
//         updateCommentData(commentId, 'downvote');
//     }

//     function handleReply(event) {
//         const commentElement = event.target.closest('.comment');
//         const replyForm = commentElement.querySelector('.reply-form');
//         replyForm.style.display = 'block';
//     }

//     async function handleSubmitReply(event) {
//         const replyForm = event.target.closest('.reply-form');
//         const commentElement = event.target.closest('.comment');
//         const commentId = commentElement.dataset.id;
//         const textarea = replyForm.querySelector('textarea');
//         const replyContent = textarea.value;
//         if (replyContent) {
//             // Add reply to database and re-render
//             await addReplyToCommentData(commentId, replyContent);
//             fetchComments(1); // Assuming articleId is 1 for now
//         }
//     }

//     function handleCancelReply(event) {
//         const replyForm = event.target.closest('.reply-form');
//         replyForm.style.display = 'none';
//     }

//     async function updateCommentData(commentId, action) {
//         await fetch(`/api/comments/${commentId}/${action}`, { method: 'POST' });
//         fetchComments(1); // Assuming articleId is 1 for now
//     }

//     async function addReplyToCommentData(commentId, replyContent) {
//         await fetch(`/api/comments`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//                 userId: 1, // Assuming userId is 1 for now
//                 articleId: 1, // Assuming articleId is 1 for now
//                 content: replyContent,
//                 parentId: commentId,
//                 createdAt: new Date().toISOString(),
//                 upvotes: 0,
//                 downvotes: 0
//             })
//         });
//     }

//     fetchComments(1); // Assuming articleId is 1 for now
// });


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
