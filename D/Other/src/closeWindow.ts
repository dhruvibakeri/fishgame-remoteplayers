function closeWindow() {
  window.dispatchEvent(new Event('unload'));
  window.close();
}

const hexagon = document.getElementById('hexagon').onclick = (e: MouseEvent) => closeWindow();

window.addEventListener("unload", () => {
  navigator.sendBeacon("/close", "");
});
