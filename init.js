const userid = config.userid;
let acts = [];

let title = "loading...";
let titlei = 1;
let wait = 0;

setInterval(() => {
  document.title = title.substring(0, titlei);

  if(titlei == title.length) {
    if(wait == 3) {
      titlei = 1;
      wait = 0;
    }
    wait++;
  } else {
    titlei++;
  }
}, 400)

const load = () => {
    lanyard({
        userId: userid,
        socket: true,
        onPresenceUpdate: update
    });
    console.log("Lanyard init");
}

const update = data => {
    acts = data.activities;
    console.log(data);
    draw(data);
}

const draw = data => {
    const statusElem = document.getElementById("status");
    
    const userinfo = document.getElementById("margin");
    const actsWrapper = document.querySelector(".activities");
    let toRemove = [];
    actsWrapper.childNodes.forEach(node => {
        if(acts.filter(act => act.id == node).length === 0) toRemove.push(node);
    });
    toRemove.forEach(node => actsWrapper.removeChild(node));

    acts.forEach(act => {

        if(act.type === 4) {
            if(act.state && act.emoji) {
                statusElem.innerText = `${act.emoji.name} ${act.state}`;
            }
        } else {
            const isSpotify = act.id === "spotify:1" && data.spotify;

            // <div class="activity" id="00">
            const actElem = document.createElement("div");
            actElem.classList.add("activity");
            actElem.id = act.id;

            // <div class="act-images">
            const actImageWrapper = document.createElement("act-images");
            actImageWrapper.classList.add("act-images");
            
            // <img class="largeimage" draggable="false" width="64" height="64" src="" />
            const largeImageElem = document.createElement("img");
            largeImageElem.classList.add("largeimage");
            largeImageElem.draggable = false;
            largeImageElem.width = largeImageElem.height = 64;
            // spotify
            if(isSpotify) {
                largeImageElem.src = data.spotify.album_art_url;
            } else {
                // everything after "mp:" is the image id
                // mp:external/ftBjuYHxeAs2FW1lMnr-_BxOSttEZIc1aAzg_W3nFlM/https/raw.githubusercontent.com/LeonardSSH/vscord/main/assets/icons/js.png
                
                if(act.assets) {
                    if(act.assets.large_image) {
                        const imageid = act.assets.large_image.substring(3);
                        largeImageElem.src = `https://media.discordapp.net/${imageid}`;
                    }
                } else {
                    // no easy way of getting the icons from the discord api
                    largeImageElem.src = `https://dcdn.dstn.to/app-icons/${act.application_id}`;
                }
            }
            actImageWrapper.appendChild(largeImageElem);

           

            // add class="act-images" to class="activity"
            actElem.appendChild(actImageWrapper);

            const sortActivity = document.getElementById("sortactivity");

            // <span class="act-name">placeholder name</span>
            const nameSpan = document.createElement("span");
            nameSpan.classList.add("act-name");
            // <span class="act-details">placeholder details</span>
            const detailsSpan = document.createElement("span");
            detailsSpan.classList.add("act-details");
            // <span class="act-state">placeholder state</span>
            const stateSpan = document.createElement("span");
            stateSpan.classList.add("act-state");
            
            if(isSpotify) {
                nameSpan.innerText = `${data.spotify.song}`;
                detailsSpan.innerText = `on ${data.spotify.album}`;
                stateSpan.innerText = `by ${data.spotify.artist}`;
                const sortActivity = document.getElementById("sortactivity");
            }
            else {
                nameSpan.innerText = act.name ? act.name : "";
                const start = act.timestamps.start;
                const exp_time = Math.floor(Date.now() / 1000);
                const diff = (exp_time * 1000) - start;
                const timestamp = formatTime(diff);
                detailsSpan.innerText = act.details ? act.details : timestamp;
                stateSpan.innerText = act.state ? act.state : "";
            }
            actElem.appendChild(nameSpan);
            actElem.appendChild(detailsSpan);
            actElem.appendChild(stateSpan);
            
            // add class="activity" to activities
            actsWrapper.appendChild(actElem);
        }
    });
    userinfo.style.marginBottom = actsWrapper.children.length === 0 ? "0" : "1em";
}

const formatTime = (ms) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / 1000 / 60) % 60);
    const hours = Math.floor((ms / 1000 / 3600) % 60);

    if(hours > 0) {
        return `for ${hours} hour(s)`;
    }
    if(minutes > 0) {
        return `for ${minutes} minute(s)`;
    }
    if(seconds > 0) {
        return `for ${seconds} second(s)`;
    }
}


// start the websocket to automatically fetch the new details on presence update
window.addEventListener("load", load);