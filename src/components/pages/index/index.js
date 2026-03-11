import "./sound.js";
import { openPopup, openAgePopup } from "./popup";
/* ================= CONFIG ================= */
const ROWS = 7;
const COLS = 7;

const ICON_PATH = "assets/img/icon/";
const SYMBOLS = [
    "pic_01.png",
    "pic_02.png",
    "pic_03.png",
    "pic_04.png",
    "pic_05.png",
    "pic_06.png",
    "pic_07.png",
    "pic_08.png",
    "pic_09.png",
];

const WIN_TYPE = {
    NONE: "none",
    SMALL: "small",
    BIG: "big",
};

const DROP_TIME = 100;
const DROP_DELAY = 0.07;

const HIGHLIGHT_DELAY = 5400; // dont use now
const DISAPPEAR_TIME = 450; // time of empty  doors, час пустих клітинок
const WIN_TIME = 1000; // time win element animation

/* ================= ELEMENTS ================= */
const drum = document.querySelector(".drum");
const oldLayer = drum.querySelector(".drum-layer--old .drum-columns");
const newLayer = drum.querySelector(".drum-layer--new .drum-columns");
const spinBtn = document.querySelector(".menu__button-spin");

/* ================= STATE ================= */
let spinning = false;
let spinCount = 0;
let currentGrid = [];


/* ================= START POPUP 18+ ================= */
window.addEventListener("load", () => {
    openAgePopup();
});


/* ================= HELPERS ================= */
function randSymbol() {
    return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

/* ================= BUTTON SPIN LOGIC ================= */
function disableSpinButton() {
    spinBtn.classList.add("disabled");
}

function enableSpinButton() {
    spinBtn.classList.remove("disabled");
}

/* ================= WIN ================= */
function getWinType(spinCount) {
    if (spinCount === 2) return WIN_TYPE.SMALL;
    if (spinCount === 3) return WIN_TYPE.BIG;
    return WIN_TYPE.NONE;
}

function generateGridWithExactClusters(exactClusters = 1) {
    let grid;
    let clusters;

    do {
        grid = generateGrid();
        clusters = findClusters(grid);
    } while (clusters.length !== exactClusters);

    return grid;
}

function generateGridWithLimitedWin(minClusters = 1) {
    let grid;
    do {
        grid = generateGrid();
    } while (findClusters(grid).length < minClusters);
    return grid;
}

function generateGridByWinType(winType) {
    switch (winType) {
        case WIN_TYPE.SMALL:
            // 🎯 РІВНО 1 кластер (мінімальний виграш)
            return generateGridWithExactClusters(1);

        case WIN_TYPE.BIG:
            // 💥 3 або більше кластерів
            return generateGridWithLimitedWin(3);

        default:
            return generateGridWithoutWin();
    }
}

/* ================= GRID GENERATION ================= */
function generateGrid() {
    const grid = [];
    for (let c = 0; c < COLS; c++) {
        const col = [];
        for (let r = 0; r < ROWS; r++) {
            col.push(randSymbol());
        }
        grid.push(col);
    }
    return grid;
}

/* --- генерація БЕЗ виграшу --- */
function generateGridWithoutWin() {
    let grid;
    do {
        grid = generateGrid();
    } while (findClusters(grid).length > 0);
    return grid;
}

/* --- генерація З ГАРАНТОВАНИМ виграшем --- */
function generateGridGuaranteedWin() {
    let grid;
    do {
        grid = generateGrid();
    } while (findClusters(grid).length === 0);
    return grid;
}

/* ================= RENDER ================= */
function renderLayer(layer, grid, animate = false) {
    layer.innerHTML = "";

    grid.forEach((colData, colIndex) => {
        const col = document.createElement("div");
        col.className = "drum-column";

        if (animate) {
            col.classList.add("drop-in");
            col.style.animationDelay = `${colIndex * DROP_DELAY}s`;
        }

        colData.forEach((symbol) => {
            const item = document.createElement("div");
            item.className = "drum__item";

            const inner = document.createElement("div");
            inner.className = "drum__item-inner";

            const img = document.createElement("img");
            img.src = ICON_PATH + symbol;
            img.alt = "Icon game";

            inner.appendChild(img);
            item.appendChild(inner);
            col.appendChild(item);
        });

        layer.appendChild(col);
    });
}

/* ================= CLUSTER LOGIC ================= */
function findClusters(grid) {
    const visited = Array.from({ length: COLS }, () => Array(ROWS).fill(false));

    const clusters = [];

    function dfs(c, r, symbol, cluster) {
        if (c < 0 || c >= COLS || r < 0 || r >= ROWS || visited[c][r] || grid[c][r] !== symbol) return;

        visited[c][r] = true;
        cluster.push({ c, r });

        dfs(c + 1, r, symbol, cluster);
        dfs(c - 1, r, symbol, cluster);
        dfs(c, r + 1, symbol, cluster);
        dfs(c, r - 1, symbol, cluster);
    }

    for (let c = 0; c < COLS; c++) {
        for (let r = 0; r < ROWS; r++) {
            if (!visited[c][r]) {
                const cluster = [];
                dfs(c, r, grid[c][r], cluster);
                if (cluster.length >= 3) {
                    clusters.push(cluster);
                }
            }
        }
    }

    return clusters;
}

/* ================= HIGHLIGHT ================= */
function highlightClusters(clusters) {
    newLayer.querySelectorAll(".drum__item.win").forEach((el) => el.classList.remove("win"));

    clusters.forEach((cluster) => {
        cluster.forEach(({ c, r }) => {
            const col = newLayer.children[c];
            if (!col) return;
            const item = col.children[r];
            if (!item) return;

            item.classList.add("win");
        });
    });
}

/* squash при приземленні */
function animateLandingPerColumn() {
    const columns = newLayer.querySelectorAll(".drum-column");

    columns.forEach((col, colIndex) => {
        const items = col.querySelectorAll(".drum__item");
        if (!items.length) return;

        const landingTime = DROP_TIME + colIndex * DROP_DELAY * 1000;

        setTimeout(() => {
            const total = items.length;

            items.forEach((item, index) => {
                // index 0 = верх, last = низ
                const depth = (index + 1) / total;

                // сила ефекту (низ сильніше)
                const scale = 0.1 * depth; //  squash
                const shift = 3.2 * Math.pow(depth, 2); // осідання

                item.style.setProperty("--land-scale", scale.toFixed(3));
                item.style.setProperty("--land-shift", `${shift.toFixed(2)}%`);

                item.classList.remove("land");
                void item.offsetWidth;
                item.classList.add("land");
            });
        }, landingTime);
    });
}

/* ================= WIN CALCULATION ================= */
function calculateClusterWin(cluster) {
    const baseValue = 10; // умовна ціна символа
    return cluster.length * baseValue;
}

function createWinNumber(amount, x, y) {
    const el = document.createElement("div");
    el.className = "win-number";
    el.textContent = `+${amount}`;

    el.style.left = `${x}px`;
    el.style.top = `${y}px`;

    document.body.appendChild(el);

    // старт анімації
    requestAnimationFrame(() => {
        el.classList.add("show");
    });

    // автознищення
    setTimeout(() => {
        el.classList.add("hide");
        setTimeout(() => el.remove(), 500);
    }, 900);
}

function getClusterCenter(cluster) {
    let sumX = 0;
    let sumY = 0;
    let count = 0;

    cluster.forEach(({ c, r }) => {
        const col = newLayer.children[c];
        if (!col) return;
        const item = col.children[r];
        if (!item) return;

        const rect = item.getBoundingClientRect();
        sumX += rect.left + rect.width / 2;
        sumY += rect.top + rect.height / 2;
        count++;
    });

    return {
        x: sumX / count,
        y: sumY / count,
    };
}

/* ================= DISAPPEAR ANIMATION ================= */
function animateClusterDisappear(clusters) {
    clusters.forEach((cluster) => {
        cluster.forEach(({ c, r }) => {
            const col = newLayer.children[c];
            if (!col) return;

            const item = col.children[r];
            if (!item) return;

            item.classList.add("disappear");
        });
    });
}

/* ================= CASCADE LOGIC ================= */
function applyCascade(grid, clusters) {
    const newGrid = grid.map((col) => [...col]);

    clusters.forEach((cluster) => {
        cluster.forEach(({ c, r }) => {
            newGrid[c][r] = null; // видаляємо
        });
    });

    for (let c = 0; c < COLS; c++) {
        const col = newGrid[c].filter((v) => v !== null);
        const missing = ROWS - col.length;

        const newSymbols = Array.from({ length: missing }, randSymbol);

        newGrid[c] = [...newSymbols, ...col];
    }

    return newGrid;
}

/* ================= IMPROVED CASCADE ANIMATION ================= */
function animateCascade(oldGridWithNulls, newGrid) {
    const columns = newLayer.querySelectorAll(".drum-column");

    columns.forEach((col, c) => {
        const oldCol = oldGridWithNulls[c];
        const newCol = newGrid[c];

        // Скільки елементів видалено
        const removedCount = oldCol.filter((s) => s === null).length;
        if (removedCount === 0) return;

        // console.log(`Column ${c}: removed ${removedCount} items`);
        // console.log('Old column:', oldCol.map((s, i) => s ? `${i}:${s}` : `${i}:NULL`));
        // console.log('New column:', newCol.map((s, i) => `${i}:${s}`));

        // 1️⃣ ЗБЕРІГАЄМО ПОСИЛАННЯ НА СТАРІ ЕЛЕМЕНТИ
        const oldItems = [...col.children];

        // 2️⃣ ПОВНІСТЮ ОЧИЩАЄМО КОЛОНКУ
        col.innerHTML = "";

        // 3️⃣ СТВОРЮЄМО НОВУ СТРУКТУРУ (всі 7 елементів в правильному порядку)
        const newItems = [];

        newCol.forEach((symbol, rowIndex) => {
            const item = document.createElement("div");
            item.className = "drum__item";

            const inner = document.createElement("div");
            inner.className = "drum__item-inner";

            const img = document.createElement("img");
            img.src = ICON_PATH + symbol;
            img.alt = "Icon game";

            inner.appendChild(img);
            item.appendChild(inner);

            // ВАЖЛИВО: Відключаємо transition при створенні
            item.style.transition = "none";

            newItems.push(item);
            col.appendChild(item);
        });

        // 4️⃣ ВИЗНАЧАЄМО, ЯКІ ЕЛЕМЕНТИ НОВІ, А ЯКІ СТАРІ
        // Спочатку знайдемо мапу: з якої oldRow кожен елемент прийшов
        const oldRowMap = []; // для кожного newRow зберігаємо oldRow
        let oldItemIndex = 0;

        for (let newRow = 0; newRow < ROWS; newRow++) {
            if (newRow < removedCount) {
                // Це новий елемент
                oldRowMap[newRow] = null;
            } else {
                // Це старий елемент - знаходимо його стару позицію
                let currentOldRow = 0;
                let foundCount = 0;

                for (let r = 0; r < ROWS; r++) {
                    if (oldCol[r] !== null) {
                        if (foundCount === oldItemIndex) {
                            currentOldRow = r;
                            break;
                        }
                        foundCount++;
                    }
                }

                oldRowMap[newRow] = currentOldRow;
                oldItemIndex++;
            }
        }

        // console.log('Row mapping:', oldRowMap.map((oldR, newR) => `new${newR}←old${oldR}`));

        // Тепер застосовуємо transform
        for (let newRow = 0; newRow < ROWS; newRow++) {
            const item = newItems[newRow];
            const oldRow = oldRowMap[newRow];

            if (oldRow === null) {
                // ЦЕ НОВИЙ ЕЛЕМЕНТ (падає зверху)
                // ПРАВИЛЬНА ЛОГІКА: нові елементи мають стартувати ВИЩЕ всієї сітки
                // При removedCount=3, ROWS=7:
                // new0 має з'явитися з row -3 і опуститися на 3 позиції до row 0 = offset 300%
                // new1 має з'явитися з row -2 і опуститися на 2 позиції до row 1 = offset 200%
                // new2 має з'явитися з row -1 і опуститися на 1 позицію до row 2 = offset 100%
                // Формула: відстань від стартової позиції до фінальної = (removedCount - newRow) + newRow = removedCount
                // Стартова позиція для нового елемента на newRow: -(removedCount) + newRow = -(removedCount - newRow)
                // Але це те саме що було...

                // ПРОБЛЕМА: Старі елементи теж використовують негативний offset!
                // РІШЕННЯ: Нові елементи мають стартувати з ще вищої позиції
                // Додаємо ROWS до offset, щоб гарантувати що вони вище всього
                const startOffset = (ROWS + removedCount - newRow) * 100;
                item.style.transform = `translateY(-${startOffset}%)`;
                item.dataset.isNew = "true";
                item.dataset.needsAnimation = "true";
                // console.log(`  new${newRow}: start at -${startOffset}%, drop to row ${newRow}`);
            } else {
                // ЦЕ СТАРИЙ ЕЛЕМЕНТ
                const distance = newRow - oldRow;

                // ВАЖЛИВО: Якщо distance === 0, елемент не рухається!
                if (distance === 0) {
                    item.style.transform = "translateY(0)";
                    item.dataset.needsAnimation = "false";
                    // console.log(`  old${oldRow}→new${newRow}: no move`);
                } else if (distance > 0) {
                    // Елемент падає вниз - стартує вище своєї позиції
                    item.style.transform = `translateY(-${distance * 100}%)`;
                    item.dataset.needsAnimation = "true";
                    // console.log(`  old${oldRow}→new${newRow}: drop ${distance} cells, start at -${distance * 100}%`);
                } else {
                    // distance < 0 означає що щось не так - не повинно статися
                    // console.warn(`Element moving up? newRow=${newRow}, oldRow=${oldRow}`);
                    item.style.transform = "translateY(0)";
                    item.dataset.needsAnimation = "false";
                }

                item.dataset.isNew = "false";
            }
        }
    });

    // 5️⃣ ЗАПУСКАЄМО АНІМАЦІЮ З ЗАТРИМКОЮ
    // Примусовий reflow для застосування початкових transform
    columns.forEach((col) => {
        void col.offsetHeight;
    });

    // Використовуємо setTimeout замість requestAnimationFrame для гарантованої затримки
    setTimeout(() => {
        columns.forEach((col) => {
            const items = col.querySelectorAll(".drum__item");

            items.forEach((item) => {
                // Анімуємо тільки елементи, які потребують анімації
                if (item.dataset.needsAnimation !== "false") {
                    item.style.transition = "transform 0.6s cubic-bezier(.22,.61,.36,1)";
                    item.style.transform = "translateY(0)";
                }
            });
        });
    }, 50); // Критична затримка!
}

function processCascade() {
    const clusters = findClusters(currentGrid);
    if (clusters.length === 0) {
        spinning = false;
        enableSpinButton();

        // 🎉 ЯКЩО ЦЕ 3-Й СПІН І ВЕЛИКИЙ ВИГРАШ — ПОПАП
        if (getWinType(spinCount) === WIN_TYPE.BIG) {
            openPopup();
        }
        return;
    }

    /* 1️⃣ ПІДСВІТКА */
    highlightClusters(clusters);

    clusters.forEach((cluster) => {
        const win = calculateClusterWin(cluster);
        const { x, y } = getClusterCenter(cluster);

        createWinNumber(win, x, y);
    });

    /* 2️⃣ ЗНИКНЕННЯ */
    setTimeout(() => {
        animateClusterDisappear(clusters);

        /* 3️⃣ ПІСЛЯ ЗНИКНЕННЯ */
        setTimeout(() => {
            // Зберігаємо старий grid з null для анімації
            const oldGridWithNulls = currentGrid.map((col) => [...col]);

            // Позначаємо видалені елементи як null
            clusters.forEach((cluster) => {
                cluster.forEach(({ c, r }) => {
                    oldGridWithNulls[c][r] = null;
                });
            });

            // Обчислюємо новий grid
            const newGrid = applyCascade(currentGrid, clusters);

            // Анімуємо каскад
            drum.classList.add("cascading");
            animateCascade(oldGridWithNulls, newGrid);

            // Оновлюємо поточний grid
            currentGrid = newGrid;

            /* 4️⃣ ПІСЛЯ ПАДІННЯ */
            setTimeout(() => {
                drum.classList.remove("cascading");

                // Перерендерюємо повністю для чистоти
                renderLayer(newLayer, currentGrid);

                // Перевіряємо наступний каскад
                processCascade();
            }, 600);
        }, DISAPPEAR_TIME);
    }, WIN_TIME);
}

/* ================= INIT ================= */
currentGrid = generateGridWithoutWin();
renderLayer(newLayer, currentGrid);

/* ================= SPIN ================= */
function spin() {
    if (spinning) return;
    spinning = true;
    disableSpinButton();

    // старий стан → вниз
    renderLayer(oldLayer, currentGrid);
    newLayer.innerHTML = "";

    const oldCols = oldLayer.querySelectorAll(".drum-column");
    oldCols.forEach((col, i) => {
        col.classList.add("drop-out");
        col.style.animationDelay = `${i * DROP_DELAY}s`;
    });

    setTimeout(
        () => {
            oldLayer.innerHTML = "";

            // spinCount++;
            // const isWinningSpin = spinCount === 2;

            // let nextGrid;
            // if (isWinningSpin) {
            //     nextGrid = generateGridGuaranteedWin(); // 💥 100% виграш
            // } else {
            //     nextGrid = generateGridWithoutWin(); // ❌ без виграшу
            // }

            spinCount++;

            const winType = getWinType(spinCount);
            const nextGrid = generateGridByWinType(winType);

            renderLayer(newLayer, nextGrid, true);
            currentGrid = nextGrid;

            if (winType !== WIN_TYPE.NONE) {
                setTimeout(() => {
                    processCascade();
                }, 600);
            } else {
                spinning = false;
                setTimeout(() => {
                    enableSpinButton();
                }, 900);
            }

            renderLayer(newLayer, nextGrid, true);
            currentGrid = nextGrid;

            // після падіння нових іконок
            setTimeout(() => {
                animateLandingPerColumn();
            }, 300);

            // if (isWinningSpin) {
            //     setTimeout(() => {
            //         processCascade();
            //     }, 600);
            // } else {
            //     spinning = false;
            //     setTimeout(() => {
            //         enableSpinButton();
            //     }, 900);
            // }
        },
        DROP_TIME + COLS * DROP_DELAY * 1000,
    );
}

/* ================= EVENTS ================= */
spinBtn.addEventListener("click", (e) => {
    e.preventDefault();
    spin();
});
