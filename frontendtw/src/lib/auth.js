export function getToken() {
    return localStorage.getItem("token");
}

export function setToken(token) {
    localStorage.setItem("token", token);
}

export function removeToken() {
    localStorage.removeItem("token");
}

export function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/login";
}
