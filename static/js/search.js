(function() {
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

      return searchIndex;
    } catch (error) {
      console.error('Failed to load search index:', error);
      searchIndex = [];
      return [];
    }
  }

  // Check for exact match
  function hasExactMatch(query, text) {
    return text.indexOf(query) !== -1;
  }

  // Check for word boundary match (query at start of a word)
  function hasWordBoundaryMatch(query, text) {
    // Match at: start of text, after space, after newline, after common punctuation
    const regex = new RegExp('(^|[\\s,.:;!?()\\[\\]"\'\\-])' + escapeRegex(query), 'i');
    return regex.test(text);
  }

  // Escape special regex characters
  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Calculate relevance score for a result
  function scoreResult(item, normalizedQuery) {
    let score = 0;

    // Exact match in title: +3 points
    if (hasExactMatch(normalizedQuery, item.normalizedTitle)) {
      score += 3;
    }
    // Word boundary match in title: +1 point
    else if (hasWordBoundaryMatch(normalizedQuery, item.normalizedTitle)) {
      score += 1;
    }

    // Exact match in content: +2 points
    if (hasExactMatch(normalizedQuery, item.normalizedContent)) {
      score += 2;
    }
    // Word boundary match in content: +1 point
    else if (hasWordBoundaryMatch(normalizedQuery, item.normalizedContent)) {
      score += 1;
    }

    return score;
  }

  // Create snippet with highlighted match
  function createSnippet(content, query, maxLength) {
    maxLength = maxLength || 100;
    const normalizedQuery = normalizeText(query);
    const normalizedContent = normalizeText(content);

    // Try to find exact match first
    let matchIndex = normalizedContent.indexOf(normalizedQuery);

    // If no exact match, try word boundary match
    if (matchIndex === -1) {
      const regex = new RegExp('(^|[\\s,.:;!?()\\[\\]"\'\\-])' + escapeRegex(normalizedQuery), 'i');
      const match = normalizedContent.match(regex);
      if (match) {
        matchIndex = match.index + match[1].length;
      }
    }

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
    const highlightRegex = new RegExp('(' + escapeRegex(query) + ')', 'gi');
    snippet = snippet.replace(highlightRegex, '<mark>$1</mark>');

    return snippet;
  }

  // Perform search
  async function performSearch(query) {
    const resultsContainer = document.getElementById('search-results');

    if (!query || query.length < 3) {
      resultsContainer.classList.remove('active');
      return;
    }

    // Ensure index is loaded
    if (!searchIndex) {
      resultsContainer.innerHTML = '<div class="no-results">Index se načítá...</div>';
      resultsContainer.classList.add('active');
      await loadSearchIndex();
    }

    if (!searchIndex || searchIndex.length === 0) {
      resultsContainer.innerHTML = '<div class="no-results">Chyba načítání indexu</div>';
      resultsContainer.classList.add('active');
      return;
    }

    const normalizedQuery = normalizeText(query);

    // Score all items and filter those with score > 0
    const scoredResults = searchIndex
      .map(item => ({
        item: item,
        score: scoreResult(item, normalizedQuery)
      }))
      .filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    if (scoredResults.length === 0) {
      resultsContainer.innerHTML = '<div class="no-results">Nic nenalezeno</div>';
      resultsContainer.classList.add('active');
      return;
    }

    const html = scoredResults.map(function(result) {
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
