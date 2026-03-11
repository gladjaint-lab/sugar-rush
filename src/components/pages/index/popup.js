import p5 from "p5";
import { unlockAudio } from "./sound.js";

/* ================= POPUP & 18+ ================= */
const popup = document.querySelector(".popup");
const popupTitle = popup.querySelector(".popup__title");
const popupText = popup.querySelector(".popup__text");
const popupBtn = popup.querySelector(".cta-button");

export function openAgePopup() {
    popup.dataset.mode = "age";

    popupTitle.textContent = "Are you 18+?";
    popupText.textContent = "You must confirm that you are over 18 years old.";
    popupBtn.textContent = "Yes, I am 18+";
    popupBtn.href = "#";

    popup.classList.add("show");
}

popupBtn.addEventListener("click", (e) => {
    if (popup.dataset.mode === "age") {
        e.preventDefault();

        unlockAudio();
        
        popup.classList.remove("show");
        popup.dataset.mode = "";
    }
});

/* ================= POPUP & CONFETTI ================= */
let confettiP5 = null;
let confettiContainer = null;

function startConfetti(container) {
    if (confettiP5) return; // вже запущено

    confettiContainer = document.createElement("div");
    confettiContainer.className = "confetti-canvas";
    container.appendChild(confettiContainer);

    confettiP5 = new p5((p) => {
        let confettis;

        const themeCouleur = [
            "#f44336",
            "#e91e63",
            "#9c27b0",
            "#673ab7",
            "#3f51b5",
            "#2196f3",
            "#03a9f4",
            "#00bcd4",
            "#009688",
            "#4CAF50",
            "#8BC34A",
            "#CDDC39",
            "#FFEB3B",
            "#FFC107",
            "#FF9800",
            "#FF5722",
        ];

        class Particule {
            constructor(parent) {
                this.parent = parent;
                this.gravite = parent.gravite;
                this.reinit();
                this.forme = p.round(p.random(0, 1));
            }

            reinit() {
                this.position = this.parent.position.copy();
                this.position.y = p.random(-20, -100);
                this.position.x = p.random(0, p.width);
                this.velocite = p.createVector(p.random(-6, 6), p.random(-10, 2));
                this.friction = p.random(0.98, 0.995);
                this.taille = p.round(p.random(6, 14));
                this.moitie = this.taille / 2;
                this.couleur = p.color(p.random(themeCouleur));
            }

            rendu() {
                this.velocite.add(this.gravite);
                this.velocite.mult(this.friction);
                this.position.add(this.velocite);

                if (this.position.y > p.height || this.position.x < -20 || this.position.x > p.width + 20) {
                    this.reinit();
                }

                const squash = 0.5 + Math.sin(this.velocite.y * 20) * 0.5;

                p.push();
                p.translate(this.position.x, this.position.y);
                p.rotate(this.velocite.x * 2);
                p.scale(1, squash);
                p.noStroke();
                p.fill(this.couleur);

                if (this.forme === 0) {
                    p.rect(-this.moitie, -this.moitie, this.taille, this.taille);
                } else {
                    p.ellipse(0, 0, this.taille);
                }

                p.pop();
            }
        }

        class Systeme {
            constructor(count) {
                this.position = p.createVector(p.width / 2, -40);
                this.gravite = p.createVector(0, 0.15);
                this.particules = Array.from({ length: count }, () => new Particule(this));
            }

            rendu() {
                this.particules.forEach((p) => p.rendu());
            }
        }

        p.setup = () => {
            p.createCanvas(p.windowWidth, p.windowHeight);
            p.frameRate(60);
            confettis = new Systeme(450);
        };

        p.draw = () => {
            p.clear();
            confettis.rendu();
        };

        p.windowResized = () => {
            p.resizeCanvas(p.windowWidth, p.windowHeight);
            confettis.position = p.createVector(p.width / 2, -40);
        };
    }, confettiContainer);
}

function stopConfetti() {
    if (!confettiP5) return;

    confettiP5.remove();
    confettiP5 = null;

    if (confettiContainer) {
        confettiContainer.remove();
        confettiContainer = null;
    }
}

export function openPopup() {
    const popup = document.querySelector(".popup");

    popupTitle.textContent = "Congratulations!";
    popupText.textContent = "Ready to continue playing?";
    popupBtn.textContent = "Download Now";
    popupBtn.href = "#";

    setTimeout(() => {
        popup.classList.add("show");
        startConfetti(popup);
    }, 100); //time open popup
}

export function closePopup() {
    popup.classList.remove("show");
    stopConfetti();
}
