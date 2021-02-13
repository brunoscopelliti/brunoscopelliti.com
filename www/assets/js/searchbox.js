var g = window.BS_blog;
var get = g.$1;
var getAll = g.$;
var delegate = g.delegate;
var listen = g.listen;

var state = {
  keywords: []
};

function isKeywordNew (keyword) {
  return state.keywords.indexOf(keyword) < 0;
}
function addKeyword (keyword) {
  state.keywords.push(keyword);
}
function replaceKeywords (keywords) {
  keywords = keywords.trim();

  if (keywords) {
    state.keywords = keywords.split(",")
      .map(
        function (keyword) {
          return keyword.trim();
        }
      );
  } else {
    state.keywords = [];
  }
}
function removeKeyword (keyword) {
  state.keywords = state.keywords.filter(
    function (k) { 
      return k !== keyword;
    }
  );
}

var $input = get("[data-js='posts-search']");

function searchKeywords () {
  $input.value = state.keywords.join(", ");
}

function toggleKeyword () {
  getAll("[data-keyword]")
    .forEach(
      function ($keyword) {
        var keyword = $keyword.dataset.keyword;
        $keyword.classList.toggle(
          "selected",
          state.keywords
            .join(",")
            .toLowerCase()
            .split(",")
            .indexOf(keyword) >= 0
        );
      }
    );
}

function togglePosts () {
  var $groups = getAll("[data-js='group']");

  $groups.forEach(
    function ($group) {
      var hideGroup = true;
      var $groupPosts = getAll("[data-js='post-entry']", $group);

      $group.classList.remove("hidden");

      $groupPosts.forEach(
        function ($post) {
          var tags = $post.dataset.tags.split(",");

          // When current query contains at least one keyword
          // missing on current post
          // we hide the post.
          var hide = state.keywords.some(
            function (tag) {
              return tags.indexOf(tag.toLowerCase()) < 0;
            }
          );

          if (!hide) {
            hideGroup = false;
          }

          $post.classList.toggle("hidden", hide);
        }
      );

      if (hideGroup) {
        $group.classList.add("hidden");
      }
    }
  );
}

function getVisiblePostsCount () {
  return getAll("[data-js='post-entry']:not(.hidden)").length;
}

function updateVisiblePostsCount () {
  var $el = get("[data-js='posts-count']");
  if ($el) {
    $el.textContent = getVisiblePostsCount();
  }
}

function toggleZeroResultsMessage () {
  var $error = get("[data-js='no-results']");
  if ($error) {
    $error.classList.toggle("hidden", getVisiblePostsCount() > 0);;
  }
}

function doUpdates () {
  searchKeywords();
  toggleKeyword();
  togglePosts();
  updateVisiblePostsCount();
  toggleZeroResultsMessage();
}

function onKeywordClick (event) {
  var $keyword = event.target.closest(".keyword");
  var keyword = $keyword.dataset.keyword;

  if (isKeywordNew(keyword)) {
    addKeyword(keyword);
  } else {
    removeKeyword(keyword);
  }

  doUpdates(keyword);
}

listen("click", get("[data-js='keywords']"), delegate(onKeywordClick, ".keyword"));

function onKeyUp (event) {
  replaceKeywords(event.target.value);

  doUpdates()
}

listen("change", $input, onKeyUp);

function showAllKeywords () {
  var $list = get("[data-js='keywords']");

  $list.classList.add("expanded");
}

function hideLastKeywords () {
  var $list = get("[data-js='keywords']");

  $list.classList.remove("expanded");
}

listen("click", get("[data-js='more-keyword']"), showAllKeywords);

listen("click", get("[data-js='less-keyword']"), hideLastKeywords);
