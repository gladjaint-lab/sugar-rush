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
];

const DROP_TIME = 100;
const DROP_DELAY = 0.07;

const HIGHLIGHT_DELAY = 5400;
const DISAPPEAR_TIME = 1450;

/* ================= ELEMENTS ================= */
const drum = document.querySelector(".drum");
const oldLayer = drum.querySelector(".drum-layer--old .drum-columns");
const newLayer = drum.querySelector(".drum-layer--new .drum-columns");
const spinBtn = document.querySelector(".menu__button-spin");

/* ================= STATE ================= */
let spinning = false;
let spinCount = 0;
let currentGrid = [];

/* ================= HELPERS ================= */
function randSymbol() {
    return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
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
        const removedCount = oldCol.filter(s => s === null).length;
        if (removedCount === 0) return;
        
        // 1️⃣ ЗБЕРІГАЄМО ПОСИЛАННЯ НА СТАРІ ЕЛЕМЕНТИ
        const oldItems = [...col.children];
        
        // 2️⃣ ПОВНІСТЮ ОЧИЩАЄМО КОЛОНКУ
        col.innerHTML = '';
        
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
        
        // Тепер застосовуємо transform
        for (let newRow = 0; newRow < ROWS; newRow++) {
            const item = newItems[newRow];
            const oldRow = oldRowMap[newRow];
            
            if (oldRow === null) {
                // ЦЕ НОВИЙ ЕЛЕМЕНТ (падає зверху)
                const startOffset = (removedCount - newRow) * 100;
                item.style.transform = `translateY(-${startOffset}%)`;
                item.dataset.isNew = "true";
            } else {
                // ЦЕ СТАРИЙ ЕЛЕМЕНТ
                const distance = newRow - oldRow;
                
                // ВАЖЛИВО: Якщо distance === 0, елемент не рухається!
                if (distance === 0) {
                    item.style.transform = "translateY(0)";
                    item.dataset.needsAnimation = "false";
                } else if (distance > 0) {
                    // Елемент падає вниз - стартує вище своєї позиції
                    item.style.transform = `translateY(-${distance * 100}%)`;
                    item.dataset.needsAnimation = "true";
                } else {
                    // distance < 0 означає що щось не так - не повинно статися
                    console.warn(`Element moving up? newRow=${newRow}, oldRow=${oldRow}`);
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
            const items = col.querySelectorAll('.drum__item');
            
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
        return;
    }

    /* 1️⃣ ПІДСВІТКА */
    highlightClusters(clusters);

    /* 2️⃣ ЗНИКНЕННЯ */
    setTimeout(() => {
        animateClusterDisappear(clusters);

        /* 3️⃣ ПІСЛЯ ЗНИКНЕННЯ */
        setTimeout(() => {
            // Зберігаємо старий grid з null для анімації
            const oldGridWithNulls = currentGrid.map(col => [...col]);
            
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
    }, 400);
}

/* ================= INIT ================= */
currentGrid = generateGridWithoutWin();
renderLayer(newLayer, currentGrid);

/* ================= SPIN ================= */
function spin() {
    if (spinning) return;
    spinning = true;

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

            spinCount++;
            const isWinningSpin = spinCount === 2;

            let nextGrid;
            if (isWinningSpin) {
                nextGrid = generateGridGuaranteedWin(); // 💥 100% виграш
            } else {
                nextGrid = generateGridWithoutWin(); // ❌ без виграшу
            }

            renderLayer(newLayer, nextGrid, true);
            currentGrid = nextGrid;

            // після падіння нових іконок
            setTimeout(() => {
                animateLandingPerColumn();
            }, 300);

            if (isWinningSpin) {
                setTimeout(() => {
                    processCascade();
                }, 600);
            } else {
                spinning = false;
            }
        },
        DROP_TIME + COLS * DROP_DELAY * 1000,
    );
}

/* ================= EVENTS ================= */
spinBtn.addEventListener("click", (e) => {
    e.preventDefault();
    spin();
});