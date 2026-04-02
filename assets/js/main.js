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

    // terraform plan
    await typedPrompt('terraform plan');
    await delay(400);

    linesEl.appendChild(span('', ''));
    linesEl.appendChild(span('dim', '  Initialising modules...'));
    await delay(500);
    linesEl.appendChild(span('tool', '  \u25cf read_file \u2192 main.tf'));
    await delay(350);
    linesEl.appendChild(span('tool', '  \u25cf read_file \u2192 variables.tf'));
    await delay(350);
    linesEl.appendChild(span('tool', '  \u25cf aws_provider \u2192 eu-west-1'));
    await delay(700);
    linesEl.appendChild(span('', ''));
    linesEl.appendChild(span('result', '  Plan: 4 to add, 1 to change, 0 to destroy.'));
    await delay(800);
    linesEl.appendChild(span('', ''));

    // terraform apply
    await typedPrompt('terraform apply --auto-approve');
    await delay(500);

    linesEl.appendChild(span('', ''));
    const resources = [
      'aws_iam_role.ci_runner',
      'aws_s3_bucket.artifacts',
      'aws_lambda_function.cost_monitor',
      'aws_cloudwatch_event_rule.daily',
    ];
    for (const r of resources) {
      await delay(450);
      linesEl.appendChild(span('check', '  \u2714 ' + r + ' \u2014 created'));
    }
    await delay(600);
    linesEl.appendChild(span('', ''));

    const loadEl = span('result', '  Apply complete');
    linesEl.appendChild(loadEl);
    linesEl.appendChild(cursor);
    for (let i = 0; i < 3; i++) {
      await delay(400);
      loadEl.textContent += '.';
    }

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

