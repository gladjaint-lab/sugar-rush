import "./common.min.js";
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) return;
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) processPreload(link);
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
    }
  }).observe(document, {
    childList: true,
    subtree: true
  });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep) return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
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
  "pic_07.png"
];
const DROP_TIME = 100;
const DROP_DELAY = 0.07;
const DISAPPEAR_TIME = 450;
const WIN_TIME = 1e3;
const drum = document.querySelector(".drum");
const oldLayer = drum.querySelector(".drum-layer--old .drum-columns");
const newLayer = drum.querySelector(".drum-layer--new .drum-columns");
const spinBtn = document.querySelector(".menu__button-spin");
let spinning = false;
let spinCount = 0;
let currentGrid = [];
function randSymbol() {
  return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}
function disableSpinButton() {
  spinBtn.classList.add("disabled");
}
function enableSpinButton() {
  spinBtn.classList.remove("disabled");
}
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
function generateGridWithoutWin() {
  let grid;
  do {
    grid = generateGrid();
  } while (findClusters(grid).length > 0);
  return grid;
}
function generateGridGuaranteedWin() {
  let grid;
  do {
    grid = generateGrid();
  } while (findClusters(grid).length === 0);
  return grid;
}
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
function animateLandingPerColumn() {
  const columns = newLayer.querySelectorAll(".drum-column");
  columns.forEach((col, colIndex) => {
    const items = col.querySelectorAll(".drum__item");
    if (!items.length) return;
    const landingTime = DROP_TIME + colIndex * DROP_DELAY * 1e3;
    setTimeout(() => {
      const total = items.length;
      items.forEach((item, index) => {
        const depth = (index + 1) / total;
        const scale = 0.1 * depth;
        const shift = 3.2 * Math.pow(depth, 2);
        item.style.setProperty("--land-scale", scale.toFixed(3));
        item.style.setProperty("--land-shift", `${shift.toFixed(2)}%`);
        item.classList.remove("land");
        void item.offsetWidth;
        item.classList.add("land");
      });
    }, landingTime);
  });
}
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
function applyCascade(grid, clusters) {
  const newGrid = grid.map((col) => [...col]);
  clusters.forEach((cluster) => {
    cluster.forEach(({ c, r }) => {
      newGrid[c][r] = null;
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
function animateCascade(oldGridWithNulls, newGrid) {
  const columns = newLayer.querySelectorAll(".drum-column");
  columns.forEach((col, c) => {
    const oldCol = oldGridWithNulls[c];
    const newCol = newGrid[c];
    const removedCount = oldCol.filter((s) => s === null).length;
    if (removedCount === 0) return;
    [...col.children];
    col.innerHTML = "";
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
      item.style.transition = "none";
      newItems.push(item);
      col.appendChild(item);
    });
    const oldRowMap = [];
    let oldItemIndex = 0;
    for (let newRow = 0; newRow < ROWS; newRow++) {
      if (newRow < removedCount) {
        oldRowMap[newRow] = null;
      } else {
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
    for (let newRow = 0; newRow < ROWS; newRow++) {
      const item = newItems[newRow];
      const oldRow = oldRowMap[newRow];
      if (oldRow === null) {
        const startOffset = (ROWS + removedCount - newRow) * 100;
        item.style.transform = `translateY(-${startOffset}%)`;
        item.dataset.isNew = "true";
        item.dataset.needsAnimation = "true";
      } else {
        const distance = newRow - oldRow;
        if (distance === 0) {
          item.style.transform = "translateY(0)";
          item.dataset.needsAnimation = "false";
        } else if (distance > 0) {
          item.style.transform = `translateY(-${distance * 100}%)`;
          item.dataset.needsAnimation = "true";
        } else {
          item.style.transform = "translateY(0)";
          item.dataset.needsAnimation = "false";
        }
        item.dataset.isNew = "false";
      }
    }
  });
  columns.forEach((col) => {
    void col.offsetHeight;
  });
  setTimeout(() => {
    columns.forEach((col) => {
      const items = col.querySelectorAll(".drum__item");
      items.forEach((item) => {
        if (item.dataset.needsAnimation !== "false") {
          item.style.transition = "transform 0.6s cubic-bezier(.22,.61,.36,1)";
          item.style.transform = "translateY(0)";
        }
      });
    });
  }, 50);
}
function processCascade() {
  const clusters = findClusters(currentGrid);
  if (clusters.length === 0) {
    spinning = false;
    enableSpinButton();
    return;
  }
  highlightClusters(clusters);
  setTimeout(() => {
    animateClusterDisappear(clusters);
    setTimeout(() => {
      const oldGridWithNulls = currentGrid.map((col) => [...col]);
      clusters.forEach((cluster) => {
        cluster.forEach(({ c, r }) => {
          oldGridWithNulls[c][r] = null;
        });
      });
      const newGrid = applyCascade(currentGrid, clusters);
      drum.classList.add("cascading");
      animateCascade(oldGridWithNulls, newGrid);
      currentGrid = newGrid;
      setTimeout(() => {
        drum.classList.remove("cascading");
        renderLayer(newLayer, currentGrid);
        processCascade();
      }, 600);
    }, DISAPPEAR_TIME);
  }, WIN_TIME);
}
currentGrid = generateGridWithoutWin();
renderLayer(newLayer, currentGrid);
function spin() {
  if (spinning) return;
  spinning = true;
  disableSpinButton();
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
        nextGrid = generateGridGuaranteedWin();
      } else {
        nextGrid = generateGridWithoutWin();
      }
      renderLayer(newLayer, nextGrid, true);
      currentGrid = nextGrid;
      setTimeout(() => {
        animateLandingPerColumn();
      }, 300);
      if (isWinningSpin) {
        setTimeout(() => {
          processCascade();
        }, 600);
      } else {
        spinning = false;
        setTimeout(() => {
          enableSpinButton();
        }, 900);
      }
    },
    DROP_TIME + COLS * DROP_DELAY * 1e3
  );
}
spinBtn.addEventListener("click", (e) => {
  e.preventDefault();
  spin();
});
