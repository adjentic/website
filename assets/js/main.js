// Nav toggle (mobile)
const toggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

if (toggle && navLinks) {
  toggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

// About section terminal animation
(function () {
  const linesEl = document.getElementById('abt-lines');
  const cursor  = document.getElementById('abt-cursor');
  let running = false;

  const abtBody = document.querySelector('.abt-body');

  function span(cls, text) {
    const s = document.createElement('span');
    s.className = 'line ' + cls;
    s.textContent = text;
    return s;
  }

  function scrollBottom() {
    if (abtBody) abtBody.scrollTop = abtBody.scrollHeight;
  }

  function delay(ms) {
    scrollBottom();
    return new Promise(r => setTimeout(r, ms));
  }

  function typeInto(el, text, speed) {
    return new Promise(resolve => {
      let i = 0;
      function next() {
        if (i >= text.length) { resolve(); return; }
        el.textContent += text[i++];
        setTimeout(next, speed + Math.random() * speed * 0.4);
      }
      next();
    });
  }

  function typedPrompt(cmd) {
    const line = document.createElement('span');
    line.className = 'line';
    const promptEl = document.createElement('span');
    promptEl.className = 'prompt';
    promptEl.textContent = 'user@adjentic:~$ ';
    const cmdEl = document.createElement('span');
    cmdEl.className = 'cmd';
    line.appendChild(promptEl);
    line.appendChild(cmdEl);
    line.appendChild(cursor);
    linesEl.appendChild(line);
    return typeInto(cmdEl, cmd, 80);
  }

  async function run() {
    if (running) return;
    running = true;
    linesEl.innerHTML = '';
    linesEl.appendChild(cursor);

    await delay(300);

    await typedPrompt('./pipeline.sh --env production');
    await delay(400);

    linesEl.appendChild(span('', ''));
    linesEl.appendChild(span('dim', '  [Pipeline] Starting build #142'));
    await delay(500);

    linesEl.appendChild(span('', ''));
    linesEl.appendChild(span('result', '  \u25b6 Stage: Checkout'));
    await delay(400);
    linesEl.appendChild(span('check', '  \u2714 Cloning repository'));
    await delay(350);
    linesEl.appendChild(span('check', '  \u2714 Resolved commit 4f9a2c1'));
    await delay(600);

    linesEl.appendChild(span('', ''));
    linesEl.appendChild(span('result', '  \u25b6 Stage: Test'));
    await delay(400);
    linesEl.appendChild(span('check', '  \u2714 Unit tests passed (47/47)'));
    await delay(350);
    linesEl.appendChild(span('check', '  \u2714 Integration tests passed (12/12)'));
    await delay(600);

    linesEl.appendChild(span('', ''));
    linesEl.appendChild(span('result', '  \u25b6 Stage: Build'));
    await delay(400);
    linesEl.appendChild(span('check', '  \u2714 Image built'));
    await delay(350);
    linesEl.appendChild(span('check', '  \u2714 Pushed to registry'));
    await delay(600);

    linesEl.appendChild(span('', ''));
    linesEl.appendChild(span('result', '  \u25b6 Stage: Deploy \u2192 production'));
    await delay(500);
    linesEl.appendChild(span('check', '  \u2714 Rolling deployment started'));
    await delay(450);
    linesEl.appendChild(span('check', '  \u2714 Health checks passed'));
    await delay(450);
    linesEl.appendChild(span('check', '  \u2714 Traffic switched'));
    await delay(600);

    linesEl.appendChild(span('', ''));
    const loadEl = span('dim', '  Build #142 deployed successfully');
    linesEl.appendChild(loadEl);
    linesEl.appendChild(cursor);
    await delay(600);

    linesEl.appendChild(span('', ''));
    await typedPrompt('');

  }

  // Start on page load after a short delay
  if (document.querySelector('.about-terminal')) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => setTimeout(run, 500));
    } else {
      setTimeout(run, 500);
    }
  }
})();

