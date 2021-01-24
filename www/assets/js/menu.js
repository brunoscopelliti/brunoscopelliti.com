var state = {
  open: false,
};

/**
 * Returns the HTMLElement
 * that controls the state of the menu.
 * @name hamburger
 * @returns {HTMLElement}
 */
function hamburger () {
  return document.querySelector("[data-js='hamburger']");
}

/**
 * Executed when the user
 * press the ESC key.
 * It closes the menu, and stop listening
 * for key press.
 * @name onESC
 * @param {Event} event
 */
function onESC (event) {
  if (event.which === 27) {
    document.removeEventListener("keyup", onESC);

    closeMenu();
  }
}

/**
 * Depending on the state of the menu,
 * start/stop listening for press of
 * ESC key that should close the menu.
 * @name toggleKeyListener
 */
function toggleKeyListener () {
  if (state.open) {
    document.addEventListener("keyup", onESC);
  } else {
    document.removeEventListener("keyup", onESC);
  }
}

/**
 * Updates the DOM so that the menu
 * is open.
 * @name openMenu
 */
function openMenu () {
  var button = hamburger();

  document.body.classList.add("menu-open");
  button.setAttribute("aria-label", "Close menu");

  state.open = true;
}

/**
 * Updates the DOM so that the menu
 * is closed.
 * @name closeMenu
 */
function closeMenu () {
  var button = hamburger();

  document.body.classList.remove("menu-open");
  button.setAttribute("aria-label", "Open menu");

  state.open = false;
}

/**
 * Executed when the user clicks
 * on the button that controls the menu.
 * It toggles the state of the menu.
 * @name onToggle
 */
function onToggle () {
  if (state.open) {
    closeMenu();
  } else {
    openMenu();
  }

  toggleKeyListener();
}

hamburger().addEventListener("click", onToggle);
