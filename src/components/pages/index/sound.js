////////////////////////////////////////////////////////// music
// фонова музика
const soundBtn = document.querySelector(".menu__sound");

const bgMusic = new Audio("@/../../assets/sound/main_bg.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.05;

const hoverSound = new Audio("@/../../assets/sound/btn_hover.mp3");
hoverSound.volume = 0.4;
hoverSound.preload = "auto";


soundBtn.addEventListener("click", (e) => {
    e.preventDefault();

    if (bgMusic.muted) {
        // Вмикаємо звук
        bgMusic.muted = false;
        bgMusic.play().catch(() => {
            // браузер може мовчки відмовити
        });
        soundBtn.classList.remove("muted");
    } else {
        // Вимикаємо звук
        bgMusic.muted = true;
        soundBtn.classList.add("muted");
    }
});

//////////////////////////////////////// звуки на кнопках unlockAudio викликається при підтвердженні віку, щоб розблокувати звуки в браузері

let lastHoverTime = 0;
const HOVER_DELAY = 80; // ms
let audioUnlocked = false;

export function unlockAudio() {
    if (audioUnlocked) return;
    // короткий play для розблокування
    hoverSound.volume = 0;
    hoverSound
        .play()
        .then(() => {
            hoverSound.pause();
            hoverSound.currentTime = 0;
            hoverSound.volume = 0.4;
            audioUnlocked = true;

            if (!bgMusic.muted) {
                bgMusic.play().catch(() => {});
            }
        })
        .catch(() => {});
}


function playHoverSound() {
    if (bgMusic.muted || !audioUnlocked) return; // якщо звук вимкнений — мовчимо

    const now = Date.now();
    if (now - lastHoverTime < HOVER_DELAY) return;

    lastHoverTime = now;
    hoverSound.currentTime = 0;
    hoverSound.play().catch(() => {});
}

document
    .querySelectorAll(
        ".menu__sound, .menu__settings, .menu__info, .menu__minus, .menu__button-spin, .menu__plus",
    )
    .forEach((el) => {
        el.addEventListener("mouseenter", playHoverSound);
    });

//spin sound
const spinSound = new Audio("@/../../assets/sound/btn_click.mp3");
spinSound.volume = 0.6;
spinSound.preload = "auto";

let lastSpinTime = 0;
const SPIN_SOUND_DELAY = 300;

function playSpinSound() {
    if (bgMusic.muted || !audioUnlocked) return;

    const now = Date.now();
    if (now - lastSpinTime < SPIN_SOUND_DELAY) return;

    lastSpinTime = now;
    spinSound.currentTime = 0;
    spinSound.play().catch(() => {});
}

const spinBtn = document.querySelector(".menu__button-spin");

spinBtn.addEventListener("click", () => {
    playSpinSound();
});
