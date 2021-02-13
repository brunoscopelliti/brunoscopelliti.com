/**
 * @name matches
 * @private
 */
function matches (target, selector, boundElement) {
  if (target === boundElement) {
    return null;
  }
  if (target.matches(selector)) {
    return target;
  }
  if (target.parentNode) {
    return matches(target.parentNode, selector, boundElement);
  }
  return null;
};

/**
 * Assure that the provided function, `fn`,
 * is executed only when its wrapping function is called 
 * on a target that matches the `selector`.
 * @name delegate
 * @param {Function} fn
 * @param {String} selector
 * @returns {Function}
 */
function delegate (fn, selector) {
  return function handler (event) {
    var matchingEl = matches(event.target, selector, this);
    if (matchingEl != null) {
      fn.call(matchingEl, event);
    }
  };
};

/**
 * @name once
 * @private
 */
function once (fn, cancel) {
  return function handler () {
    cancel();
    fn.apply(this, [].slice.call(arguments));
  }
};

/**
 * Register event listener.
 * @name listen
 * @param {String} eventName
 * @param {Element} target
 * @param {Function} fn
 * @param {Object} options
 */
function listen (eventName, target, fn, options) {
  options = options || {};

  var useCapture = options.useCapture || false;

  function cancelListener () {
    target.removeEventListener(eventName, handler, useCapture);
  };

  var handler = options.once
    ? once(fn, cancelListener)
    : fn;

  target.addEventListener(eventName, handler, useCapture);

  return cancelListener;
};

/**
 * Return the first HTML element
 * matching the given selector.
 * @name get
 * @param {String} selector 
 * @param {Element} [context] 
 * @returns {HTMLElement}
 */
function get (selector, context) {
  return (context || document.body).querySelector(selector);
}

var slice = [].slice;

/**
 * Return all the HTML elements
 * matching the given selector.
 * @name getAll
 * @param {String} selector 
 * @param {Element} [context] 
 * @returns {HTMLElement}
 */
function getAll (selector, context) {
  return slice.call((context || document.body).querySelectorAll(selector));
}

window.BS_blog = {
  delegate: delegate,
  $1: get,
  $: getAll,
  listen: listen
};

