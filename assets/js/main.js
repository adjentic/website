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

    function log(cls, text) {
      linesEl.appendChild(span(cls, text));
    }

    log('dim',   '[Pipeline] Running on agent-01');
    log('dim',   '[Pipeline] Workspace: /var/jenkins/workspace/deploy');
    await delay(500);

    log('', '');
    log('result', '[Pipeline] Stage: Checkout');
    await delay(350);
    log('cmd',  '+ git clone git@github.com:adjentic/app.git');
    await delay(400);
    log('cmd',  '+ git checkout 4f9a2c1');
    await delay(300);
    log('dim',  'HEAD is now at 4f9a2c1 fix: update IAM policy for Lambda');
    await delay(600);

    log('', '');
    log('result', '[Pipeline] Stage: Test');
    await delay(350);
    log('cmd',  '+ python -m pytest tests/ -q');
    await delay(700);
    log('dim',  '....................................');
    await delay(300);
    log('check', '47 passed in 3.21s');
    await delay(600);

    log('', '');
    log('result', '[Pipeline] Stage: Build');
    await delay(350);
    log('cmd',  '+ docker build -t app:4f9a2c1 .');
    await delay(800);
    log('dim',  'Step 1/6 : FROM python:3.12-slim');
    await delay(300);
    log('dim',  'Step 6/6 : CMD ["gunicorn", "app:main"]');
    await delay(400);
    log('check', 'Successfully built a3f8b2d19c4e');
    await delay(350);
    log('cmd',  '+ docker push 123456.dkr.ecr.eu-west-1.amazonaws.com/app:4f9a2c1');
    await delay(500);
    log('check', 'Pushed');
    await delay(600);

    log('', '');
    log('result', '[Pipeline] Stage: Deploy');
    await delay(350);
    log('cmd',  '+ aws ecs update-service --force-new-deployment');
    await delay(600);
    log('dim',  'Waiting for service to stabilise');
    await delay(800);
    log('check', 'Service reached steady state');
    await delay(400);
    log('', '');
    log('check', '[Pipeline] Finished: SUCCESS');
    await delay(500);
    linesEl.appendChild(cursor);

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

