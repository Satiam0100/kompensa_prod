(function () {
  try {
    var key = "kompensa-theme";
    var stored = localStorage.getItem(key);
    var mode =
      stored === "light" || stored === "dark" || stored === "system"
        ? stored
        : "system";
    var dark =
      mode === "dark" ||
      (mode === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
  } catch (e) {}
})();
