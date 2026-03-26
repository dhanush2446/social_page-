const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const loginCall = async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error((await res.json()).message || 'Login failed');
    return res.json();
};

export const signupCall = async (name, email, password) => {
    const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) throw new Error((await res.json()).message || 'Signup failed');
    return res.json();
};

export const fetchPosts = async (token) => {
    const res = await fetch(`${API_URL}/posts`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch posts');
    return res.json();
};

export const createPost = async (token, postData) => {
    const res = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(postData),
    });
    if (!res.ok) throw new Error('Failed to create post');
    return res.json();
};

export const likePost = async (token, postId) => {
    const res = await fetch(`${API_URL}/posts/${postId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to like post');
    return res.json();
};

export const commentPost = async (token, postId, text) => {
    const res = await fetch(`${API_URL}/posts/${postId}/comment`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error('Failed to add comment');
    return res.json();
};

export const deleteComment = async (token, postId, commentId) => {
    const res = await fetch(`${API_URL}/posts/${postId}/comment/${commentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to delete comment');
    return res.json();
};

export const deletePost = async (token, postId) => {
    const res = await fetch(`${API_URL}/posts/${postId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to delete post');
    return res.json();
};

export const followUser = async (token, userId) => {
    const res = await fetch(`${API_URL}/posts/follow/${userId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error ${res.status}`);
    }
    return res.json();
};

export const searchUsers = async (token, query) => {
    const res = await fetch(`${API_URL}/auth/search?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Search failed');
    return res.json();
};

export const votePoll = async (token, postId, optionIndex) => {
    const res = await fetch(`${API_URL}/posts/${postId}/vote/${optionIndex}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to vote');
    return res.json();
};

export const sharePost = async (token, postId) => {
    const res = await fetch(`${API_URL}/posts/${postId}/share`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to share');
    return res.json();
};

export const fetchMe = async (token) => {
    const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch user data');
    return res.json();
};

export const readNotifications = async (token) => {
    const res = await fetch(`${API_URL}/auth/notifications/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to mark notifications as read');
    return res.json();
};
