export function getScrollbarWidth() {
  const newDiv = document.createElement("div");
  newDiv.style.overflowY = "scroll";
  newDiv.style.width = "32px";
  newDiv.style.height = "32px";
  newDiv.style.visibility = "hidden";
  document.body.appendChild(newDiv);
  const scrollBarWidth = newDiv.offsetWidth - newDiv.clientWidth;
  document.body.removeChild(newDiv);

  return scrollBarWidth;
}

export function isBodyScrollable() {
  return document.body.scrollHeight > document.body.clientHeight;
}
