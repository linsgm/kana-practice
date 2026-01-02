(function() {
  var dndHandler = {
    
    draggedElement: null, 
    
    placeElement: function(dropper) {
      dropper.classList.remove('over');
      if (dropper.getAttribute('data-kana') == dndHandler.draggedElement.textContent) {
        dropper.querySelector('.placed')?.remove();
        var clonedElement = dndHandler.draggedElement.cloneNode(true);
        clonedElement.classList.add('placed');
        clonedElement = dropper.appendChild(clonedElement); 
        dndHandler.applyDragEvents(clonedElement); 
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
      element.draggable = true;
      var dndHandler = this; 
      element.addEventListener('dragstart', function(e) {
        startTimer();
        dndHandler.draggedElement = e.target; 
        e.dataTransfer.setData('text/plain', '');
      });
      element.addEventListener('click', function(e) {
        if (previousDraggedElement = document.querySelector('.dragging')) {
          previousDraggedElement.classList.remove('dragging');
        }
        dndHandler.draggedElement = e.target; 
        e.target.classList.add('dragging');
      });
    },
    
    applyDropEvents: function(dropper) {
      dropper.addEventListener('dragover', function(e) {
        var target = e.target,
            draggedElement = dndHandler.draggedElement,
            dropClass = draggedElement.getAttribute('data-type'); 
        while (target != null && !target.classList.contains(dropClass)) { 
          target = target.parentNode;
          if (target.tagName == 'BODY') {
            target = null;
          }
        }
        if (target) {
          e.preventDefault(); 
          this.classList.add('over');
        }
      });
      dropper.addEventListener('dragleave', function() {
        this.classList.remove('over');
      });
      var dndHandler = this; 
      dropper.addEventListener('drop', function(e) {
        dndHandler.placeElement(e.target);
      });
      dropper.addEventListener('click', function(e) {
        if (draggedElement = document.querySelector('.dragging')) {
          if (draggedElement.getAttribute('data-type') == e.target.className) {
            dndHandler.placeElement(e.target);
            draggedElement.classList.remove('dragging');
          }
        }
      });
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
  
    var droppers = document.querySelectorAll('.katakana, .hiragana');
    droppers.forEach(drop => dndHandler.applyDropEvents(drop));
  
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

})();