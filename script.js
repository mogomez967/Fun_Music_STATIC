const clientId = "a01350278d2740f0bb2eef69e96778bd";
const params = new URLSearchParams(window.location.search);
const code = params.get("code");

if (!code) {
    redirectToAuthCodeFlow(clientId);
} else {
    const accessToken = await getAccessToken(clientId, code);
    const profile = await fetchProfile(accessToken);
    console.log(profile);
    populateUI(profile);
}

export async function redirectToAuthCodeFlow(clientId) {
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", "https://df66aedd-ceeb-4930-baa4-edaea5e0ce95-00-19x9r9itsh327.kirk.replit.dev/?code=AQCizowFX3rpVoHcb8jKpsckn-M2u3mS3Rl51h721qIyBBCZ5nkdmuJ-mdG20I444xhl7YBpdtVGxijk5o9hDIJqDLxRHH3-WHqMWhFGUYURT3Z__63QJzof6Caabpv-2n1e82FgStJEZwQDViara4p1tn7b50DCVDwGqORTqhYK-W64iEXWtRtjL4kUjIVStcghKQZBFoNB5HGqpLhFkt4VeMCsEbIFN2ebotuk1RwtYL02KePvOLafjFfAPfuBG_IzJaz9FlClhfNNzfHcsF-NDownsQ-LmJT4G0EYBWfIZ5bqO2YdP4-QLtlIeoMt46mThB6AeS26jojetifrRhWehSYmDGL_AA");
    params.append("scope", "user-read-private user-read-email");
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

function generateCodeVerifier(length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function generateCodeChallenge(codeVerifier) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}


export async function getAccessToken(clientId, code) {
    const verifier = localStorage.getItem("verifier");

    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");
    params.append("client_id", clientId);
    params.append("client_secret", "cd7ea2286af24770af4ae90524cbf3a7")
    // params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", "https://df66aedd-ceeb-4930-baa4-edaea5e0ce95-00-19x9r9itsh327.kirk.replit.dev/?code=AQCizowFX3rpVoHcb8jKpsckn-M2u3mS3Rl51h721qIyBBCZ5nkdmuJ-mdG20I444xhl7YBpdtVGxijk5o9hDIJqDLxRHH3-WHqMWhFGUYURT3Z__63QJzof6Caabpv-2n1e82FgStJEZwQDViara4p1tn7b50DCVDwGqORTqhYK-W64iEXWtRtjL4kUjIVStcghKQZBFoNB5HGqpLhFkt4VeMCsEbIFN2ebotuk1RwtYL02KePvOLafjFfAPfuBG_IzJaz9FlClhfNNzfHcsF-NDownsQ-LmJT4G0EYBWfIZ5bqO2YdP4-QLtlIeoMt46mThB6AeS26jojetifrRhWehSYmDGL_AA");
    params.append("code_verifier", verifier);

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
    });

    const { access_token } = await result.json();
    return access_token;
}

async function fetchProfile(token) {
    const result = await fetch("https://api.spotify.com/v1/me", {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    return await result.json();
}


function populateUI(profile) {
    document.getElementById("displayName").innerText = profile.display_name;
    if (profile.images[0]) {
        const profileImage = new Image(200, 200);
        profileImage.src = profile.images[0].url;
        document.getElementById("avatar").appendChild(profileImage);
        document.getElementById("imgUrl").innerText = profile.images[0].url;
    }
    document.getElementById("id").innerText = profile.id;
    document.getElementById("email").innerText = profile.email;
    document.getElementById("uri").innerText = profile.uri;
    document.getElementById("uri").setAttribute("href", profile.external_urls.spotify);
    document.getElementById("url").innerText = profile.href;
    document.getElementById("url").setAttribute("href", profile.href);
}