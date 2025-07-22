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
      for (const key in saved) {
        if (GameState[key]) {
          GameState[key].value = saved[key];
        }
      }
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
