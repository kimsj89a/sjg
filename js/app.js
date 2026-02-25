// ===== MOVO AI - Main Application =====

class MovoApp {
  constructor() {
    this.currentPage = 'dashboard';
    this.slideCount = 5;
    this.currentOutline = [];
    this.selectedStyle = STYLES[4]; // graphic-studio as default
    this.editorSlides = [];
    this.currentSlideIndex = 0;
    this.currentCategory = 'all';

    this.init();
  }

  init() {
    this.renderTemplates();
    this.renderStyleGrid();
    this.updateStylePreview();
  }

  // ===== Navigation =====
  navigate(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(`page-${page}`);
    if (target) {
      target.classList.add('active');
      this.currentPage = page;
    }

    // Update sidebar active state
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const navItem = document.querySelector(`.nav-item[data-page="${page}"]`);
    if (navItem) navItem.classList.add('active');

    // Show/hide sidebar for editor
    const sidebar = document.getElementById('sidebar');
    if (page === 'editor') {
      sidebar.style.display = 'none';
    } else {
      sidebar.style.display = 'flex';
    }
  }

  // ===== Dashboard =====
  adjustSlideCount(delta) {
    this.slideCount = Math.max(1, Math.min(20, this.slideCount + delta));
    document.getElementById('slide-count-value').textContent = this.slideCount;
    this.updateCredits();
  }

  setInput(text) {
    const input = document.getElementById('slide-input');
    input.value = text;
    input.focus();
  }

  selectCategory(btn, category) {
    document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    this.currentCategory = category;
    this.renderTemplates();
  }

  renderTemplates() {
    const gallery = document.getElementById('template-gallery');
    const filtered = this.currentCategory === 'all'
      ? TEMPLATES
      : TEMPLATES.filter(t => t.category === this.currentCategory);

    gallery.innerHTML = filtered.map(t => `
      <div class="template-card" onclick="app.selectTemplate(${t.id})">
        <div class="template-thumb">
          <div class="template-thumb-inner" style="background: ${t.colors.bg}; color: ${t.colors.text}; ${t.colors.border ? 'border: 1px solid ' + t.colors.border : ''}">
            <div style="text-align:center;">
              <div style="font-size: 0.95rem; font-weight: 700; margin-bottom: 4px;">${t.preview.title}</div>
              <div style="font-size: 0.65rem; opacity: 0.7;">${t.preview.subtitle}</div>
            </div>
          </div>
        </div>
        <div class="template-name">${t.name}</div>
      </div>
    `).join('');
  }

  selectTemplate(id) {
    const template = TEMPLATES.find(t => t.id === id);
    if (template) {
      this.setInput(template.name);
      this.generateOutline();
    }
  }

  // ===== Outline Generation =====
  generateOutline() {
    const input = document.getElementById('slide-input');
    const topic = input.value.trim();
    if (!topic) {
      this.showToast('슬라이드 내용을 입력해주세요');
      return;
    }

    // Show loading
    this.showLoading('개요를 생성하고 있습니다', 'AI가 슬라이드 구조를 설계하고 있어요...');

    setTimeout(() => {
      this.currentOutline = generateOutlineData(topic, this.slideCount);
      this.renderOutline();
      this.hideLoading();
      this.navigate('outline');
    }, 1500);
  }

  renderOutline() {
    const list = document.getElementById('outline-list');
    list.innerHTML = this.currentOutline.map((item, i) => `
      <div class="outline-item">
        <div class="outline-item-header">
          <div class="outline-number">${String(i + 1).padStart(2, '0')}</div>
          <div class="outline-title">
            <input type="text" value="${item.title}" onchange="app.updateOutlineTitle(${i}, this.value)">
          </div>
          <span class="outline-badge">${item.type}</span>
        </div>
        <div class="outline-body">
          <div class="outline-section-label">KEY POINTS</div>
          <ul class="outline-keypoints">
            ${item.keypoints.map((kp, ki) => `
              <li contenteditable="true" onblur="app.updateKeypoint(${i}, ${ki}, this.textContent)">${kp}</li>
            `).join('')}
          </ul>
          <div class="outline-section-label">VISUAL</div>
          <div class="outline-visual">${item.visual}</div>
        </div>
      </div>
    `).join('');

    document.getElementById('outline-slide-count').textContent = `총 슬라이드 ${this.currentOutline.length}장`;
  }

  updateOutlineTitle(index, value) {
    this.currentOutline[index].title = value;
  }

  updateKeypoint(slideIndex, kpIndex, value) {
    this.currentOutline[slideIndex].keypoints[kpIndex] = value;
  }

  // ===== Style Selection =====
  renderStyleGrid() {
    const grid = document.getElementById('style-grid');
    grid.innerHTML = STYLES.map(s => `
      <div class="style-card ${s.id === this.selectedStyle.id ? 'active' : ''}" onclick="app.selectStyle('${s.id}')" data-style-id="${s.id}">
        <div class="style-thumb" style="background: ${s.colors.bg}; display:flex; align-items:center; justify-content:center; padding:12px;">
          <div style="text-align:center;">
            <div style="color:${s.colors.text}; font-size:0.7rem; font-weight:700;">프레젠테이션</div>
            <div style="color:${s.colors.subtitle}; font-size:0.5rem; margin-top:2px;">Sample Slide</div>
            <div style="display:flex; gap:3px; justify-content:center; margin-top:6px;">
              ${s.colors.chartColors.slice(0, 4).map(c => `<div style="width:8px; height:${12 + Math.random() * 16}px; background:${c}; border-radius:2px;"></div>`).join('')}
            </div>
          </div>
        </div>
        <div class="style-card-name">${s.name}</div>
      </div>
    `).join('');
  }

  selectStyle(styleId) {
    this.selectedStyle = STYLES.find(s => s.id === styleId);
    document.querySelectorAll('.style-card').forEach(c => c.classList.remove('active'));
    document.querySelector(`[data-style-id="${styleId}"]`).classList.add('active');
    this.updateStylePreview();
  }

  updateStylePreview() {
    const preview = document.getElementById('preview-content');
    const s = this.selectedStyle;
    const topic = document.getElementById('slide-input')?.value || '프레젠테이션';

    preview.style.background = s.colors.bg;
    preview.innerHTML = `
      <div style="color:${s.colors.text}; height:100%; display:flex; flex-direction:column; justify-content:center;">
        <div style="font-size:0.55rem; text-transform:uppercase; letter-spacing:2px; color:${s.colors.subtitle}; margin-bottom:8px;">CHAPTER 01</div>
        <div style="font-size:1.3rem; font-weight:700; margin-bottom:4px;">${this.currentOutline[0]?.title || topic}</div>
        <div style="font-size:0.7rem; color:${s.colors.subtitle}; margin-bottom:20px;">${this.currentOutline[0]?.keypoints?.[0] || '핵심 내용을 담은 프레젠테이션'}</div>
        <div style="display:flex; gap:12px; margin-top:auto;">
          <div style="flex:1;">
            <div style="font-size:0.6rem; font-weight:600; margin-bottom:6px; color:${s.colors.text};">핵심 포인트</div>
            ${(this.currentOutline[0]?.keypoints || ['포인트 1', '포인트 2', '포인트 3']).slice(0, 3).map(kp => `
              <div style="display:flex; align-items:center; gap:4px; margin-bottom:3px;">
                <div style="width:5px; height:5px; border-radius:50%; background:${s.colors.accent};"></div>
                <span style="font-size:0.5rem; color:${s.colors.subtitle};">${kp}</span>
              </div>
            `).join('')}
          </div>
          <div style="flex:1; display:flex; align-items:flex-end; gap:6px; padding-bottom:4px;">
            ${s.colors.chartColors.map((c, i) => `<div style="flex:1; height:${20 + (i === 1 ? 45 : i === 2 ? 35 : 25 + i * 8)}px; background:${c}; border-radius:3px 3px 0 0; opacity:0.8;"></div>`).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // ===== Settings =====
  selectMode(card, mode) {
    document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('active'));
    card.classList.add('active');
    this.updateCredits();
  }

  selectPill(pill) {
    const parent = pill.parentElement;
    parent.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
  }

  updateCredits() {
    const activeMode = document.querySelector('.mode-card.active');
    const isFast = activeMode && activeMode.querySelector('.mode-title').textContent === 'Fast';
    const creditPerSlide = isFast ? 15 : 60;
    const total = creditPerSlide * this.slideCount;
    const display = document.getElementById('credit-display');
    if (display) display.textContent = `${total} 크레딧`;
  }

  // ===== Presentation Generation =====
  generatePresentation() {
    this.showLoading('프레젠테이션을 생성하고 있습니다', 'AI가 슬라이드를 디자인하고 있어요...');

    let progress = 0;
    const bar = document.getElementById('loading-bar');
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress > 95) progress = 95;
      bar.style.width = progress + '%';
    }, 300);

    setTimeout(() => {
      clearInterval(interval);
      bar.style.width = '100%';

      this.editorSlides = generateEditorSlides(this.currentOutline, this.selectedStyle);
      this.currentSlideIndex = 0;

      setTimeout(() => {
        this.hideLoading();
        this.navigate('editor');
        this.renderEditor();
      }, 500);
    }, 3000);
  }

  // ===== Editor =====
  renderEditor() {
    this.renderSlideCanvas();
    this.renderThumbnails();
    this.renderSlideSelect();
    document.getElementById('editor-title').textContent =
      this.currentOutline[0]?.title || '프레젠테이션';
  }

  renderSlideCanvas() {
    const canvas = document.getElementById('slide-canvas');
    const slide = this.editorSlides[this.currentSlideIndex];
    const s = this.selectedStyle;

    if (!slide) return;

    const isFirstSlide = this.currentSlideIndex === 0;
    const isDataSlide = slide.type === '데이터';

    canvas.style.background = s.colors.bg;

    if (isFirstSlide) {
      canvas.innerHTML = this.renderCoverSlide(slide, s);
    } else if (isDataSlide) {
      canvas.innerHTML = this.renderDataSlide(slide, s);
    } else {
      canvas.innerHTML = this.renderContentSlide(slide, s);
    }
  }

  renderCoverSlide(slide, s) {
    return `
      <div class="editor-slide" style="color:${s.colors.text}; justify-content:center; align-items:center; text-align:center;">
        <div class="chapter-label" style="color:${s.colors.subtitle};">PRESENTATION</div>
        <div class="slide-main-title" style="font-size:2.2rem; margin-bottom:12px;">${slide.title}</div>
        <div class="slide-main-subtitle" style="color:${s.colors.subtitle}; font-size:1rem;">
          ${slide.keypoints[0] || ''}
        </div>
        <div style="display:flex; gap:8px; margin-top:32px;">
          ${s.colors.chartColors.map(c => `<div style="width:10px; height:10px; border-radius:50%; background:${c};"></div>`).join('')}
        </div>
        <div class="slide-footer-bar" style="position:absolute; bottom:24px; left:48px; right:48px; color:${s.colors.subtitle};">
          <span>Confidential · Internal Use Only.</span>
          <span>Slide ${slide.id} / ${this.editorSlides.length}</span>
        </div>
      </div>
    `;
  }

  renderDataSlide(slide, s) {
    const chartBars = s.colors.chartColors.map((c, i) => {
      const heights = [65, 85, 45, 70, 90, 55];
      const h = heights[i % heights.length];
      return { color: c, height: h };
    });

    return `
      <div class="editor-slide" style="color:${s.colors.text};">
        <div class="chapter-label" style="color:${s.colors.subtitle};">CHAPTER ${String(slide.id).padStart(2, '0')}</div>
        <div class="slide-main-title">${slide.title}</div>
        <div class="slide-main-subtitle" style="color:${s.colors.subtitle};">${slide.keypoints[0] || ''}</div>
        <div class="slide-content-grid">
          <div class="content-text">
            ${slide.keypoints.map((kp, i) => `
              <div>
                <h4><span class="bullet" style="background:${s.colors.chartColors[i % s.colors.chartColors.length]};"></span> ${kp}</h4>
              </div>
            `).join('')}
          </div>
          <div class="content-chart">
            <div class="growth-badge" style="background:${s.colors.accent}; color:${s.theme === 'dark' ? '#FFF' : '#FFF'};">+125% Growth</div>
            <div class="chart-container">
              <div class="bar-chart">
                ${chartBars.map((b, i) => `
                  <div class="bar-group">
                    <div class="bar" style="background:${b.color}; height:${b.height}%;"></div>
                    <div class="bar-label" style="color:${s.colors.subtitle};">Q${i + 1}</div>
                  </div>
                `).join('')}
              </div>
              <svg class="line-chart-svg" viewBox="0 0 200 60" fill="none">
                <polyline points="10,50 40,30 80,45 120,15 160,25 190,10"
                  stroke="${s.colors.accent}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="10" cy="50" r="3" fill="${s.colors.accent}"/>
                <circle cx="80" cy="45" r="3" fill="${s.colors.accent}"/>
                <circle cx="120" cy="15" r="3" fill="${s.colors.accent}"/>
                <circle cx="190" cy="10" r="3" fill="${s.colors.accent}"/>
              </svg>
            </div>
          </div>
        </div>
        <div class="slide-footer-bar" style="color:${s.colors.subtitle};">
          <span>Confidential · Internal Use Only.</span>
          <span>Slide ${slide.id} / ${this.editorSlides.length}</span>
        </div>
      </div>
    `;
  }

  renderContentSlide(slide, s) {
    return `
      <div class="editor-slide" style="color:${s.colors.text};">
        <div class="chapter-label" style="color:${s.colors.subtitle};">CHAPTER ${String(slide.id).padStart(2, '0')}</div>
        <div class="slide-main-title">${slide.title}</div>
        <div class="slide-main-subtitle" style="color:${s.colors.subtitle};">${slide.visual}</div>
        <div class="slide-content-grid" style="margin-top:16px;">
          <div class="content-text">
            ${slide.keypoints.map((kp, i) => `
              <div>
                <h4><span class="bullet" style="background:${s.colors.chartColors[i % s.colors.chartColors.length]};"></span> ${kp}</h4>
                <p style="color:${s.colors.subtitle};">관련 세부 내용이 여기에 표시됩니다. 클릭하여 내용을 수정할 수 있습니다.</p>
              </div>
            `).join('')}
          </div>
          <div class="content-chart" style="background:${s.theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'}; border-radius:12px; padding:16px;">
            <div style="width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px;">
              <div style="width:60px; height:60px; border-radius:12px; background:${s.colors.accent}20; display:flex; align-items:center; justify-content:center;">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${s.colors.accent}" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <path d="M3 9h18M9 21V9"/>
                </svg>
              </div>
              <div style="font-size:0.65rem; color:${s.colors.subtitle}; text-align:center;">
                ${slide.visual}
              </div>
            </div>
          </div>
        </div>
        <div class="slide-footer-bar" style="color:${s.colors.subtitle};">
          <span>Confidential · Internal Use Only.</span>
          <span>Slide ${slide.id} / ${this.editorSlides.length}</span>
        </div>
      </div>
    `;
  }

  renderThumbnails() {
    const container = document.getElementById('editor-thumbnails');
    container.innerHTML = this.editorSlides.map((slide, i) => `
      <div class="thumb ${i === this.currentSlideIndex ? 'active' : ''}" onclick="app.goToSlide(${i})">
        <div class="thumb-inner" style="background:${this.selectedStyle.colors.bg}; color:${this.selectedStyle.colors.text};">
          <div style="text-align:center;">
            <div style="font-weight:600; font-size:0.4rem; line-height:1.2; overflow:hidden; max-height:2.4em;">${slide.title}</div>
          </div>
        </div>
      </div>
    `).join('');
  }

  renderSlideSelect() {
    const select = document.getElementById('slide-select');
    select.innerHTML = this.editorSlides.map((s, i) => `
      <option value="${i}" ${i === this.currentSlideIndex ? 'selected' : ''}>
        ${i + 1}
      </option>
    `).join('');
    select.onchange = (e) => this.goToSlide(parseInt(e.target.value));
  }

  goToSlide(index) {
    this.currentSlideIndex = index;
    this.renderSlideCanvas();
    this.renderThumbnails();
    document.getElementById('slide-select').value = index;
  }

  // ===== Export =====
  showExportModal() {
    document.getElementById('export-modal').style.display = 'flex';
  }

  hideExportModal() {
    document.getElementById('export-modal').style.display = 'none';
  }

  exportAs(format) {
    const formatNames = {
      figma: 'Figma',
      pptx: 'PowerPoint',
      pdf: 'PDF',
      image: '이미지'
    };
    this.hideExportModal();
    this.showToast(`${formatNames[format]}로 내보내기를 준비하고 있습니다...`);

    setTimeout(() => {
      this.showToast(`${formatNames[format]} 파일이 준비되었습니다!`);
    }, 2000);
  }

  // ===== Utilities =====
  showLoading(title, desc) {
    document.getElementById('loading-title').textContent = title;
    document.getElementById('loading-desc').textContent = desc;
    document.getElementById('loading-bar').style.width = '0%';
    document.getElementById('loading-overlay').style.display = 'flex';
  }

  hideLoading() {
    document.getElementById('loading-overlay').style.display = 'none';
  }

  showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.opacity = '1';
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
}

// ===== Initialize App =====
const app = new MovoApp();
