/* =========================================================
   Markdown Editor – app.js
   Features: tables, images, Word-compatible clipboard copy
   ========================================================= */

(function () {
  'use strict';

  // === DOM refs ===
  const editor   = document.getElementById('editor');
  const preview  = document.getElementById('preview');
  const resizer  = document.getElementById('resizer');
  const toastEl  = document.getElementById('toast');

  // --- Dialogs ---
  const tableDialog  = document.getElementById('table-dialog');
  const imageDialog  = document.getElementById('image-dialog');

  // ============================================================
  //  1. Marked.js configuration
  // ============================================================
  marked.setOptions({
    gfm: true,
    breaks: true,
    highlight: function (code, lang) {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(code, { language: lang }).value;
      }
      return hljs.highlightAuto(code).value;
    },
  });

  // ============================================================
  //  2. Render loop (debounced)
  // ============================================================
  let renderTimer = null;

  function render() {
    const raw = editor.value;
    const html = DOMPurify.sanitize(marked.parse(raw), {
      ADD_TAGS: ['iframe'],
      ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling'],
    });
    preview.innerHTML = html;
    localStorage.setItem('md-editor-content', raw);
  }

  function scheduleRender() {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(render, 120);
  }

  editor.addEventListener('input', scheduleRender);

  // Restore saved content
  const saved = localStorage.getItem('md-editor-content');
  if (saved) {
    editor.value = saved;
  } else {
    editor.value = sampleMarkdown();
  }
  render();

  // ============================================================
  //  3. Toolbar actions
  // ============================================================
  document.querySelector('.toolbar').addEventListener('click', function (e) {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    handleAction(action);
  });

  function handleAction(action) {
    switch (action) {
      case 'bold':         wrapSelection('**', '**'); break;
      case 'italic':       wrapSelection('*', '*'); break;
      case 'strikethrough': wrapSelection('~~', '~~'); break;
      case 'h1':           prefixLine('# '); break;
      case 'h2':           prefixLine('## '); break;
      case 'h3':           prefixLine('### '); break;
      case 'ul':           prefixLine('- '); break;
      case 'ol':           prefixLine('1. '); break;
      case 'blockquote':   prefixLine('> '); break;
      case 'code':         wrapSelection('\n```\n', '\n```\n'); break;
      case 'hr':           insertAtCursor('\n---\n'); break;
      case 'link':         insertLink(); break;
      case 'image':        showImageDialog(); break;
      case 'table':        showTableDialog(); break;
      case 'copy-word':    copyForWord(); break;
    }
  }

  // ============================================================
  //  4. Text manipulation helpers
  // ============================================================
  function wrapSelection(before, after) {
    const start = editor.selectionStart;
    const end   = editor.selectionEnd;
    const text  = editor.value;
    const sel   = text.substring(start, end) || '텍스트';
    editor.value = text.substring(0, start) + before + sel + after + text.substring(end);
    editor.selectionStart = start + before.length;
    editor.selectionEnd   = start + before.length + sel.length;
    editor.focus();
    scheduleRender();
  }

  function prefixLine(prefix) {
    const start = editor.selectionStart;
    const text  = editor.value;
    const lineStart = text.lastIndexOf('\n', start - 1) + 1;
    editor.value = text.substring(0, lineStart) + prefix + text.substring(lineStart);
    editor.selectionStart = editor.selectionEnd = start + prefix.length;
    editor.focus();
    scheduleRender();
  }

  function insertAtCursor(str) {
    const start = editor.selectionStart;
    const text  = editor.value;
    editor.value = text.substring(0, start) + str + text.substring(editor.selectionEnd);
    editor.selectionStart = editor.selectionEnd = start + str.length;
    editor.focus();
    scheduleRender();
  }

  function insertLink() {
    const url = prompt('URL을 입력하세요:', 'https://');
    if (!url) return;
    const start = editor.selectionStart;
    const end   = editor.selectionEnd;
    const sel   = editor.value.substring(start, end) || '링크 텍스트';
    const md    = '[' + sel + '](' + url + ')';
    editor.value = editor.value.substring(0, start) + md + editor.value.substring(end);
    editor.focus();
    scheduleRender();
  }

  // ============================================================
  //  5. Table dialog
  // ============================================================
  function showTableDialog() {
    tableDialog.classList.remove('hidden');
    document.getElementById('table-rows').focus();
  }

  document.getElementById('table-cancel').addEventListener('click', function () {
    tableDialog.classList.add('hidden');
  });

  document.getElementById('table-insert').addEventListener('click', function () {
    const rows = parseInt(document.getElementById('table-rows').value, 10) || 3;
    const cols = parseInt(document.getElementById('table-cols').value, 10) || 3;
    insertTable(rows, cols);
    tableDialog.classList.add('hidden');
  });

  tableDialog.addEventListener('click', function (e) {
    if (e.target === tableDialog) tableDialog.classList.add('hidden');
  });

  function insertTable(rows, cols) {
    let md = '\n';
    // Header
    md += '| ' + Array.from({ length: cols }, function (_, i) { return '제목 ' + (i + 1); }).join(' | ') + ' |\n';
    // Separator
    md += '| ' + Array.from({ length: cols }, function () { return '---'; }).join(' | ') + ' |\n';
    // Rows
    for (let r = 0; r < rows; r++) {
      md += '| ' + Array.from({ length: cols }, function () { return '   '; }).join(' | ') + ' |\n';
    }
    md += '\n';
    insertAtCursor(md);
  }

  // ============================================================
  //  6. Image dialog (URL + file upload with Base64)
  // ============================================================
  const imageTabs = imageDialog.querySelectorAll('.tab');
  const tabUrl    = document.getElementById('tab-url');
  const tabFile   = document.getElementById('tab-file');

  imageTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      imageTabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      if (tab.dataset.tab === 'url') {
        tabUrl.classList.remove('hidden');
        tabFile.classList.add('hidden');
      } else {
        tabUrl.classList.add('hidden');
        tabFile.classList.remove('hidden');
      }
    });
  });

  function showImageDialog() {
    imageDialog.classList.remove('hidden');
    document.getElementById('image-url').value = '';
    document.getElementById('image-alt-url').value = '';
    document.getElementById('image-alt-file').value = '';
    document.getElementById('image-file').value = '';
    document.getElementById('image-preview-container').classList.add('hidden');
    // Reset to URL tab
    imageTabs[0].click();
    document.getElementById('image-url').focus();
  }

  document.getElementById('image-cancel').addEventListener('click', function () {
    imageDialog.classList.add('hidden');
  });

  imageDialog.addEventListener('click', function (e) {
    if (e.target === imageDialog) imageDialog.classList.add('hidden');
  });

  // File preview
  document.getElementById('image-file').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (ev) {
      document.getElementById('image-preview').src = ev.target.result;
      document.getElementById('image-preview-container').classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('image-insert').addEventListener('click', function () {
    const activeTab = imageDialog.querySelector('.tab.active').dataset.tab;
    if (activeTab === 'url') {
      const url = document.getElementById('image-url').value.trim();
      const alt = document.getElementById('image-alt-url').value.trim() || '이미지';
      if (!url) { showToast('URL을 입력하세요'); return; }
      insertAtCursor('![' + alt + '](' + url + ')\n');
    } else {
      const file = document.getElementById('image-file').files[0];
      const alt  = document.getElementById('image-alt-file').value.trim() || '이미지';
      if (!file) { showToast('파일을 선택하세요'); return; }
      const reader = new FileReader();
      reader.onload = function (ev) {
        insertAtCursor('![' + alt + '](' + ev.target.result + ')\n');
      };
      reader.readAsDataURL(file);
    }
    imageDialog.classList.add('hidden');
  });

  // ============================================================
  //  7. Paste images from clipboard directly
  // ============================================================
  editor.addEventListener('paste', function (e) {
    const items = e.clipboardData && e.clipboardData.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = items[i].getAsFile();
        const reader = new FileReader();
        reader.onload = function (ev) {
          insertAtCursor('![붙여넣은 이미지](' + ev.target.result + ')\n');
        };
        reader.readAsDataURL(file);
        return;
      }
    }
  });

  // ============================================================
  //  8. Copy for Word – HTML clipboard with Word-compatible markup
  // ============================================================
  function copyForWord() {
    const raw  = editor.value;
    const html = marked.parse(raw);

    // Build Word-compatible HTML with inline styles
    const wordHtml = buildWordHtml(html);

    // Use Clipboard API to write both HTML and plain text
    const htmlBlob  = new Blob([wordHtml], { type: 'text/html' });
    const textBlob  = new Blob([raw], { type: 'text/plain' });

    navigator.clipboard.write([
      new ClipboardItem({
        'text/html':  htmlBlob,
        'text/plain': textBlob,
      })
    ]).then(function () {
      showToast('Word 호환 형식으로 클립보드에 복사되었습니다!');
    }).catch(function (err) {
      // Fallback: use execCommand
      fallbackCopyHtml(wordHtml, raw);
    });
  }

  function buildWordHtml(html) {
    // Wrap with Word-compatible container and inline styles
    // MS Word reads inline styles much better than class-based styles
    var styled = html
      // Tables
      .replace(/<table>/g,
        '<table style="border-collapse:collapse;width:100%;font-family:\'맑은 고딕\',Calibri,Arial,sans-serif;font-size:11pt;margin:8pt 0;">')
      .replace(/<th>/g,
        '<th style="border:1px solid #999;padding:6pt 10pt;background-color:#f0f0f0;font-weight:bold;text-align:left;">')
      .replace(/<th /g,
        '<th style="border:1px solid #999;padding:6pt 10pt;background-color:#f0f0f0;font-weight:bold;text-align:left;" ')
      .replace(/<td>/g,
        '<td style="border:1px solid #ccc;padding:6pt 10pt;">')
      .replace(/<td /g,
        '<td style="border:1px solid #ccc;padding:6pt 10pt;" ')
      // Headings
      .replace(/<h1>/g, '<h1 style="font-family:\'맑은 고딕\',Calibri,sans-serif;font-size:20pt;font-weight:bold;margin:12pt 0 6pt;">')
      .replace(/<h2>/g, '<h2 style="font-family:\'맑은 고딕\',Calibri,sans-serif;font-size:16pt;font-weight:bold;margin:10pt 0 5pt;">')
      .replace(/<h3>/g, '<h3 style="font-family:\'맑은 고딕\',Calibri,sans-serif;font-size:13pt;font-weight:bold;margin:8pt 0 4pt;">')
      // Paragraphs
      .replace(/<p>/g, '<p style="font-family:\'맑은 고딕\',Calibri,sans-serif;font-size:11pt;line-height:1.6;margin:6pt 0;">')
      // Lists
      .replace(/<ul>/g, '<ul style="font-family:\'맑은 고딕\',Calibri,sans-serif;font-size:11pt;margin:6pt 0;padding-left:20pt;">')
      .replace(/<ol>/g, '<ol style="font-family:\'맑은 고딕\',Calibri,sans-serif;font-size:11pt;margin:6pt 0;padding-left:20pt;">')
      .replace(/<li>/g, '<li style="margin:3pt 0;">')
      // Blockquote
      .replace(/<blockquote>/g,
        '<blockquote style="border-left:3pt solid #4263eb;padding:6pt 12pt;margin:8pt 0;color:#555;background:#f5f5f5;">')
      // Code blocks
      .replace(/<pre>/g,
        '<pre style="background:#f6f8fa;border:1px solid #ddd;padding:10pt;font-family:Consolas,\'Courier New\',monospace;font-size:10pt;white-space:pre-wrap;margin:8pt 0;">')
      .replace(/<code>/g,
        '<code style="font-family:Consolas,\'Courier New\',monospace;font-size:10pt;">')
      // Horizontal rule
      .replace(/<hr>/g, '<hr style="border:none;border-top:1.5pt solid #ccc;margin:12pt 0;">')
      .replace(/<hr \/>/g, '<hr style="border:none;border-top:1.5pt solid #ccc;margin:12pt 0;" />')
      // Images – keep src intact, add max-width
      .replace(/<img /g, '<img style="max-width:100%;height:auto;" ');

    // Word prefers a full HTML document with charset meta
    return '<!DOCTYPE html><html><head>'
      + '<meta charset="UTF-8">'
      + '<meta name="Generator" content="Markdown Editor">'
      + '</head><body style="font-family:\'맑은 고딕\',Calibri,Arial,sans-serif;font-size:11pt;">'
      + styled
      + '</body></html>';
  }

  function fallbackCopyHtml(html, plainText) {
    // Create a hidden div, set innerHTML, select, and copy
    var container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.innerHTML = html;
    document.body.appendChild(container);

    var range = document.createRange();
    range.selectNodeContents(container);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    try {
      document.execCommand('copy');
      showToast('Word 호환 형식으로 클립보드에 복사되었습니다!');
    } catch (err) {
      showToast('복사에 실패했습니다. 브라우저 권한을 확인하세요.');
    }

    sel.removeAllRanges();
    document.body.removeChild(container);
  }

  // ============================================================
  //  9. Resizer (split pane drag)
  // ============================================================
  (function initResizer() {
    let dragging = false;
    const editorPane = document.querySelector('.pane-editor');
    const previewPane = document.querySelector('.pane-preview');

    resizer.addEventListener('mousedown', function (e) {
      e.preventDefault();
      dragging = true;
      resizer.classList.add('active');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', function (e) {
      if (!dragging) return;
      const containerRect = document.querySelector('.editor-container').getBoundingClientRect();
      const ratio = (e.clientX - containerRect.left) / containerRect.width;
      const clamped = Math.max(0.2, Math.min(0.8, ratio));
      editorPane.style.flex = 'none';
      previewPane.style.flex = 'none';
      editorPane.style.width = (clamped * 100) + '%';
      previewPane.style.width = ((1 - clamped) * 100) + '%';
    });

    document.addEventListener('mouseup', function () {
      if (!dragging) return;
      dragging = false;
      resizer.classList.remove('active');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    });
  })();

  // ============================================================
  //  10. Keyboard shortcuts
  // ============================================================
  editor.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b': e.preventDefault(); handleAction('bold'); break;
        case 'i': e.preventDefault(); handleAction('italic'); break;
        case 's': e.preventDefault(); /* save – already auto-saved */ showToast('자동 저장됨'); break;
      }
    }
    // Tab to indent
    if (e.key === 'Tab') {
      e.preventDefault();
      insertAtCursor('  ');
    }
  });

  // ============================================================
  //  11. Toast notification
  // ============================================================
  let toastTimer = null;
  function showToast(msg) {
    clearTimeout(toastTimer);
    toastEl.textContent = msg;
    toastEl.classList.remove('hidden');
    toastEl.classList.add('show');
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('show');
      toastEl.classList.add('hidden');
    }, 2500);
  }

  // ============================================================
  //  12. Sample markdown
  // ============================================================
  function sampleMarkdown() {
    return [
      '# Markdown Editor',
      '',
      '**굵게**, *기울임*, ~~취소선~~ 텍스트를 지원합니다.',
      '',
      '## 표 (Table)',
      '',
      '| 이름 | 나이 | 직업 |',
      '| --- | --- | --- |',
      '| 홍길동 | 30 | 개발자 |',
      '| 김철수 | 25 | 디자이너 |',
      '| 이영희 | 28 | 기획자 |',
      '',
      '## 이미지',
      '',
      '![샘플 이미지](https://via.placeholder.com/400x200/4263eb/ffffff?text=Markdown+Editor)',
      '',
      '## 코드 블록',
      '',
      '```javascript',
      'function hello() {',
      '  console.log("Hello, World!");',
      '}',
      '```',
      '',
      '## 목록',
      '',
      '- 항목 1',
      '- 항목 2',
      '  - 하위 항목',
      '- 항목 3',
      '',
      '> 인용문: 이 에디터에서 작성한 내용을',
      '> "Copy for Word" 버튼으로 복사하면',
      '> MS Word에 표, 이미지 포함 깔끔하게 붙여넣을 수 있습니다.',
      '',
      '---',
      '',
      '즐거운 편집 되세요!',
    ].join('\n');
  }

})();
