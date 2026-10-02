/**
 * ==========================================================================
 * JOHN AI STUDIO - INTERACTIVE HANDS-ON AI & SOFTWARE LAB ENGINE
 * ==========================================================================
 * Pure Vanilla JavaScript implementation with Native 3D Canvas Rendering
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Core Application Systems
  CoreSystem.init();

  // 3D Visual Effects
  Hero3DModule.init();
  TiltCardModule.init();

  // Initialize 6 Interactive Lab Models
  LLMPredictorModule.init();
  PromptAnalyzerModule.init();
  ChatSimulatorModule.init();
  Architecture3DModule.init();
  IoTSimulatorModule.init();
  TokenEstimatorModule.init();

  // Initialize Supporting Features
  ToolsExplorerModule.init();
  PromptLibraryModule.init();
  QuizModule.init();
  HierarchyModule.init();

  // Initialize Visualizer Pipelines
  ArchitectureFlowVisualizer.init();

  // Initialize AI Powered Voice Chatbot
  VoiceChatbotModule.init();
});

/* ==========================================================================
   0. CORE SYSTEM (Theme, Navigation, Toast Notifications, Lab Tracker)
   ========================================================================== */
const CoreSystem = (() => {
  const completedModels = new Set(JSON.parse(localStorage.getItem('ai_lab_completed') || '[]'));

  function init() {
    setupThemeToggle();
    setupMobileNav();
    setupScrollProgress();
    setupActiveNavHighlight();
    setupLabProgressTracker();
  }

  function setupThemeToggle() {
    const themeBtn = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('john_ai_studio_theme') || localStorage.getItem('ai_academy_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    themeBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('john_ai_studio_theme', next);
      showToast(`Switched to ${next} mode!`, '✨');
    });
  }

  function setupMobileNav() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');
    if (!menuBtn || !navLinks) return;

    menuBtn.addEventListener('click', () => {
      const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
      menuBtn.setAttribute('aria-expanded', !isExpanded);
      navLinks.classList.toggle('active');
    });

    navLinks.querySelectorAll('.nav-item').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  function setupScrollProgress() {
    const progressBar = document.getElementById('reading-progress');
    window.addEventListener('scroll', () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      if (progressBar) progressBar.style.width = `${scrolled}%`;
    });
  }

  function setupActiveNavHighlight() {
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.nav-item');

    window.addEventListener('scroll', () => {
      let current = '';
      const scrollY = window.pageYOffset;

      sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.offsetHeight;
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
          current = section.getAttribute('id');
        }
      });

      navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href') === `#${current}`) {
          item.classList.add('active');
        }
      });
    });
  }

  function setupLabProgressTracker() {
    const completionBtns = document.querySelectorAll('.completion-btn');

    completionBtns.forEach(btn => {
      const cardId = btn.getAttribute('data-target');
      if (completedModels.has(cardId)) {
        markAsCompletedUI(btn, true);
      }

      btn.addEventListener('click', () => {
        if (completedModels.has(cardId)) {
          completedModels.delete(cardId);
          markAsCompletedUI(btn, false);
          showToast('Marked model as incomplete', 'ℹ️');
        } else {
          completedModels.add(cardId);
          markAsCompletedUI(btn, true);
          showToast('Model completed! Good job!', '🎉');
        }
        updateGlobalProgress();
      });
    });

    updateGlobalProgress();
  }

  function markAsCompletedUI(btn, isCompleted) {
    if (isCompleted) {
      btn.classList.add('completed');
      btn.querySelector('.comp-text').textContent = 'Completed';
    } else {
      btn.classList.remove('completed');
      btn.querySelector('.comp-text').textContent = 'Mark Completed';
    }
  }

  function updateGlobalProgress() {
    const total = 6;
    const count = completedModels.size;
    const percent = Math.round((count / total) * 100);

    localStorage.setItem('ai_lab_completed', JSON.stringify([...completedModels]));

    const navCount = document.getElementById('nav-lab-count');
    const globalCircle = document.getElementById('global-progress-circle');
    const globalText = document.getElementById('global-progress-text');
    const labCompletedText = document.getElementById('lab-completed-text');
    const labFill = document.getElementById('lab-progress-fill');

    if (navCount) navCount.textContent = `${count}/${total}`;
    if (globalText) globalText.textContent = `${percent}%`;
    if (labCompletedText) labCompletedText.textContent = `${count} of ${total} Models Completed`;
    if (labFill) labFill.style.width = `${percent}%`;

    if (globalCircle) {
      const circumference = 88;
      const offset = circumference - (percent / 100) * circumference;
      globalCircle.style.strokeDashoffset = offset;
    }
  }

  function showToast(message, icon = '✅') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  return { init, showToast };
})();

/* ==========================================================================
   3D VISUAL EFFECTS: HERO 3D PARTICLE SPHERE CANVAS
   ========================================================================== */
const Hero3DModule = (() => {
  let canvas, ctx;
  let points = [];
  let numPoints = 80;
  let angleX = 0.002;
  let angleY = 0.003;
  let mouseX = 0, mouseY = 0;

  function init() {
    canvas = document.getElementById('hero-3d-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    resize();
    window.addEventListener('resize', resize);

    // Create 3D points on a sphere
    const radius = 180;
    for (let i = 0; i < numPoints; i++) {
      let theta = Math.acos((Math.random() * 2) - 1);
      let phi = Math.random() * Math.PI * 2;
      points.push({
        x: radius * Math.sin(theta) * Math.cos(phi),
        y: radius * Math.sin(theta) * Math.sin(phi),
        z: radius * Math.cos(theta),
        size: Math.random() * 2.5 + 1.5
      });
    }

    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.00005;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.00005;
    });

    animate();
  }

  function resize() {
    if (!canvas) return;
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
  }

  function animate() {
    if (!canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const focalLength = 300;

    let rotX = angleX + mouseY;
    let rotY = angleY + mouseX;

    // Rotate points
    points.forEach(pt => {
      // Rotate Y
      let x1 = pt.x * Math.cos(rotY) - pt.z * Math.sin(rotY);
      let z1 = pt.z * Math.cos(rotY) + pt.x * Math.sin(rotY);

      // Rotate X
      let y1 = pt.y * Math.cos(rotX) - z1 * Math.sin(rotX);
      let z2 = z1 * Math.cos(rotX) + pt.y * Math.sin(rotX);

      pt.x = x1; pt.y = y1; pt.z = z2;

      // 3D Perspective Projection
      let scale = focalLength / (focalLength + pt.z + 200);
      let px = pt.x * scale + cx;
      let py = pt.y * scale + cy;

      // Draw node
      ctx.beginPath();
      ctx.arc(px, py, pt.size * scale, 0, Math.PI * 2);
      ctx.fillStyle = pt.z > 0 ? '#6366f1' : '#06b6d4';
      ctx.globalAlpha = Math.max(0.1, scale - 0.4);
      ctx.fill();
    });

    // Draw connection lines
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)';
    ctx.lineWidth = 1;
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        let dx = points[i].x - points[j].x;
        let dy = points[i].y - points[j].y;
        let dz = points[i].z - points[j].z;
        let dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

        if (dist < 85) {
          let scaleI = focalLength / (focalLength + points[i].z + 200);
          let scaleJ = focalLength / (focalLength + points[j].z + 200);
          let pxI = points[i].x * scaleI + cx;
          let pyI = points[i].y * scaleI + cy;
          let pxJ = points[j].x * scaleJ + cx;
          let pyJ = points[j].y * scaleJ + cy;

          ctx.beginPath();
          ctx.moveTo(pxI, pyI);
          ctx.lineTo(pxJ, pyJ);
          ctx.stroke();
        }
      }
    }

    ctx.globalAlpha = 1.0;
    requestAnimationFrame(animate);
  }

  return { init };
})();

/* ==========================================================================
   3D VISUAL EFFECTS: HYPER-SMOOTH 3D PARALLAX & SPECULAR SHEEN ENGINE
   ========================================================================== */
const TiltCardModule = (() => {
  function init() {
    const cards = document.querySelectorAll('.tilt-card');

    cards.forEach(card => {
      // Ensure specular light sheen element exists inside card
      let shine = card.querySelector('.card-3d-shine');
      if (!shine) {
        shine = document.createElement('div');
        shine.className = 'card-3d-shine';
        card.appendChild(shine);
      }

      let reqId = null;
      let targetX = 0, targetY = 0;
      let currX = 0, currY = 0;
      let shineX = 50, shineY = 50;
      let isHovered = false;

      function update() {
        if (!isHovered && Math.abs(currX) < 0.01 && Math.abs(currY) < 0.01) {
          card.style.transform = `perspective(1200px) rotateX(0deg) rotateY(0deg) translateZ(0px)`;
          if (shine) shine.style.opacity = '0';
          cancelAnimationFrame(reqId);
          reqId = null;
          return;
        }

        // Smooth spring lerp interpolation for butter-smooth movement
        currX += (targetX - currX) * 0.12;
        currY += (targetY - currY) * 0.12;

        const tz = isHovered ? 12 : 0;
        card.style.transform = `perspective(1200px) rotateX(${currX.toFixed(2)}deg) rotateY(${currY.toFixed(2)}deg) translateZ(${tz}px)`;

        if (shine && isHovered) {
          shine.style.opacity = '1';
          shine.style.background = `radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255, 255, 255, 0.22) 0%, rgba(99, 102, 241, 0.1) 40%, transparent 70%)`;
        }

        reqId = requestAnimationFrame(update);
      }

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        targetX = ((y - centerY) / centerY) * -9;
        targetY = ((x - centerX) / centerX) * 9;

        shineX = (x / rect.width) * 100;
        shineY = (y / rect.height) * 100;

        if (!isHovered) {
          isHovered = true;
          if (!reqId) reqId = requestAnimationFrame(update);
        }
      });

      card.addEventListener('mouseleave', () => {
        isHovered = false;
        targetX = 0;
        targetY = 0;
      });
    });
  }

  return { init };
})();

/* ==========================================================================
   MODULE 1: HOW LLMS PREDICT WORDS & TEMPERATURE
   ========================================================================== */
const LLMPredictorModule = (() => {
  const wordTables = {
    "The future of artificial intelligence is": [
      { word: "promising", prob: 0.45 },
      { word: "transformative", prob: 0.25 },
      { word: "unpredictable", prob: 0.15 },
      { word: "exciting", prob: 0.10 },
      { word: "complex", prob: 0.05 }
    ],
    "Students who learn to prompt effectively can": [
      { word: "create", prob: 0.40 },
      { word: "solve", prob: 0.30 },
      { word: "accelerate", prob: 0.18 },
      { word: "master", prob: 0.08 },
      { word: "innovate", prob: 0.04 }
    ],
    "In a world powered by smart technology": [
      { word: "human", prob: 0.50 },
      { word: "creativity", prob: 0.25 },
      { word: "ethics", prob: 0.12 },
      { word: "education", prob: 0.08 },
      { word: "safety", prob: 0.05 }
    ]
  };

  const followUpDict = {
    "promising": ["for", "education", "and", "society"],
    "transformative": ["because", "it", "empowers", "students"],
    "create": ["amazing", "projects", "with", "ease"],
    "human": ["ingenuity", "becomes", "more", "important"]
  };

  let currentPrompt = "";
  let generatedWords = [];
  let isAutoGenerating = false;

  function init() {
    const promptSelect = document.getElementById('llm-prompt-select');
    const tempSlider = document.getElementById('llm-temp-slider');
    const stepBtn = document.getElementById('llm-step-btn');
    const autoBtn = document.getElementById('llm-auto-btn');
    const resetBtn = document.getElementById('llm-reset-btn');

    if (!promptSelect) return;

    currentPrompt = promptSelect.value;
    updatePromptDisplay();

    promptSelect.addEventListener('change', (e) => {
      currentPrompt = e.target.value;
      resetState();
    });

    tempSlider.addEventListener('input', (e) => {
      document.getElementById('llm-temp-val').textContent = e.target.value;
      renderProbabilities();
    });

    stepBtn.addEventListener('click', () => generateNextWord());
    autoBtn.addEventListener('click', () => autoGenerate());
    resetBtn.addEventListener('click', () => resetState());
  }

  function resetState() {
    generatedWords = [];
    isAutoGenerating = false;
    document.getElementById('llm-generated-output').textContent = '';
    updatePromptDisplay();
  }

  function updatePromptDisplay() {
    const tokensBox = document.getElementById('llm-tokens-box');
    tokensBox.innerHTML = '';

    const words = currentPrompt.split(' ');
    const colors = ['#6366f1', '#06b6d4', '#f43f5e', '#f59e0b', '#10b981'];

    words.forEach((w, idx) => {
      const chip = document.createElement('span');
      chip.className = 'token-chip';
      chip.textContent = w;
      chip.style.backgroundColor = `${colors[idx % colors.length]}22`;
      chip.style.color = colors[idx % colors.length];
      chip.style.border = `1px solid ${colors[idx % colors.length]}44`;
      tokensBox.appendChild(chip);
    });

    renderProbabilities();
    if (typeof LLMAttentionVisualizer !== 'undefined') {
      LLMAttentionVisualizer.render(words);
    }
  }

  function applyTemperature(probs, temp) {
    let logits = probs.map(p => Math.log(p.prob + 1e-6) / temp);
    let maxLogit = Math.max(...logits);
    let exps = logits.map(l => Math.exp(l - maxLogit));
    let sumExps = exps.reduce((a, b) => a + b, 0);

    return probs.map((p, i) => ({
      word: p.word,
      prob: exps[i] / sumExps
    }));
  }

  function renderProbabilities() {
    const barsContainer = document.getElementById('llm-prob-bars');
    const temp = parseFloat(document.getElementById('llm-temp-slider').value);
    barsContainer.innerHTML = '';

    let baseProbs = wordTables[currentPrompt] || wordTables["The future of artificial intelligence is"];
    let adjustedProbs = applyTemperature(baseProbs, temp);

    adjustedProbs.forEach(item => {
      const pct = Math.round(item.prob * 100);
      const row = document.createElement('div');
      row.className = 'prob-bar-item';
      row.innerHTML = `
        <span class="prob-w-name">${item.word}</span>
        <div class="w-bar-wrap"><div class="prob-w-fill" style="width: ${pct}%;"></div></div>
        <span style="width:35px; text-align:right;">${pct}%</span>
      `;
      barsContainer.appendChild(row);
    });
  }

  function generateNextWord() {
    const temp = parseFloat(document.getElementById('llm-temp-slider').value);
    let baseProbs = wordTables[currentPrompt] || wordTables["The future of artificial intelligence is"];
    let adjustedProbs = applyTemperature(baseProbs, temp);

    let rand = Math.random();
    let cumulative = 0;
    let chosenWord = adjustedProbs[0].word;

    for (let item of adjustedProbs) {
      cumulative += item.prob;
      if (rand <= cumulative) {
        chosenWord = item.word;
        break;
      }
    }

    if (generatedWords.length < 8) {
      if (generatedWords.length === 0) {
        generatedWords.push(chosenWord);
      } else {
        const lastWord = generatedWords[generatedWords.length - 1];
        const nextPool = followUpDict[lastWord] || ["and", "learning", "skills", "today", "rapidly"];
        const randNext = nextPool[Math.floor(Math.random() * nextPool.length)];
        generatedWords.push(randNext);
      }
    }

    const outBox = document.getElementById('llm-generated-output');
    outBox.textContent = `${currentPrompt} ${generatedWords.join(' ')}`;
  }

  function autoGenerate() {
    if (isAutoGenerating) return;
    isAutoGenerating = true;
    let count = 0;

    const interval = setInterval(() => {
      if (count >= 5 || !isAutoGenerating) {
        clearInterval(interval);
        isAutoGenerating = false;
        return;
      }
      generateNextWord();
      count++;
    }, 400);
  }

  return { init };
})();

/* ==========================================================================
   MODULE 2: PROMPT QUALITY ANALYZER & IMPROVER
   ========================================================================== */
const PromptAnalyzerModule = (() => {
  function init() {
    const textarea = document.getElementById('analyzer-input');
    const improveBtn = document.getElementById('analyzer-improve-btn');
    const resetBtn = document.getElementById('analyzer-reset-btn');

    if (!textarea) return;

    textarea.addEventListener('input', () => analyzePrompt(textarea.value));
    improveBtn.addEventListener('click', () => improvePrompt());
    resetBtn.addEventListener('click', () => {
      textarea.value = '';
      analyzePrompt('');
    });
  }

  function analyzePrompt(text) {
    const lower = text.toLowerCase().trim();

    const hasRole = /(act as|you are a|as an expert|role:|persona|tutor|professor|engineer)/i.test(lower);
    const hasTask = /(explain|write|create|generate|analyze|summarize|code|design|list)/i.test(lower);
    const hasContext = /(for a|target|background|student|high school|beginner|scenario|context:)/i.test(lower);
    const hasFormat = /(bullet|table|json|summary|step-by-step|essay|paragraph|format:)/i.test(lower);
    const hasConstraints = /(under|max|limit|words|no jargon|friendly tone|do not|constraints:)/i.test(lower);

    toggleCheck('chk-role', hasRole);
    toggleCheck('chk-task', hasTask);
    toggleCheck('chk-context', hasContext);
    toggleCheck('chk-format', hasFormat);
    toggleCheck('chk-constraints', hasConstraints);

    let score = 0;
    if (lower.length > 5) score += 10;
    if (hasRole) score += 20;
    if (hasTask) score += 20;
    if (hasContext) score += 20;
    if (hasFormat) score += 15;
    if (hasConstraints) score += 15;

    updateScoreUI(score);
    renderTips(hasRole, hasTask, hasContext, hasFormat, hasConstraints, lower.length);
  }

  function toggleCheck(id, isActive) {
    const item = document.getElementById(id);
    if (!item) return;
    if (isActive) {
      item.classList.add('active');
      item.querySelector('.chk-icon').textContent = '✅';
    } else {
      item.classList.remove('active');
      item.querySelector('.chk-icon').textContent = '❌';
    }
  }

  function updateScoreUI(score) {
    const circle = document.getElementById('analyzer-score-circle');
    const num = document.getElementById('analyzer-score-num');
    const label = document.getElementById('analyzer-score-label');

    if (!circle || !num) return;
    num.textContent = score;

    if (score >= 80) {
      circle.style.borderColor = 'var(--success)';
      label.textContent = 'Master Prompt! 🌟';
      label.style.color = 'var(--success)';
    } else if (score >= 50) {
      circle.style.borderColor = 'var(--warning)';
      label.textContent = 'Good Start 👍';
      label.style.color = 'var(--warning)';
    } else {
      circle.style.borderColor = 'var(--error)';
      label.textContent = 'Needs Work ⚠️';
      label.style.color = 'var(--error)';
    }
  }

  function renderTips(hasRole, hasTask, hasContext, hasFormat, hasConstraints, len) {
    const tipsBox = document.getElementById('analyzer-tips');
    if (!tipsBox) return;

    if (len === 0) {
      tipsBox.innerHTML = '💡 <strong>Improvement Tips:</strong> Start typing above to get real-time recommendations!';
      return;
    }

    let tips = [];
    if (!hasRole) tips.push('Add a <strong>Role</strong> (e.g. "Act as a math teacher")');
    if (!hasTask) tips.push('Use a clear <strong>Task verb</strong> (e.g. "Explain", "Compare")');
    if (!hasContext) tips.push('Provide <strong>Context</strong> (e.g. "for a 9th grade biology test")');
    if (!hasFormat) tips.push('Specify a <strong>Format</strong> (e.g. "3 bullet points")');
    if (!hasConstraints) tips.push('Set <strong>Constraints</strong> (e.g. "under 150 words, simple language")');

    if (tips.length === 0) {
      tipsBox.innerHTML = '🎉 <strong>Flawless Prompt!</strong> You included all 5 essential structural components.';
    } else {
      tipsBox.innerHTML = `💡 <strong>Suggestions to reach 100/100:</strong><br>• ${tips.join('<br>• ')}`;
    }
  }

  function improvePrompt() {
    const textarea = document.getElementById('analyzer-input');
    const current = textarea.value.trim();

    const template = `[Role] Act as an expert AI tutor.
[Task] Explain ${current || 'how machine learning works'}.
[Context] Target high school students with no technical background.
[Format] Format your output into 3 concise bullet points with key terms bolded.
[Constraints] Keep the entire response under 150 words and use a friendly, encouraging tone.`;

    textarea.value = template;
    analyzePrompt(template);
    CoreSystem.showToast('Prompt automatically rewritten using 5-Part Formula!', '✨');
  }

  return { init };
})();

/* ==========================================================================
   MODULE 3: MOCK AI CHAT SIMULATOR (Vague vs Detailed)
   ========================================================================== */
const ChatSimulatorModule = (() => {
  const chatScenarios = {
    study: {
      vagueQ: "How do I study for exams?",
      vagueA: "To study for exams, make a schedule, take good notes, eat well, get enough sleep, and review your textbook regularly.",
      detailedQ: "Act as an academic coach. Create a 3-day study schedule for a High School Chemistry exam covering Reaction Kinetics. Format as a bulleted plan with 30-minute study blocks and active recall techniques.",
      detailedA: "### 🧪 3-Day Chemistry Study Plan (Active Recall)\n\n**Day 1: Kinetics Fundamentals (60 min)**\n- 00-30 min: Draw collision theory diagrams from memory.\n- 30-60 min: Flashcard quiz on rate law formulas.\n\n**Day 2: Practice Calculations (60 min)**\n- 00-30 min: Solve 3 sample problems without looking at solutions.\n- 30-60 min: Redo missed questions and explain steps out loud.\n\n**Day 3: Final Review (30 min)**\n- 00-30 min: Full mock test under exam conditions."
    },
    coding: {
      vagueQ: "Fix my code error.",
      vagueA: "Make sure you checked for syntax errors, missing semicolons, or typos in your variable names.",
      detailedQ: "Act as a Python mentor. Debug why my loop raises IndexError: list index out of range. Explain the root cause in 2 sentences, then provide the corrected code snippet with comments.",
      detailedA: "### 🐍 Python Debugging Guide\n\n**Root Cause:** You iterated up to `len(items)` using 1-based indexing, but Python lists are 0-indexed, causing the last iteration to request an element past the array boundary.\n\n```python\n# Corrected Loop\nitems = [10, 20, 30]\nfor i in range(len(items)):  # Properly stays within 0 to 2\n    print(items[i])\n```"
    },
    essay: {
      vagueQ: "Give me essay ideas.",
      vagueA: "You could write about technology, history, climate change, literature, or social media.",
      detailedQ: "Act as a creative writing instructor. Brainstorm 3 unique argumentative essay hooks on the impact of AI in school classrooms. Provide a title, thesis statement, and pros/cons for each.",
      detailedA: "### 📝 3 Unique Essay Frameworks\n\n1. **Title:** *The Automated Classroom*\n- **Thesis:** AI tutors democratize 1-on-1 education for underprivileged students.\n- **Pros:** Personalized pacing | **Cons:** Over-reliance on screens.\n\n2. **Title:** *Rethinking Homework in the GenAI Era*\n- **Thesis:** Traditional essays must evolve into oral defense presentations."
    }
  };

  function init() {
    const runBtn = document.getElementById('chat-run-btn');
    const resetBtn = document.getElementById('chat-reset-btn');
    const presetSelect = document.getElementById('chat-preset-select');

    if (!runBtn) return;

    runBtn.addEventListener('click', () => runSideBySideChat());
    resetBtn.addEventListener('click', () => clearChats());
    presetSelect.addEventListener('change', () => clearChats());

    clearChats();
  }

  function clearChats() {
    document.getElementById('chat-vague-box').innerHTML = '<span class="text-muted text-center">Click "Send Questions" to trigger comparison!</span>';
    document.getElementById('chat-detailed-box').innerHTML = '<span class="text-muted text-center">Click "Send Questions" to trigger comparison!</span>';
  }

  function runSideBySideChat() {
    const presetKey = document.getElementById('chat-preset-select').value;
    const data = chatScenarios[presetKey];

    const vagueBox = document.getElementById('chat-vague-box');
    const detailedBox = document.getElementById('chat-detailed-box');

    vagueBox.innerHTML = `
      <div class="chat-msg user">"${data.vagueQ}"</div>
      <div class="chat-msg bot">${data.vagueA}</div>
    `;

    detailedBox.innerHTML = `
      <div class="chat-msg user">"${data.detailedQ}"</div>
      <div class="chat-msg bot">${data.detailedA.replace(/\n/g, '<br>')}</div>
    `;

    CoreSystem.showToast('Simulated side-by-side response!', '💬');
  }

  return { init };
})();

/* ==========================================================================
   MODULE 4: 3D SOFTWARE ARCHITECTURE & REQUEST FLOW SIMULATOR
   ========================================================================== */
const Architecture3DModule = (() => {
  let canvas, ctx;
  let packets = [];
  let requestCount = 0;
  let rotAngle = 0.2;
  let isDragging = false;
  let lastMouseX = 0;

  function init() {
    canvas = document.getElementById('arch-3d-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    setupControls();
    animate();
    if (typeof ArchitectureFlowVisualizer !== 'undefined') {
      ArchitectureFlowVisualizer.init();
    }
  }

  function setupControls() {
    const slider = document.getElementById('arch-load-slider');
    const select = document.getElementById('arch-nodes-select');
    const spikeBtn = document.getElementById('arch-send-packet-btn');
    const resetBtn = document.getElementById('arch-reset-btn');

    slider.addEventListener('input', (e) => {
      document.getElementById('arch-load-val').textContent = `${e.target.value} req/sec`;
      updateLatency();
    });

    select.addEventListener('change', () => updateLatency());

    spikeBtn.addEventListener('click', () => {
      for (let i = 0; i < 12; i++) spawnPacket();
      CoreSystem.showToast('Traffic spike triggered! Packets routed across clusters.', '⚡');
    });

    resetBtn.addEventListener('click', () => {
      packets = [];
      requestCount = 0;
      slider.value = 100;
      select.value = "3";
      document.getElementById('arch-load-val').textContent = '100 req/sec';
      document.getElementById('arch-req-count').textContent = '0';
      updateLatency();
    });

    // 3D Rotation Controls
    canvas.addEventListener('mousedown', (e) => { isDragging = true; lastMouseX = e.clientX; });
    window.addEventListener('mousemove', (e) => {
      if (isDragging) {
        let delta = e.clientX - lastMouseX;
        rotAngle += delta * 0.01;
        lastMouseX = e.clientX;
      }
    });
    window.addEventListener('mouseup', () => isDragging = false);
  }

  function updateLatency() {
    const load = parseInt(document.getElementById('arch-load-slider').value);
    const nodes = parseInt(document.getElementById('arch-nodes-select').value);

    // Latency = base + (load / nodes)
    let lat = Math.round(12 + (load / (nodes * 4)));
    document.getElementById('arch-latency').textContent = `${lat}ms`;

    const statusInfo = document.getElementById('arch-status-info');
    if (lat > 45) {
      statusInfo.className = 'info-callout text-sm bad-badge';
      statusInfo.innerHTML = `⚠️ <strong>High Latency Warning (${lat}ms):</strong> Server nodes overloaded! Scale cluster to reduce latency.`;
    } else {
      statusInfo.className = 'info-callout text-sm good-badge';
      statusInfo.innerHTML = `🟢 <strong>System Status (${lat}ms):</strong> Optimal throughput. Packet loss: 0.0%`;
    }
  }

  function spawnPacket() {
    packets.push({
      progress: 0,
      speed: 0.015 + Math.random() * 0.01,
      path: Math.floor(Math.random() * parseInt(document.getElementById('arch-nodes-select').value))
    });
    requestCount++;
    document.getElementById('arch-req-count').textContent = requestCount;
  }

  function animate() {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2 + 10;
    const load = parseInt(document.getElementById('arch-load-slider').value);
    const nodeCount = parseInt(document.getElementById('arch-nodes-select').value);

    // Random packet spawner based on load
    if (Math.random() < load / 500) {
      spawnPacket();
    }

    // Define 3D Node Positions
    const nodes = [
      { name: "Client", x: -120, y: 0, z: -50, color: "#6366f1" },
      { name: "API Gateway", x: -40, y: 0, z: -20, color: "#06b6d4" },
      { name: "Load Balancer", x: 20, y: 0, z: 0, color: "#f59e0b" }
    ];

    // Backend Microservice Cluster Nodes
    for (let i = 0; i < nodeCount; i++) {
      let offset = (i - (nodeCount - 1) / 2) * 50;
      nodes.push({
        name: `Node ${i+1}`,
        x: 90,
        y: offset,
        z: 30,
        color: "#10b981"
      });
    }

    // Database Node
    nodes.push({ name: "DB / Cache", x: 150, y: 0, z: 60, color: "#f43f5e" });

    // 3D Perspective Projection Function
    const project = (pt) => {
      let cos = Math.cos(rotAngle);
      let sin = Math.sin(rotAngle);
      let rx = pt.x * cos - pt.z * sin;
      let rz = pt.z * cos + pt.x * sin;
      let scale = 220 / (220 + rz + 80);
      return {
        x: rx * scale + cx,
        y: pt.y * scale + cy,
        scale
      };
    };

    // 1. Draw Connections between Nodes
    for (let i = 0; i < nodes.length - 1; i++) {
      let p1 = project(nodes[i]);
      let p2 = project(nodes[i+1]);

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // 2. Render Animated Data Packets
    for (let i = packets.length - 1; i >= 0; i--) {
      let p = packets[i];
      p.progress += p.speed;

      if (p.progress >= 1) {
        packets.splice(i, 1);
        continue;
      }

      // Interpolate position through node steps
      let stepIndex = Math.floor(p.progress * (nodes.length - 1));
      let subProgress = (p.progress * (nodes.length - 1)) - stepIndex;

      let n1 = nodes[stepIndex];
      let n2 = nodes[Math.min(stepIndex + 1, nodes.length - 1)];

      let currX = n1.x + (n2.x - n1.x) * subProgress;
      let currY = n1.y + (n2.y - n1.y) * subProgress;
      let currZ = n1.z + (n2.z - n1.z) * subProgress;

      let proj = project({ x: currX, y: currY, z: currZ });

      ctx.beginPath();
      ctx.arc(proj.x, proj.y, 4 * proj.scale, 0, Math.PI * 2);
      ctx.fillStyle = "#22d3ee";
      ctx.shadowColor = "#06b6d4";
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // 3. Draw Nodes (3D Cubes/Pills)
    nodes.forEach(n => {
      let proj = project(n);
      let size = 18 * proj.scale;

      ctx.beginPath();
      ctx.arc(proj.x, proj.y, size, 0, Math.PI * 2);
      ctx.fillStyle = n.color;
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Node Label
      ctx.fillStyle = "#ffffff";
      ctx.font = `${Math.round(10 * proj.scale)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(n.name, proj.x, proj.y + size + 14);
    });

    requestAnimationFrame(animate);
  }

  return { init };
})();

/* ==========================================================================
   MODULE 5: IOT SMART HOME SIMULATOR
   ========================================================================== */
const IoTSimulatorModule = (() => {
  let isMotion = false;

  function init() {
    const tempSlider = document.getElementById('sensor-temp');
    const lightSlider = document.getElementById('sensor-light');
    const motionBtn = document.getElementById('sensor-motion-btn');
    const resetBtn = document.getElementById('iot-reset-btn');

    if (!tempSlider) return;

    tempSlider.addEventListener('input', (e) => {
      document.getElementById('temp-val').textContent = e.target.value;
      evaluateRules();
    });

    lightSlider.addEventListener('input', (e) => {
      document.getElementById('light-val').textContent = e.target.value;
      evaluateRules();
    });

    motionBtn.addEventListener('click', () => {
      isMotion = !isMotion;
      motionBtn.textContent = isMotion ? 'Motion: YES 🏃‍♂️' : 'Motion: NO 🏃‍♂️';
      evaluateRules();
    });

    resetBtn.addEventListener('click', () => {
      tempSlider.value = 24; lightSlider.value = 70; isMotion = false;
      document.getElementById('temp-val').textContent = 24;
      document.getElementById('light-val').textContent = 70;
      motionBtn.textContent = 'Motion: NO 🏃‍♂️';
      evaluateRules();
    });

    evaluateRules();
  }

  function evaluateRules() {
    const temp = parseInt(document.getElementById('sensor-temp').value);
    const light = parseInt(document.getElementById('sensor-light').value);

    setDeviceStatus('dev-fan', 'fan-status', temp > 30);
    setDeviceStatus('dev-lamp', 'lamp-status', light < 30);
    setDeviceStatus('dev-alarm', 'alarm-status', isMotion);
  }

  function setDeviceStatus(devId, statusId, isActive) {
    const dev = document.getElementById(devId);
    const status = document.getElementById(statusId);
    if (!dev || !status) return;

    if (isActive) {
      dev.classList.add('active');
      status.className = 'dev-status badge-on'; status.textContent = 'ON';
    } else {
      dev.classList.remove('active');
      status.className = 'dev-status badge-off'; status.textContent = 'OFF';
    }
  }

  return { init };
})();

/* ==========================================================================
   MODULE 6: TOKEN & COST ESTIMATOR
   ========================================================================== */
const TokenEstimatorModule = (() => {
  function init() {
    const textarea = document.getElementById('token-input');
    const sampleBtn = document.getElementById('token-sample-btn');
    const resetBtn = document.getElementById('token-reset-btn');
    if (!textarea) return;

    textarea.addEventListener('input', () => calculateStats(textarea.value));

    sampleBtn.addEventListener('click', () => {
      const sampleEssay = `Artificial Intelligence in Modern Education & Software Engineering

Artificial intelligence is rapidly reshaping the landscape of global education and software development. From personalized tutoring systems to automated code refactoring and DevOps testing, generative AI tools offer developers and students unprecedented support. However, with this power comes significant security and ethical responsibility.

One major advantage of AI in software engineering is code acceleration. Developers struggling with complex data structures or Docker configurations can query AI assistants for step-by-step breakdowns and production-ready snippets. Furthermore, intelligent algorithms optimize database queries and detect memory leaks before production deployment.

Conversely, reliance on automated solvers threatens core problem-solving skills if consumed uncritically. When answers are available instantly with zero effort, developers may bypass the deep debugging intuition necessary to understand underlying software contracts.

In conclusion, artificial intelligence should be viewed not as a replacement for human intellect, but as an advanced pair-programming thought partner. By combining human architectural vision with smart AI prompts, the next generation of software engineers can build scalable, secure applications responsibly.`;

      textarea.value = sampleEssay;
      calculateStats(sampleEssay);
    });

    resetBtn.addEventListener('click', () => {
      textarea.value = '';
      calculateStats('');
    });
  }

  function calculateStats(text) {
    const trimmed = text.trim();
    const charCount = text.length;
    const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;
    const estTokens = Math.ceil(charCount / 4);

    document.getElementById('tok-count-char').textContent = charCount.toLocaleString();
    document.getElementById('tok-count-word').textContent = wordCount.toLocaleString();
    document.getElementById('tok-count-tokens').textContent = estTokens.toLocaleString();

    const costGPT4o = (estTokens / 1000000) * 2.50;
    const costClaude = (estTokens / 1000000) * 3.00;
    const costGemini = (estTokens / 1000000) * 0.075;

    document.getElementById('cost-gpt4o').textContent = `$${costGPT4o.toFixed(6)}`;
    document.getElementById('cost-claude').textContent = `$${costClaude.toFixed(6)}`;
    document.getElementById('cost-gemini').textContent = `$${costGemini.toFixed(6)}`;
  }

  return { init };
})();

/* ==========================================================================
   SUPPORTING FEATURES: AI TOOLS EXPLORER
   ========================================================================== */
const ToolsExplorerModule = (() => {
  const toolsData = [
    { name: "ChatGPT (GPT-4o)", category: "chatbots", icon: "💬", badge: "Freemium", badgeClass: "badge-freemium", use: "General Q&A, essay brainstorming, language practice, study explanations.", tip: "Use role-prompting for expert tutor explanations." },
    { name: "Claude 3.5 Sonnet", category: "chatbots", icon: "🧠", badge: "Freemium", badgeClass: "badge-freemium", use: "Long-document synthesis, nuanced writing, coding, technical analysis.", tip: "Paste entire codebase files for instant system architecture diagrams." },
    { name: "Cursor AI IDE", category: "coding", icon: "⚡", badge: "Freemium", badgeClass: "badge-freemium", use: "AI-native code editor with repository-wide codebase understanding.", tip: "Use Cmd+K to edit code blocks directly in place." },
    { name: "GitHub Copilot", category: "coding", icon: "💻", badge: "Free for Students", badgeClass: "badge-free", use: "Real-time autocompletion for Python, JS, C++, SQL, and HTML code.", tip: "Free for verified high school and college students!" },
    { name: "Docker Desktop AI", category: "coding", icon: "🐳", badge: "Free", badgeClass: "badge-free", use: "Automates container build files, multi-stage builds, and deployment setups.", tip: "Ask for lightweight Alpine Linux base image configurations." },
    { name: "Midjourney", category: "image", icon: "🎨", badge: "Paid", badgeClass: "badge-paid", use: "Photorealistic image generation, UI concept art, visual design.", tip: "Use aspect ratio flags like --ar 16:9 for presentation decks." },
    { name: "Perplexity AI", category: "research", icon: "🔎", badge: "Freemium", badgeClass: "badge-freemium", use: "AI search engine with real-time web citations and academic sources.", tip: "Toggle 'Academic' focus mode to search peer-reviewed papers." },
    { name: "NotebookLM", category: "research", icon: "📚", badge: "Free", badgeClass: "badge-free", use: "Grounded study assistant that generates audio podcasts from notes.", tip: "Upload your syllabus and technical specs to quiz yourself before exams." }
  ];

  function init() {
    const grid = document.getElementById('tools-grid');
    const filterBtns = document.querySelectorAll('#tools-filter-tabs .filter-btn');
    if (!grid) return;

    renderTools('all');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderTools(btn.getAttribute('data-filter'));
      });
    });
  }

  function renderTools(filter) {
    const grid = document.getElementById('tools-grid');
    grid.innerHTML = '';
    const filtered = filter === 'all' ? toolsData : toolsData.filter(t => t.category === filter);

    filtered.forEach(tool => {
      const card = document.createElement('div');
      card.className = 'tool-card glass-panel tilt-card';
      card.innerHTML = `
        <div class="tool-header">
          <div class="tool-name-wrap">
            <span class="tool-icon">${tool.icon}</span>
            <h4>${tool.name}</h4>
          </div>
          <span class="tool-badge ${tool.badgeClass}">${tool.badge}</span>
        </div>
        <p class="tool-usecase"><strong>Best Use:</strong> ${tool.use}</p>
        <div class="tool-tip">💡 <strong>Pro Tip:</strong> ${tool.tip}</div>
      `;
      grid.appendChild(card);
    });
  }

  return { init };
})();

/* ==========================================================================
   SUPPORTING FEATURES: PROMPT LIBRARY & SEARCH (WITH SOFTWARE DEV PROMPTS)
   ========================================================================== */
const PromptLibraryModule = (() => {
  const promptsData = [
    { title: "System Architecture Designer", cat: "coding", text: "Act as a principal cloud architect. Design a high-level system architecture for a high-traffic app handling [LOAD]. Specify API gateway, caching layer, database, and queue strategy.", tags: ["architecture", "system design"] },
    { title: "Jest/PyTest Unit Test Generator", cat: "coding", text: "Act as a QA lead engineer. Write a complete unit test suite for the following [LANGUAGE] function: [PASTE CODE]. Cover happy paths, null values, and edge cases.", tags: ["testing", "pytest", "jest"] },
    { title: "Dockerfile Multi-Stage Generator", cat: "productivity", text: "Act as a DevOps engineer. Create a multi-stage Dockerfile for a [NODE/PYTHON/GO] web application. Optimize for minimal image size, security, and layer caching.", tags: ["docker", "devops"] },
    { title: "SQL Query Performance Optimizer", cat: "coding", text: "Act as a database administrator. Analyze and optimize the following slow SQL query: [PASTE SQL]. Add indexes, rewrite JOINs, and explain execution plan improvements.", tags: ["sql", "database"] },
    { title: "Exam Concept Simplifier", cat: "academic", text: "Act as a patient high school teacher. Explain [TOPIC] using a real-world analogy. Break it into 3 simple bullet points and include a 1-sentence recap.", tags: ["study", "notes"] },
    { title: "Essay Outline Architect", cat: "academic", text: "Act as a university writing coach. Create a detailed 5-paragraph essay outline for the topic '[TOPIC]'. Include thesis statement, key arguments, and counterarguments.", tags: ["essay", "outline"] },
    { title: "UI Color Palette & Design Tokens", cat: "creative", text: "Act as a lead UI/UX designer. Suggest a 5-color modern CSS variable palette for a web app targeting [AUDIENCE]. Provide HEX codes, color names, and usage rules.", tags: ["design", "ui", "css"] },
    { title: "Presentation Slide Writer", cat: "productivity", text: "Act as a slide deck expert. Write text content for a 5-slide presentation on [TOPIC]. Provide slide titles, 3 bullet points per slide, and speaker notes.", tags: ["slides", "presentation"] },
    { title: "Socratic Study Partner", cat: "academic", text: "Act as a Socratic study partner. Quiz me on [TOPIC] by asking one question at a time. Wait for my answer before giving feedback and asking the next question.", tags: ["quiz", "active recall"] },
    { title: "Code Refactoring for Clean Code", cat: "coding", text: "Act as a clean code reviewer. Refactor the following code snippet for better performance and readability: [PASTE CODE]. Apply SOLID principles and add docstrings.", tags: ["code", "refactor"] },
    { title: "Meeting/Lecture Summarizer", cat: "productivity", text: "Act as an executive assistant. Summarize the following lecture notes into action items, key decisions, and main takeaways: [PASTE NOTES].", tags: ["summary", "notes"] },
    { title: "Time Management Planner", cat: "productivity", text: "Act as a student productivity consultant. Build a daily study timetable for a student who has 4 hours available and needs to study [SUBJECT 1] and [SUBJECT 2].", tags: ["schedule", "time"] }
  ];

  function init() {
    const grid = document.getElementById('prompts-grid');
    const searchInput = document.getElementById('prompt-search-input');
    const tabs = document.querySelectorAll('#library-tabs .filter-btn');
    if (!grid) return;

    let activeCat = 'all';
    let searchQuery = '';

    render();

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeCat = tab.getAttribute('data-cat');
        render();
      });
    });

    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      render();
    });

    function render() {
      grid.innerHTML = '';
      const filtered = promptsData.filter(p => {
        const matchesCat = (activeCat === 'all' || p.cat === activeCat);
        const matchesSearch = p.title.toLowerCase().includes(searchQuery) ||
                              p.text.toLowerCase().includes(searchQuery) ||
                              p.tags.some(t => t.includes(searchQuery));
        return matchesCat && matchesSearch;
      });

      if (filtered.length === 0) {
        grid.innerHTML = '<div class="text-center text-muted" style="grid-column: 1/-1; padding: 3rem;">No prompts found matching your criteria. Try another search term!</div>';
        return;
      }

      filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = 'prompt-card glass-panel tilt-card';
        card.innerHTML = `
          <div class="prompt-card-header">
            <h4>${item.title}</h4>
            <span class="prompt-cat-badge">${item.cat}</span>
          </div>
          <div class="prompt-card-body">${item.text}</div>
          <button class="btn btn-outline btn-sm copy-btn">📋 Copy Prompt</button>
        `;

        card.querySelector('.copy-btn').addEventListener('click', () => {
          navigator.clipboard.writeText(item.text);
          CoreSystem.showToast('Copied prompt to clipboard!', '📋');
        });

        grid.appendChild(card);
      });
    }
  }

  return { init };
})();

/* ==========================================================================
   SUPPORTING FEATURES: INTERACTIVE QUIZ ENGINE
   ========================================================================== */
const QuizModule = (() => {
  const quizQuestions = [
    {
      q: "What is the primary role of an API Gateway in software system architecture?",
      opts: [
        "It acts as a single entry point that routes client requests to backend microservices.",
        "It formats HTML CSS styles automatically.",
        "It deletes invalid user passwords.",
        "It slows down internet speeds."
      ],
      correct: 0,
      explain: "Correct! An API Gateway accepts client requests, handles security/authentication, and routes data to the appropriate backend microservice."
    },
    {
      q: "In prompt engineering, what does the 'Role' component do?",
      opts: [
        "It sets a word limit for the answer.",
        "It formats the response as a bullet list.",
        "It defines a persona or field of expertise for the AI to act as.",
        "It deletes invalid code."
      ],
      correct: 2,
      explain: "Correct! Defining a Role (e.g. 'Act as a senior DevOps engineer') helps the AI select relevant vocabulary and tone suited for that persona."
    },
    {
      q: "What happens when you set an LLM's Temperature parameter to 0.1?",
      opts: [
        "The AI generates highly creative and unpredictable text.",
        "The AI generates deterministic, focused, and predictable text.",
        "The AI turns off completely.",
        "The AI processes image files instead of text."
      ],
      correct: 1,
      explain: "Correct! Low Temperature (close to 0.0) forces the AI to always pick the highest-probability words, making outputs predictable and repeatable."
    },
    {
      q: "What does CI/CD stand for in modern Software Engineering pipelines?",
      opts: [
        "Computer Intelligence / Code Data",
        "Continuous Integration / Continuous Deployment",
        "Central Internet / Central Desktop",
        "Custom Interface / Custom Design"
      ],
      correct: 1,
      explain: "Correct! CI/CD automates code compilation, testing, vulnerability checks, and cloud deployments."
    },
    {
      q: "In smart home automation, what logic structure controls IoT devices?",
      opts: [
        "IF [Sensor Condition] THEN [Device Action]",
        "RANDOM [Sensor] MOVE [Device]",
        "WHILE [Device] STOP [Sensor]",
        "FOR EACH [User] DO [Nothing]"
      ],
      correct: 0,
      explain: "Correct! IoT automation relies on rule-based IF-THEN triggers (e.g., IF Temp > 30°C THEN Fan = ON)."
    },
    {
      q: "How are API tokens generally calculated for English text?",
      opts: [
        "1 token is equal to exactly 10 pages of text.",
        "1 token is roughly 4 characters or 0.75 words.",
        "Each token costs $100 dollars.",
        "Tokens are only counted when uploading images."
      ],
      correct: 1,
      explain: "Correct! A token represents word fragments or whole words — approximately 4 characters in standard English text."
    },
    {
      q: "Which element of the 5-Part Prompt Formula sets strict limits on output length or tone?",
      opts: [
        "Role",
        "Context",
        "Constraints",
        "Format"
      ],
      correct: 2,
      explain: "Correct! Constraints specify restrictions like 'under 150 words', 'no technical jargon', or 'friendly tone'."
    },
    {
      q: "What is the recommended ethical approach when using AI for software development?",
      opts: [
        "Copy-paste unvetted AI code directly into production without testing.",
        "Never audit AI code for security vulnerabilities.",
        "Use AI as an active pair programmer, audit code for security/edge-cases, and test thoroughly.",
        "Disable automated unit tests."
      ],
      correct: 2,
      explain: "Correct! Responsible developers use AI to accelerate work while auditing and verifying code quality, performance, and security."
    }
  ];

  let currentQIndex = 0;
  let score = 0;

  function init() {
    const nextBtn = document.getElementById('quiz-next-btn');
    const restartBtn = document.getElementById('quiz-restart-btn');
    if (!nextBtn) return;

    nextBtn.addEventListener('click', () => {
      currentQIndex++;
      if (currentQIndex < quizQuestions.length) {
        renderQuestion();
      } else {
        showSummary();
      }
    });

    restartBtn.addEventListener('click', () => {
      currentQIndex = 0; score = 0;
      document.getElementById('quiz-body').classList.remove('hidden');
      document.getElementById('quiz-footer-nav').classList.remove('hidden');
      document.getElementById('quiz-summary-box').classList.add('hidden');
      renderQuestion();
    });

    renderQuestion();
  }

  function renderQuestion() {
    const data = quizQuestions[currentQIndex];
    const total = quizQuestions.length;

    document.getElementById('quiz-progress-text').textContent = `Question ${currentQIndex + 1} of ${total}`;
    document.getElementById('quiz-progress-fill').style.width = `${((currentQIndex + 1) / total) * 100}%`;
    document.getElementById('quiz-question-text').textContent = data.q;

    const optsContainer = document.getElementById('quiz-options-container');
    const feedbackBox = document.getElementById('quiz-feedback-box');
    const nextBtn = document.getElementById('quiz-next-btn');

    optsContainer.innerHTML = '';
    feedbackBox.classList.add('hidden');
    nextBtn.disabled = true;

    data.opts.forEach((optText, idx) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-opt-btn';
      btn.textContent = `${String.fromCharCode(65 + idx)}. ${optText}`;
      btn.addEventListener('click', () => handleOptionClick(btn, idx, data));
      optsContainer.appendChild(btn);
    });
  }

  function handleOptionClick(selectedBtn, chosenIdx, data) {
    const allBtns = document.querySelectorAll('.quiz-opt-btn');
    allBtns.forEach(b => b.style.pointerEvents = 'none');

    const feedbackBox = document.getElementById('quiz-feedback-box');
    const nextBtn = document.getElementById('quiz-next-btn');

    if (chosenIdx === data.correct) {
      selectedBtn.classList.add('selected-correct');
      score++;
      feedbackBox.className = 'quiz-feedback good-badge';
      feedbackBox.innerHTML = `🎉 ${data.explain}`;
    } else {
      selectedBtn.classList.add('selected-wrong');
      allBtns[data.correct].classList.add('selected-correct');
      feedbackBox.className = 'quiz-feedback bad-badge';
      feedbackBox.innerHTML = `❌ ${data.explain}`;
    }

    feedbackBox.classList.remove('hidden');
    nextBtn.disabled = false;
  }

  function showSummary() {
    document.getElementById('quiz-body').classList.add('hidden');
    document.getElementById('quiz-footer-nav').classList.add('hidden');

    const summaryBox = document.getElementById('quiz-summary-box');
    summaryBox.classList.remove('hidden');

    const total = quizQuestions.length;
    const pct = Math.round((score / total) * 100);

    document.getElementById('quiz-score-detail').textContent = `You scored ${score} out of ${total} (${pct}%)`;

    const rankTag = document.getElementById('quiz-rank-tag');
    if (pct === 100) {
      rankTag.textContent = 'Rank: Software & AI Master Architect 🌟';
    } else if (pct >= 75) {
      rankTag.textContent = 'Rank: AI & Tech Specialist 🚀';
    } else if (pct >= 50) {
      rankTag.textContent = 'Rank: Software Apprentice 📚';
    } else {
      rankTag.textContent = 'Rank: Tech Explorer 🔍';
    }
  }

  return { init };
})();

/* ==========================================================================
   SUPPORTING FEATURES: CONCEPT HIERARCHY INTERACTION
   ========================================================================== */
const HierarchyModule = (() => {
  const infoMap = {
    'layer-ai': "<strong>Artificial Intelligence (AI):</strong> The overarching umbrella science of creating computer systems that perform tasks requiring human-like intelligence.",
    'layer-ml': "<strong>Machine Learning (ML):</strong> A subfield of AI focused on algorithms that automatically learn patterns from data without explicit manual programming rules.",
    'layer-dl': "<strong>Deep Learning (DL):</strong> A specialized subset of ML using deep multi-layer Artificial Neural Networks inspired by the human brain.",
    'layer-genai': "<strong>Generative AI (GenAI):</strong> Modern deep learning models (like ChatGPT, Claude, Cursor, Copilot) capable of generating brand-new text, images, code, and audio."
  };

  function init() {
    const layers = document.querySelectorAll('.nested-diagram .layer');
    const infoBox = document.getElementById('hierarchy-info-box');
    if (!infoBox) return;

    layers.forEach(layer => {
      layer.addEventListener('click', (e) => {
        e.stopPropagation();
        layers.forEach(l => l.classList.remove('selected'));
        layer.classList.add('selected');

        const id = layer.id;
        if (infoMap[id]) {
          infoBox.innerHTML = infoMap[id];
        }
      });
    });
  }

  return { init };
})();

/* ==========================================================================
   10. TRANSFORMER MULTI-HEAD SELF-ATTENTION MATRIX VISUALIZER
   ========================================================================== */
const LLMAttentionVisualizer = (() => {
  let canvas, ctx;

  function render(tokens = ['The', 'future', 'of', 'AI', 'is']) {
    canvas = document.getElementById('llm-attention-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    if (!tokens || tokens.length === 0) return;

    const displayTokens = tokens.slice(-8);
    const numTokens = displayTokens.length;
    const padding = 40;
    const spacing = (w - padding * 2) / Math.max(1, numTokens - 1);
    const nodeY = h - 25;

    const nodePositions = displayTokens.map((token, i) => ({
      x: padding + i * spacing,
      y: nodeY,
      label: token
    }));

    for (let i = 0; i < numTokens; i++) {
      for (let j = i + 1; j < numTokens; j++) {
        const p1 = nodePositions[i];
        const p2 = nodePositions[j];

        const dist = Math.abs(i - j);
        const weight = Math.max(0.15, 1 - (dist * 0.16));
        const arcHeight = Math.min(75, dist * 20);

        ctx.beginPath();
        const colors = [
          `rgba(99, 102, 241, ${weight})`,
          `rgba(6, 182, 212, ${weight})`,
          `rgba(244, 63, 94, ${weight})`
        ];
        ctx.strokeStyle = colors[(i + j) % colors.length];
        ctx.lineWidth = weight * 2.2;

        const controlX = (p1.x + p2.x) / 2;
        const controlY = nodeY - arcHeight;

        ctx.moveTo(p1.x, p1.y - 6);
        ctx.quadraticCurveTo(controlX, controlY, p2.x, p2.y - 6);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(controlX, controlY + arcHeight / 2, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.fill();
      }
    }

    nodePositions.forEach((pos, idx) => {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = idx === numTokens - 1 ? '#f43f5e' : '#6366f1';
      ctx.fill();

      ctx.font = '10px "Fira Code", monospace';
      ctx.fillStyle = '#f3f4f6';
      ctx.textAlign = 'center';
      ctx.fillText(pos.label, pos.x, pos.y + 16);
    });
  }

  return { render };
})();

/* ==========================================================================
   11. MICROSERVICE DATA PIPELINE FLOW VISUALIZER
   ========================================================================== */
const ArchitectureFlowVisualizer = (() => {
  let canvas, ctx;
  let animId = null;
  let packets = [];

  function init() {
    canvas = document.getElementById('arch-flow-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    startLoop();
  }

  function startLoop() {
    if (animId) cancelAnimationFrame(animId);

    const nodes = [
      { name: 'Client', x: 30 },
      { name: 'Gateway', x: 100 },
      { name: 'LoadBal', x: 170 },
      { name: 'AI Node', x: 240 },
      { name: 'Vector DB', x: 310 }
    ];

    let phase = 0;

    function render() {
      if (!ctx || !canvas) return;
      const w = canvas.width;
      const h = canvas.height;
      const cy = h / 2 - 5;

      ctx.clearRect(0, 0, w, h);
      phase += 0.05;

      const loadSlider = document.getElementById('arch-load-slider');
      const load = loadSlider ? parseInt(loadSlider.value) : 100;
      const speed = 1 + (load / 120);

      ctx.beginPath();
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
      ctx.lineWidth = 3;
      ctx.moveTo(nodes[0].x, cy);
      ctx.lineTo(nodes[nodes.length - 1].x, cy);
      ctx.stroke();

      if (Math.random() < 0.25 * (load / 100)) {
        packets.push({ x: nodes[0].x, color: Math.random() > 0.5 ? '#06b6d4' : '#f43f5e' });
      }

      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i];
        p.x += speed * 2;

        ctx.beginPath();
        ctx.arc(p.x, cy, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;

        if (p.x >= nodes[nodes.length - 1].x) {
          packets.splice(i, 1);
        }
      }

      nodes.forEach((node, idx) => {
        const isActive = Math.floor((phase * 2 + idx) % nodes.length) === idx;

        ctx.beginPath();
        ctx.arc(node.x, cy, isActive ? 8 : 6, 0, Math.PI * 2);
        ctx.fillStyle = isActive ? '#10b981' : '#6366f1';
        ctx.fill();

        ctx.font = '9px "Inter", sans-serif';
        ctx.fillStyle = '#9ca3af';
        ctx.textAlign = 'center';
        ctx.fillText(node.name, node.x, cy + 18);
      });

      animId = requestAnimationFrame(render);
    }

    render();
  }

  return { init };
})();

/* ==========================================================================
   12. VOICE AI CHATBOT ENGINE (Speech-to-Text, Voice Synthesis, Persona Engine & Autonomous Manipulator)
   ========================================================================== */
const VoiceChatbotModule = (() => {
  let isListening = false;
  let isMuted = false;
  let autoSpeak = true;
  let recognition = null;
  let synth = window.speechSynthesis;
  let voices = [];
  let selectedVoice = null;
  let pitch = 1.0;
  let rate = 1.0;
  let activePersona = 'scholar';

  let canvas, ctx;
  let animId = null;
  let visMode = 'idle';
  let phase = 0;

  let modalOverlay, fabBtn, navVoiceBtn, closeBtn, backdrop, clearBtn, settingsToggleBtn, settingsPanel;
  let personaToggleBtn, personaPanel, exportBtn;
  let micBtn, sendBtn, muteBtn, textInput, interimBox, interimText, messagesContainer;
  let statusDot, statusText, visModeLabel;
  let voiceSelectDropdown, pitchRange, speedRange, pitchVal, speedVal, autoSpeakCheckbox;

  function init() {
    bindDOM();
    if (!modalOverlay) return;

    setupSpeechRecognition();
    setupSpeechSynthesis();
    setupVisualizerCanvas();
    bindEvents();
    setupKeyboardShortcuts();
  }

  function bindDOM() {
    modalOverlay = document.getElementById('voice-modal');
    fabBtn = document.getElementById('voice-fab');
    navVoiceBtn = document.getElementById('nav-voice-btn');
    closeBtn = document.getElementById('voice-close-btn');
    backdrop = document.getElementById('voice-modal-backdrop');
    clearBtn = document.getElementById('voice-clear-btn');
    settingsToggleBtn = document.getElementById('voice-settings-toggle-btn');
    settingsPanel = document.getElementById('voice-settings-panel');
    personaToggleBtn = document.getElementById('voice-persona-btn');
    personaPanel = document.getElementById('voice-persona-panel');
    exportBtn = document.getElementById('voice-export-btn');
    micBtn = document.getElementById('mic-toggle-btn');
    sendBtn = document.getElementById('voice-send-btn');
    muteBtn = document.getElementById('voice-mute-btn');
    textInput = document.getElementById('voice-text-input');
    interimBox = document.getElementById('voice-interim-box');
    interimText = document.getElementById('voice-interim-text');
    messagesContainer = document.getElementById('voice-messages-container');
    statusDot = document.getElementById('voice-status-dot');
    statusText = document.getElementById('voice-status-text');
    visModeLabel = document.getElementById('visualizer-mode-label');
    voiceSelectDropdown = document.getElementById('voice-select-dropdown');
    pitchRange = document.getElementById('voice-pitch-range');
    speedRange = document.getElementById('voice-speed-range');
    pitchVal = document.getElementById('voice-pitch-val');
    speedVal = document.getElementById('voice-speed-val');
    autoSpeakCheckbox = document.getElementById('voice-auto-speak');
    canvas = document.getElementById('voice-canvas-visualizer');
  }

  function setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (statusText) statusText.textContent = 'Voice STT unavailable (Use text input)';
      return;
    }

    try {
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        isListening = true;
        updateListeningUI(true);
      };

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (interimTranscript) {
          if (interimBox) interimBox.classList.remove('hidden');
          if (interimText) interimText.textContent = interimTranscript;
        }

        if (finalTranscript) {
          if (interimBox) interimBox.classList.add('hidden');
          processUserInput(finalTranscript);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        isListening = false;
        updateListeningUI(false);
        if (interimBox) interimBox.classList.add('hidden');
        if (event.error !== 'no-speech') {
          CoreSystem.showToast(`Speech error: ${event.error}`, '⚠️');
        }
      };

      recognition.onend = () => {
        isListening = false;
        updateListeningUI(false);
        if (interimBox) interimBox.classList.add('hidden');
      };
    } catch (e) {
      console.warn('SpeechRecognition init error:', e);
    }
  }

  function setupSpeechSynthesis() {
    if (!synth) return;

    const populateVoices = () => {
      voices = synth.getVoices();
      if (!voiceSelectDropdown) return;
      voiceSelectDropdown.innerHTML = '<option value="">Default AI Voice</option>';

      voices.forEach((v, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${v.name} (${v.lang})${v.default ? ' — Default' : ''}`;
        if (v.lang.startsWith('en') && !selectedVoice) {
          selectedVoice = v;
        }
        voiceSelectDropdown.appendChild(option);
      });
    };

    populateVoices();
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = populateVoices;
    }
  }

  function setupVisualizerCanvas() {
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    startVisualizerLoop();
  }

  function startVisualizerLoop() {
    if (animId) cancelAnimationFrame(animId);

    function render() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      phase += 0.05;

      const w = canvas.width;
      const h = canvas.height;
      const cy = h / 2;

      if (visMode === 'listening') {
        const barCount = 32;
        const barWidth = (w / barCount) - 3;
        for (let i = 0; i < barCount; i++) {
          const bh = Math.sin(phase + i * 0.3) * 18 + Math.random() * 20 + 8;
          const x = i * (barWidth + 3) + 4;
          const gradient = ctx.createLinearGradient(0, cy - bh, 0, cy + bh);
          gradient.addColorStop(0, '#10b981');
          gradient.addColorStop(1, '#06b6d4');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(x, cy - bh / 2, barWidth, bh, 3);
          } else {
            ctx.rect(x, cy - bh / 2, barWidth, bh);
          }
          ctx.fill();
        }
      } else if (visMode === 'speaking') {
        const colors = [
          'rgba(244, 63, 94, 0.75)',
          'rgba(99, 102, 241, 0.75)',
          'rgba(6, 182, 212, 0.75)'
        ];
        colors.forEach((color, idx) => {
          ctx.beginPath();
          ctx.strokeStyle = color;
          ctx.lineWidth = 2.5;
          for (let x = 0; x < w; x += 3) {
            const freq = 0.02 + idx * 0.01;
            const amp = (15 + idx * 6) * Math.sin((x * freq) + phase * (1 + idx * 0.4));
            const y = cy + amp * Math.sin(x * 0.01);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        });
      } else if (visMode === 'thinking') {
        ctx.save();
        ctx.translate(w / 2, cy);
        for (let i = 0; i < 16; i++) {
          const angle = (i / 16) * Math.PI * 2 + phase;
          const r = 18 + Math.sin(phase * 2 + i) * 6;
          const px = Math.cos(angle) * r;
          const py = Math.sin(angle) * r;
          ctx.beginPath();
          ctx.arc(px, py, 3, 0, Math.PI * 2);
          ctx.fillStyle = i % 2 === 0 ? '#f59e0b' : '#6366f1';
          ctx.fill();
        }
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
        ctx.lineWidth = 2;
        for (let x = 0; x < w; x += 4) {
          const y = cy + Math.sin(x * 0.03 + phase) * 6;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    }

    render();
  }

  function setVisualizerMode(mode, labelText) {
    visMode = mode;
    if (visModeLabel) visModeLabel.textContent = labelText;
  }

  function bindEvents() {
    if (fabBtn) fabBtn.addEventListener('click', toggleModal);
    if (navVoiceBtn) navVoiceBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);

    if (micBtn) {
      micBtn.addEventListener('click', () => {
        if (!recognition) {
          CoreSystem.showToast('Speech recognition not supported by browser engine.', '⚠️');
          return;
        }
        if (isListening) {
          recognition.stop();
        } else {
          try {
            recognition.start();
          } catch (err) {
            console.warn('Recognition start error:', err);
          }
        }
      });
    }

    if (sendBtn) {
      sendBtn.addEventListener('click', () => submitTextInput());
    }
    if (textInput) {
      textInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') submitTextInput();
      });
    }

    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        isMuted = !isMuted;
        muteBtn.classList.toggle('muted', isMuted);
        muteBtn.querySelector('.speaker-icon').textContent = isMuted ? '🔇' : '🔊';
        if (isMuted && synth) synth.cancel();
        CoreSystem.showToast(isMuted ? 'Voice output muted' : 'Voice output unmuted', isMuted ? '🔇' : '🔊');
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (!messagesContainer) return;
        messagesContainer.innerHTML = `
          <div class="voice-msg system-msg">
            <div class="voice-msg-avatar">✨</div>
            <div class="voice-msg-body">
              <div class="voice-msg-author">JohnAI Voice Assistant</div>
              <div class="voice-msg-content">Conversation transcript cleared! How can I assist you in JohnAI Studio?</div>
            </div>
          </div>
        `;
        CoreSystem.showToast('Chat transcript cleared', '🗑️');
      });
    }

    if (settingsToggleBtn && settingsPanel) {
      settingsToggleBtn.addEventListener('click', () => {
        settingsPanel.classList.toggle('hidden');
        if (personaPanel) personaPanel.classList.add('hidden');
      });
    }

    if (personaToggleBtn && personaPanel) {
      personaToggleBtn.addEventListener('click', () => {
        personaPanel.classList.toggle('hidden');
        if (settingsPanel) settingsPanel.classList.add('hidden');
      });
    }

    const personaBtns = document.querySelectorAll('.persona-btn');
    personaBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        personaBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activePersona = btn.getAttribute('data-persona');
        const names = { scholar: 'JohnAI Scholar', coder: 'Code Architect', prompter: 'Prompt Engineer', controller: 'Live Workbench Agent' };
        CoreSystem.showToast(`Switched persona to ${names[activePersona]}!`, '🧠');
      });
    });

    if (exportBtn) {
      exportBtn.addEventListener('click', () => exportChatHistory());
    }

    if (voiceSelectDropdown) {
      voiceSelectDropdown.addEventListener('change', (e) => {
        const idx = e.target.value;
        selectedVoice = idx !== '' ? voices[idx] : null;
      });
    }
    if (pitchRange && pitchVal) {
      pitchRange.addEventListener('input', (e) => {
        pitch = parseFloat(e.target.value);
        pitchVal.textContent = pitch.toFixed(1);
      });
    }
    if (speedRange && speedVal) {
      speedRange.addEventListener('input', (e) => {
        rate = parseFloat(e.target.value);
        speedVal.textContent = `${rate.toFixed(1)}x`;
      });
    }
    if (autoSpeakCheckbox) {
      autoSpeakCheckbox.addEventListener('change', (e) => {
        autoSpeak = e.target.checked;
      });
    }

    const chips = document.querySelectorAll('.voice-chip-btn');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const prompt = chip.getAttribute('data-prompt');
        if (prompt) processUserInput(prompt);
      });
    });
  }

  function exportChatHistory() {
    if (!messagesContainer) return;
    let mdContent = `# JohnAI Studio - AI Voice Conversation Export\n\nDate: ${new Date().toLocaleString()}\n\n---\n\n`;
    const msgs = messagesContainer.querySelectorAll('.voice-msg');
    msgs.forEach(msg => {
      const author = msg.querySelector('.voice-msg-author')?.textContent || 'System';
      const content = msg.querySelector('.voice-msg-content')?.textContent || '';
      mdContent += `### ${author}\n${content}\n\n`;
    });

    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `JohnAI_Studio_Voice_Chat_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    CoreSystem.showToast('Chat history exported as Markdown!', '📥');
  }

  function setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        toggleModal();
      }
    });
  }

  function toggleModal() {
    if (!modalOverlay) return;
    const isActive = modalOverlay.classList.contains('active');
    if (isActive) closeModal();
    else openModal();
  }

  function openModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.add('active');
    modalOverlay.setAttribute('aria-hidden', 'false');
    if (textInput) textInput.focus();
  }

  function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('active');
    modalOverlay.setAttribute('aria-hidden', 'true');
    if (isListening && recognition) recognition.stop();
    if (synth) synth.cancel();
    setVisualizerMode('idle', 'IDLE • AWAITING VOICE');
  }

  function updateListeningUI(listening) {
    if (micBtn) micBtn.classList.toggle('recording', listening);
    if (statusDot) {
      statusDot.className = `voice-status-dot ${listening ? 'listening' : 'idle'}`;
    }
    if (statusText) {
      statusText.textContent = listening ? '🎙️ Listening... Speak now' : 'Ready • Click 🎙️ or pick a prompt';
    }
    if (listening) {
      setVisualizerMode('listening', 'RECORDING VOICE');
      if (synth) synth.cancel();
    } else {
      if (visMode === 'listening') setVisualizerMode('idle', 'IDLE • AWAITING VOICE');
    }
  }

  function submitTextInput() {
    if (!textInput) return;
    const val = textInput.value.trim();
    if (!val) return;
    textInput.value = '';
    processUserInput(val);
  }

  function appendMessage(sender, text) {
    if (!messagesContainer) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = `voice-msg ${sender === 'user' ? 'user-msg' : 'ai-msg'}`;

    const isUser = sender === 'user';
    const avatarIcon = isUser ? '👤' : '✨';
    const authorName = isUser ? 'You' : `JohnAI ${activePersona.toUpperCase()}`;

    msgDiv.innerHTML = `
      <div class="voice-msg-avatar">${avatarIcon}</div>
      <div class="voice-msg-body">
        <div class="voice-msg-author">${authorName}</div>
        <div class="voice-msg-content">${formatMessageText(text)}</div>
        ${!isUser ? `
          <div class="voice-msg-actions">
            <button class="msg-action-btn speak-again-btn" title="Replay Voice">🔊 Replay</button>
            <button class="msg-action-btn copy-msg-btn" title="Copy text">📋 Copy</button>
          </div>
        ` : ''}
      </div>
    `;

    messagesContainer.appendChild(msgDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    if (!isUser) {
      const speakBtn = msgDiv.querySelector('.speak-again-btn');
      const copyBtn = msgDiv.querySelector('.copy-msg-btn');

      if (speakBtn) speakBtn.addEventListener('click', () => speakText(text));
      if (copyBtn) {
        copyBtn.addEventListener('click', () => {
          navigator.clipboard.writeText(text);
          CoreSystem.showToast('Copied to clipboard!', '📋');
        });
      }
    }
  }

  function formatMessageText(text) {
    let formatted = text
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
    return formatted;
  }

  function processUserInput(userInput) {
    if (!userInput || !userInput.trim()) return;

    appendMessage('user', userInput);
    setVisualizerMode('thinking', 'THINKING & PROCESSING');
    if (statusDot) statusDot.className = 'voice-status-dot thinking';
    if (statusText) statusText.textContent = 'Processing request...';

    setTimeout(() => {
      const response = generateAIResponse(userInput);
      appendMessage('ai', response.text);

      if (response.action) {
        response.action();
      }

      if (autoSpeak && !isMuted) {
        speakText(response.text);
      } else {
        setVisualizerMode('idle', 'IDLE • AWAITING VOICE');
        if (statusDot) statusDot.className = 'voice-status-dot idle';
        if (statusText) statusText.textContent = 'Ready • Tap 🎙️ to talk';
      }
    }, 400);
  }

  function generateAIResponse(input) {
    const text = input.toLowerCase();

    // 1. AUTONOMOUS LIVE WORKBENCH CONTROLLER COMMANDS
    if (text.includes('temperature') || text.includes('simulate temp') || text.includes('temp 1.2')) {
      return {
        text: "🧠 **Autonomous Action Triggered**: Set Temperature slider to `1.2` in Model 1 and auto-generated next tokens! Notice how the top word probability distribution flattens, increasing creativity.",
        action: () => {
          const el = document.getElementById('interactive-lab');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
          const slider = document.getElementById('llm-temp-slider');
          if (slider) {
            slider.value = 1.2;
            document.getElementById('llm-temp-val').textContent = '1.2';
            slider.dispatchEvent(new Event('input'));
          }
          const stepBtn = document.getElementById('llm-step-btn');
          if (stepBtn) stepBtn.click();
        }
      };
    }

    if (text.includes('analyze') || text.includes('improve my prompt') || text.includes('live improve')) {
      return {
        text: "🎨 **Autonomous Action Triggered**: Loaded a draft prompt into Model 2 and executed live formula improvement! Your score upgraded to **100/100 Master Prompt**.",
        action: () => {
          const el = document.getElementById('model-2');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
          const inputEl = document.getElementById('analyzer-input');
          if (inputEl) {
            inputEl.value = "write a essay on space exploration";
            inputEl.dispatchEvent(new Event('input'));
            setTimeout(() => {
              const improveBtn = document.getElementById('analyzer-improve-btn');
              if (improveBtn) improveBtn.click();
            }, 400);
          }
        }
      };
    }

    if (text.includes('scale architecture') || text.includes('scale traffic') || text.includes('load 300') || text.includes('traffic load')) {
      return {
        text: "🚀 **Autonomous Action Triggered**: Scaled simulated cloud traffic load to `300 req/sec` in Model 4 and sent a high-frequency packet burst across microservices!",
        action: () => {
          const el = document.getElementById('model-4');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
          const slider = document.getElementById('arch-load-slider');
          if (slider) {
            slider.value = 300;
            slider.dispatchEvent(new Event('input'));
          }
          const spikeBtn = document.getElementById('arch-send-packet-btn');
          if (spikeBtn) spikeBtn.click();
        }
      };
    }

    // 2. NAVIGATION COMMANDS
    if (text.includes('3d lab') || text.includes('interactive lab') || text.includes('scroll to lab') || text.includes('go to lab')) {
      return {
        text: "Navigating to the **3D Interactive Lab**! Check out the new **Transformer Self-Attention Heatmap** and **Live Microservice Pipeline Flow**.",
        action: () => {
          const el = document.getElementById('interactive-lab');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
      };
    }

    if (text.includes('quiz') || text.includes('test me') || text.includes('start quiz')) {
      return {
        text: "Scrolling down to the **Interactive Knowledge Quiz**. Test your AI and Software Engineering skills!",
        action: () => {
          const el = document.getElementById('quiz-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
      };
    }

    if (text.includes('light mode') || text.includes('day mode')) {
      return {
        text: "Switched to **Light Mode** for bright viewing.",
        action: () => {
          document.documentElement.setAttribute('data-theme', 'light');
          localStorage.setItem('john_ai_studio_theme', 'light');
          CoreSystem.showToast('Switched to light mode!', '☀️');
        }
      };
    }

    if (text.includes('dark mode') || text.includes('night mode')) {
      return {
        text: "Switched to **Dark Mode** for sleek futuristic aesthetics.",
        action: () => {
          document.documentElement.setAttribute('data-theme', 'dark');
          localStorage.setItem('john_ai_studio_theme', 'dark');
          CoreSystem.showToast('Switched to dark mode!', '🌙');
        }
      };
    }

    // 3. PERSONA SPECIFIC ANSWERS
    if (activePersona === 'coder') {
      return {
        text: `### ⚡ Code Architect Response\nHere is clean TypeScript code for API gateway routing:\n\n\`\`\`typescript\nasync function handleVoiceRoute(req: Request): Promise<Response> {\n  const intent = parseVoiceIntent(req.body);\n  return await executeAutonomousAction(intent);\n}\n\`\`\`\n\nThis pattern ensures zero-latency asynchronous processing!`
      };
    }

    if (activePersona === 'prompter') {
      return {
        text: `### 🎨 Prompt Engineering Formula\nTo get a 100/100 response for **"${input}"**:\n- **Role 👤**: Act as a Lead Solutions Architect.\n- **Task 🎯**: Draft an automated data pipeline spec.\n- **Format 📐**: 3 markdown tables with code blocks.\n- **Constraints ⛔**: Max 200 words, no jargon.`
      };
    }

    if (text.includes('neural network') || text.includes('backpropagation') || text.includes('deep learning')) {
      return {
        text: "**Backpropagation** computes the gradient of the loss function with respect to each weight using the **Chain Rule of Calculus**: `∂L/∂w = ∂L/∂y · ∂y/∂z · ∂z/∂w`. Weights are updated via Gradient Descent: `w_new = w_old - η · ∂L/∂w`."
      };
    }

    if (text.includes('what is johnai studio') || text.includes('johnai') || text.includes('about')) {
      return {
        text: "**JohnAI Studio** is an interactive, state-of-the-art educational platform for mastering Artificial Intelligence, Software Engineering, Prompt Engineering, LLM Tokenization, and IoT Systems with hands-on 3D visual simulators."
      };
    }

    // 4. FALLBACK INTELLIGENT ANSWER
    return {
      text: `That is a great query about **"${input}"**! In **JohnAI Studio**, AI models combine vector representations, self-attention matrices, and scalable microservices to deliver high-performance real-time intelligence.`
    };
  }

  function speakText(rawText) {
    if (!synth) return;

    synth.cancel();

    const cleanText = rawText
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/<[^>]+>/g, '')
      .replace(/[\#\*\_\~\>\`]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.pitch = pitch;
    utterance.rate = rate;
    if (selectedVoice) utterance.voice = selectedVoice;

    utterance.onstart = () => {
      isSpeaking = true;
      setVisualizerMode('speaking', '🔊 SPEAKING RESPONSE');
      if (statusDot) statusDot.className = 'voice-status-dot speaking';
      if (statusText) statusText.textContent = '🔊 Speaking AI response...';
    };

    utterance.onend = () => {
      isSpeaking = false;
      setVisualizerMode('idle', 'IDLE • AWAITING VOICE');
      if (statusDot) statusDot.className = 'voice-status-dot idle';
      if (statusText) statusText.textContent = 'Ready • Tap 🎙️ to talk';
    };

    utterance.onerror = () => {
      isSpeaking = false;
      setVisualizerMode('idle', 'IDLE • AWAITING VOICE');
      if (statusDot) statusDot.className = 'voice-status-dot idle';
      if (statusText) statusText.textContent = 'Ready • Tap 🎙️ to talk';
    };

    synth.speak(utterance);
  }

  return { init, openModal, closeModal, processUserInput };
})();


