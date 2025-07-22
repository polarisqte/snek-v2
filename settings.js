window.GameState = {
  GRID_SIZE: { value: "20", default: "20" },
  CANVAS_WIDTH: { value: "600", default: "600" },
  CANVAS_HEIGHT: { value: "600", default: "600" },

  FOOD_COUNT: { value: "3", default: "3" },

  FOOD_COLOR: { value: "red", default: "red" },
  SNAKE_COLOR: { value: "#46fb73", default: "#46fb73" },
  SNAKE_HEAD_COLOR: { value: "#3fdb66", default: "#3fdb66" },

  GAME_SPEED: { value: "0.1", default: "0.1" },
  MOVE_INTERVAL: { value: "120", default: "120" },
};

window.GameSettings = {
  load() {
    const saved = JSON.parse(localStorage.getItem("gameSettings"));
    if (saved) {
      for (const key in GameState) {
        if (saved.hasOwnProperty(key)) {
          GameState[key].value = String(saved[key]);
        } else {
          GameState[key].value = GameState[key].default;
        }
      }
    } else {
      this.reset();
    }
  },

  save() {
    const data = {};
    for (const key in GameState) {
      data[key] = GameState[key].value;
    }
    localStorage.setItem("gameSettings", JSON.stringify(data));
  },

  set(key, newValue) {
    if (GameState[key]) {
      GameState[key].value = String(newValue);
      this.save();
    }
  },

  get(key) {
    return GameState[key]?.value ?? null;
  },

  getDefault(key) {
    return GameState[key]?.default ?? null;
  },

  reset() {
    for (const key in GameState) {
      GameState[key].value = GameState[key].default;
    }
    this.save();
  },
};

let settingsBase = {
  GRID_SIZE: {
    element: document.getElementById("grid-size"),
    values: {
      small: 10,
      medium: 20,
      large: 30,
    },
  },

  CANVAS_WIDTH: {
    element: document.getElementById("canvas-size"),
    values: {
      small: 400,
      medium: 600,
      large: 800,
    },
  },

  CANVAS_HEIGHT: {
    element: document.getElementById("canvas-size"),
    values: {
      small: 400,
      medium: 600,
      large: 800,
    },
  },

  FOOD_COUNT: {
    element: document.getElementById("food-count"),
    values: {
      one: 1,
      three: 3,
      five: 5,
    },
  },

  GAME_SPEED: {
    element: document.getElementById("game-speed"),
    values: {
      slow: 0.125,
      default: 0.1,
      fast: 0.075,
    },
  },
};

let settingsOpen = false;

let settingsButton = document.getElementById("settings-btn");
let settingsList = document.getElementById("settings-list");

function toggleSettingsWindow() {
  if (settingsOpen) {
    settingsOpen = false;
    settingsList.style.display = "none";
    settingsButton.textContent = "< open settings >";
  } else {
    settingsOpen = true;
    settingsList.style.display = "flex";
    settingsButton.textContent = "< close settings >";
  }
}

settingsButton.addEventListener("click", toggleSettingsWindow);

function updateSettingsHighlights() {
  Object.entries(settingsBase).forEach(([key, { element, values }]) => {
    const currentValue = GameSettings.get(key);

    Array.from(element.querySelectorAll("button")).forEach((button) => {
      const label = button.dataset.value;
      const value = values[label];

      if (String(value) === String(currentValue)) {
        button.classList.add("settings-hl");
      } else {
        button.classList.remove("settings-hl");
      }
    });
  });
}

Object.entries(settingsBase).forEach(([key, { element, values }]) => {
  element.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      const label = button.dataset.value;
      const value = values[label];

      GameSettings.set(key, value);
      updateSettingsHighlights();
    });
  });
});

GameSettings.load();

updateSettingsHighlights();
