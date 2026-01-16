(function() {
  var dndHandler = {
    draggedElement: null, 
    
    placeElement: function(dropper) {
      dropper.classList.remove('over');
      if (dropper.getAttribute('data-kana') == dndHandler.draggedElement.textContent) {
        dropper.querySelector('.placed')?.remove();
        var clonedElement = dndHandler.draggedElement.cloneNode(true);
        clonedElement.classList.add('placed');
        clonedElement.style.left = '';
        clonedElement.style.top = '';
        clonedElement.classList.remove('is-dragging');
        dropper.appendChild(clonedElement);
        var replaceElement = document.createElement('span');
        dndHandler.draggedElement.parentNode.replaceChild(replaceElement, dndHandler.draggedElement); 
        if (document.querySelectorAll('.kanas [data-type]').length == 0) {
          document.querySelector('#timer').classList.add('finished');
        }
      } else {
        dropper.classList.add('error');
        var errors = document.querySelector('#errors');
        errors.setAttribute('data-errors', parseInt(errors.getAttribute('data-errors')) + 1);
        setTimeout(function() {
          document.querySelector('.error').classList.remove('error');
        }, 300);
      }
    },
    
    applyDragEvents: function(element) {
      var dndHandler = this;
      element.draggable = false;
  
      element.addEventListener('mousedown', function(e) {
        if (e.button !== 0) return;
        dndHandler.startManualDrag(e, element);
      });
  
      element.addEventListener('touchstart', function(e) {
        dndHandler.startManualDrag(e.changedTouches[0], element);
      }, { passive: false });
    },
    
    startManualDrag: function(coordSource, element) {
      var dndHandler = this;
      if (dndHandler.draggedElement) return;
      if (typeof startTimer === 'function') startTimer();
      dndHandler.draggedElement = element;
  
      var rect = element.getBoundingClientRect();
      var offsetX = coordSource.clientX - rect.left;
      var offsetY = coordSource.clientY - rect.top;
      var placeholderCreated = false;
  
      function move(e) {
        var clientX = e.clientX || (e.touches ? e.touches[0].clientX : 0);
        var clientY = e.clientY || (e.touches ? e.touches[0].clientY : 0);
        const container = document.getElementById('wrapper');
        const rect = container.getBoundingClientRect();
        const scale = rect.width / container.offsetWidth;

        if (e.cancelable) e.preventDefault();
        if (!placeholderCreated) {
            const placeholder = element.cloneNode(true);
            placeholder.id = "placeholder-drag";
            var style = window.getComputedStyle(element);
            placeholder.style.width = style.width;
            placeholder.style.height = style.height;
            placeholder.style.margin = style.margin;
            placeholder.classList.add('is-dragging-placeholder');
            element.parentNode.insertBefore(placeholder, element);
            placeholderCreated = true;
        }
        element.classList.add('is-dragging');
        element.style.left = ((clientX - rect.left - offsetX) / scale) + 'px';
        element.style.top = ((clientY - rect.top - offsetY) / scale) + 'px';

        var target = document.elementFromPoint(clientX, clientY);
        var slot = target ? target.closest('.slot') : null;

        document.querySelectorAll('.over').forEach(s => s.classList.remove('over'));
        if (slot && slot.classList.contains(element.getAttribute('data-type'))) {
            slot.classList.add('over');
        }
      }
  
      function stop(e) {
        var clientX = e.clientX || (e.changedTouches ? e.changedTouches[0].clientX : 0);
        var clientY = e.clientY || (e.changedTouches ? e.changedTouches[0].clientY : 0);
        var target = document.elementFromPoint(clientX, clientY);
        var slot = target ? target.closest('.slot') : null;

        const p = document.getElementById("placeholder-drag");
        if (p) p.remove();
        element.classList.remove('is-dragging');
        element.style.left = '';
        element.style.top = '';
        document.querySelectorAll('.over').forEach(s => s.classList.remove('over'));
        if (slot) dndHandler.placeElement(slot);
        dndHandler.draggedElement = null;

        window.removeEventListener('mousemove', move);
        window.removeEventListener('mouseup', stop);
        window.removeEventListener('touchmove', move, { passive: false });
        window.removeEventListener('touchend', stop);
        window.removeEventListener('touchcancel', stop);
      }
  
      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', stop);
      window.addEventListener('touchmove', move, { passive: false });
      window.addEventListener('touchend', stop);
      window.addEventListener('touchcancel', stop);
    }
  };

  var kanasArea = null;
  var initialKanasHTML = '';
  var timerStarted = false;
  var startTime = null;
  var timerInterval = null;

  function startTimer() {
    if (timerStarted) return;
    timerStarted = true;
    startTime = Date.now();

    timerInterval = setInterval(function() {
      var timer = document.querySelector('#timer');
      if (!timer.classList.contains('finished')) {
        var delta = Date.now() - startTime;
        var time = Math.floor(delta / 1000);
        var minutes = ('00' + Math.floor(time / 60)).substr(-2);
        var seconds = ('00' + (time % 60)).substr(-2);
        timer.textContent = minutes + ' : ' + seconds;
      }
    }, 100);
  }

  function resetTimer() {
    var timer = document.querySelector('#timer');
    timer.textContent = '00 : 00';
    timer.classList.remove('finished');

    if (timerInterval) {
      clearInterval(timerInterval);
    }
    timerStarted = false;
    startTime = null;
    timerInterval = null;
  }

  function resetKanas() {
    document.querySelectorAll('.slot .placed').forEach(el => el.remove());
    kanasArea.innerHTML = initialKanasHTML;
    
    document.querySelectorAll('.kanas [data-type]').forEach(el => {
      dndHandler.applyDragEvents(el);
    });
    for (var i = kanasArea.children.length; i >= 0; i--) {
      kanasArea.appendChild(kanasArea.children[Math.random() * i | 0]);
    }
  }

  function resetErrors() {
    const errors = document.querySelector('#errors');
    errors.setAttribute('data-errors', 0);
  }

  const hiraganaRows = [
    ["あ", "か", "さ", "た", "な", "は", "ま", "や", "ら", "わ", "ん"], 
    ["い", "き", "し", "ち", "に", "ひ", "み", "い", "り", "い"],
    ["う", "く", "す", "つ", "ぬ", "ふ", "む", "ゆ", "る", "う"],
    ["え", "け", "せ", "て", "ね", "へ", "め", "え", "れ", "え"],
    ["お", "こ", "そ", "と", "の", "ほ", "も", "よ", "ろ", "を"]
  ];

  const katakanaRows = [
    ["ア","カ","サ","タ","ナ","ハ","マ","ヤ","ラ","ワ","ン"],
    ["イ","キ","シ","チ","ニ","ヒ","ミ","イ","リ","イ"],
    ["ウ","ク","ス","ツ","ヌ","フ","ム","ユ","ル","ウ"],
    ["エ","ケ","セ","テ","ネ","ヘ","メ","エ","レ","エ"],
    ["オ","コ","ソ","ト","ノ","ホ","モ","ヨ","ロ","ヲ"]
  ];

  const romajiRows = [
    ["a", "ka", "sa", "ta", "na", "ha", "ma", "ya", "ra", "wa", "n"],
    ["i", "ki", "shi", "chi", "ni", "hi", "mi", "i", "ri", "i"],
    ["u", "ku", "su", "tsu", "nu", "fu", "mu", "yu", "ru", "u"],
    ["e", "ke", "se", "te", "ne", "he", "me", "e", "re", "e"],
    ["o", "ko", "so", "to", "no", "ho", "mo", "yo", "ro", "wo"]
  ];

  var gameTemplates = {
    hiragana: `
      <h1>Hiragana practice</h1>
      ${baseHeader()}
      ${hiraganaTable()}
      ${hiraganaKanas()}
    `,
  
    katakana: `
      <h1>Katakana practice</h1>
      ${baseHeader()}
      ${katakanaTable()}
      ${katakanaKanas()}
    `,
  
    hirakata: `
      <h1>Hiragana practice with Katakana</h1>
      ${baseHeader()}
      ${hiraganaKatakanaTable()}
      ${hiraganaKanas()}
    `,
  
    katahira: `
      <h1>Katakana practice with Hiragana</h1>
      ${baseHeader()}
      ${katakanaHiraganaTable()}
      ${katakanaKanas()}
    `,
  
    hiraroma: `
      <h1>Hiragana practice with Romaji</h1>
      ${baseHeader()}
      ${hiraganaRomajiTable()}
      ${hiraganaKanas()}
    `,
  
    kataroma: `
      <h1>Katakana practice with Romaji</h1>
      ${baseHeader()}
      ${katakanaRomajiTable()}
      ${katakanaKanas()}
    `
  };

  function baseHeader() {
    return `
      <h2>Drag and drop kanas to their right place</h2>
      <div>
        <span id="timer">00 : 00</span>
        <span id="errors" data-errors="0"> errors</span>
        <button id="resetBtn">RESET</button>
      </div>
    `;
  }

  function hiraganaTable() {  
    return `
      <table class="syllabary">
        ${hiraganaRows.map(row => `
          <tr>
            ${row.map(kana => `
              <td>
                <div>
                  <span class="hiragana slot" data-kana="${kana}"></span>
                </div>
              </td>
            `).join('')}
          </tr>
        `).join('')}
      </table>
    `;
  }
  
  function katakanaTable() {
    return `
      <table class="syllabary">
        ${katakanaRows.map(row => `
          <tr>
            ${row.map(kana => `
              <td>
                <div>
                  <span class="katakana slot" data-kana="${kana}"></span>
                </div>
              </td>
            `).join('')}
          </tr>
        `).join('')}
      </table>
    `;
  }

  function hiraganaKatakanaTable() {
    return `
      <table class="syllabary">
        ${hiraganaRows.map((hiraganaRow, index) => {
          const katakanaRow = katakanaRows[index];
          return `
            <tr>
              ${hiraganaRow.map((kana, i) => `
                <td>
                  <div>
                    <span class="hiragana slot" data-kana="${kana}">
                    <span class="helper">${katakanaRow[i]}</span></span>
                  </div>
                </td>
              `).join('')}
            </tr>
          `;
        }).join('')}
      </table>
    `;
  }
  
  function katakanaHiraganaTable() {
    return `
      <table class="syllabary">
        ${katakanaRows.map((katakanaRow, index) => {
          const hiraganaRow = hiraganaRows[index];
          return `
            <tr>
              ${katakanaRow.map((kana, i) => `
                <td>
                  <div>
                    <span class="katakana slot" data-kana="${kana}">
                    <span class="helper">${hiraganaRow[i]}</span></span>
                  </div>
                </td>
              `).join('')}
            </tr>
          `;
        }).join('')}
      </table>
    `;
  }

  function hiraganaRomajiTable() {
    return `
      <table class="syllabary">
        ${hiraganaRows.map((hiraganaRow, index) => {
          const romajiRow = romajiRows[index];
          return `
            <tr>
              ${hiraganaRow.map((kana, i) => `
                <td>
                  <div>
                    <span class="hiragana slot" data-kana="${kana}">
                    <span class="helper">${romajiRow[i]}</span></span>
                  </div>
                </td>
              `).join('')}
            </tr>
          `;
        }).join('')}
      </table>
    `;
  }
  
  function katakanaRomajiTable() {
    return `
      <table class="syllabary">
        ${katakanaRows.map((katakanaRow, index) => {
          const romajiRow = romajiRows[index];
          return `
            <tr>
              ${katakanaRow.map((kana, i) => `
                <td>
                  <div>
                    <span class="katakana slot" data-kana="${kana}">
                    <span class="helper">${romajiRow[i]}</span></span>
                  </div>
                </td>
              `).join('')}
            </tr>
          `;
        }).join('')}
      </table>
    `;
  }
  
  function hiraganaKanas() {
    const hiraganaList = [
      "あ","か","さ","た","な","は","ま","や","ら","わ","ん",
      "い","き","し","ち","に","ひ","み","い","り","い",
      "う","く","す","つ","ぬ","ふ","む","ゆ","る","う",
      "え","け","せ","て","ね","へ","め","え","れ","え",
      "お","こ","そ","と","の","ほ","も","よ","ろ","を"
    ];

    return `
      <div class="kanas">
        ${hiraganaList.map(kana => `<span data-type="hiragana">${kana}</span>`).join('')}
      </div>
    `;
  }
  
  function katakanaKanas() {
    const katakanaList = [
      "ア","カ","サ","タ","ナ","ハ","マ","ヤ","ラ","ワ","ン",
      "イ","キ","シ","チ","ニ","ヒ","ミ","イ","リ","イ",
      "ウ","ク","ス","ツ","ヌ","フ","ム","ユ","ル","ウ",
      "エ","ケ","セ","テ","ネ","ヘ","メ","エ","レ","エ",
      "オ","コ","ソ","ト","ノ","ホ","モ","ヨ","ロ","ヲ"
    ];

    return `
      <div class="kanas">
        ${katakanaList.map(kana => `<span data-type="katakana">${kana}</span>`).join('')}
      </div>
    `;
  }

  function initGame() {
    var elements = document.querySelectorAll('[data-type]');
    elements.forEach(el => dndHandler.applyDragEvents(el));
    kanasArea = document.querySelector('.kanas');
    initialKanasHTML = kanasArea.innerHTML;

    for (var i = kanasArea.children.length; i >= 0; i--) {
     kanasArea.appendChild(kanasArea.children[Math.random() * i | 0]);
    }
    document.getElementById('resetBtn').addEventListener('click', function() {
      resetTimer();
      resetKanas();
      resetErrors();
    });
  }

  function loadGame(mode) {
    document.getElementById('game').innerHTML = gameTemplates[mode];
    resetTimer();
    resetErrors();
    initGame();
  }

  document.querySelectorAll('#menu button').forEach(btn => {
    btn.addEventListener('click', function () {
      loadGame(this.dataset.mode);
    });
  });

  loadGame('hiragana');

  function resizeGame() {
    const container = document.getElementById('wrapper');
    if (!container) return;
    const targetWidth = 600;
    const targetHeight = 900;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const scaleX = windowWidth / targetWidth;
    const scaleY = windowHeight / targetHeight;
    const scale = Math.min(scaleX, scaleY);
    container.style.transform = `scale(${scale})`;
  }
  
  window.addEventListener('resize', resizeGame);
  window.addEventListener('load', resizeGame);

  resizeGame();
})();