(function() {
  let fuse = null;
  let searchIndex = null;

  // Normalize text - remove diacritics and lowercase
  function normalizeText(text) {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  // Load search index
  async function loadSearchIndex() {
    if (searchIndex) return searchIndex;

    try {
      const response = await fetch('/cookbook/index.json');
      searchIndex = await response.json();

      // Prepare normalized content for search
      searchIndex = searchIndex.map(item => ({
        ...item,
        normalizedTitle: normalizeText(item.title),
        normalizedContent: normalizeText(item.content)
      }));

      // Initialize Fuse.js
      fuse = new Fuse(searchIndex, {
        keys: ['normalizedTitle', 'normalizedContent'],
        threshold: 0.3,
        includeMatches: true,
        minMatchCharLength: 3
      });

      return searchIndex;
    } catch (error) {
      console.error('Failed to load search index:', error);
      return [];
    }
  }

  // Create snippet with highlighted match
  function createSnippet(content, query, maxLength) {
    maxLength = maxLength || 100;
    const normalizedQuery = normalizeText(query);
    const normalizedContent = normalizeText(content);

    const matchIndex = normalizedContent.indexOf(normalizedQuery);

    if (matchIndex === -1) {
      return content.substring(0, maxLength) + '...';
    }

    // Calculate snippet boundaries
    const start = Math.max(0, matchIndex - 40);
    const end = Math.min(content.length, matchIndex + query.length + 60);

    let snippet = '';
    if (start > 0) snippet += '...';
    snippet += content.substring(start, end);
    if (end < content.length) snippet += '...';

    // Highlight the match (case-insensitive replacement)
    const regex = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
    snippet = snippet.replace(regex, '<mark>$1</mark>');

    return snippet;
  }

  // Perform search
  function performSearch(query) {
    const resultsContainer = document.getElementById('search-results');

    if (!query || query.length < 3) {
      resultsContainer.classList.remove('active');
      return;
    }

    const normalizedQuery = normalizeText(query);
    const results = fuse.search(normalizedQuery, { limit: 10 });

    if (results.length === 0) {
      resultsContainer.innerHTML = '<div class="no-results">Nic nenalezeno</div>';
      resultsContainer.classList.add('active');
      return;
    }

    const html = results.map(function(result) {
      const item = result.item;
      const snippet = createSnippet(item.content, query);

      return '<a href="' + item.url + '" class="result-item">' +
        '<div class="result-title">' + item.title + '</div>' +
        '<div class="result-snippet">' + snippet + '</div>' +
        '</a>';
    }).join('');

    resultsContainer.innerHTML = html;
    resultsContainer.classList.add('active');
  }

  // Debounce function
  function debounce(func, wait) {
    let timeout;
    return function() {
      const args = arguments;
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        func.apply(context, args);
      }, wait);
    };
  }

  // Initialize search
  document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    const resultsContainer = document.getElementById('search-results');

    if (!searchInput) return;

    // Load index when user focuses on search
    searchInput.addEventListener('focus', loadSearchIndex);

    // Search on input
    const debouncedSearch = debounce(performSearch, 300);
    searchInput.addEventListener('input', function(e) {
      debouncedSearch(e.target.value);
    });

    // Close results on Escape
    searchInput.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        resultsContainer.classList.remove('active');
        searchInput.blur();
      }
    });

    // Close results on click outside
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.search-form')) {
        resultsContainer.classList.remove('active');
      }
    });
  });
})();
