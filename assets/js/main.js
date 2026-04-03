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
  let running = false;

  const abtBody = document.querySelector('.abt-body');

  function setStage(id, status) {
    const el = document.getElementById(id);
    if (!el) return;
    if (status === 'show') { el.classList.remove('hidden'); return; }
    el.className = 'stage-item ' + status;
  }

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
    linesEl.appendChild(line);
    return typeInto(cmdEl, cmd, 80);
  }

  async function run() {
    if (running) return;
    running = true;
    linesEl.innerHTML = '';

    await delay(300);

    function log(cls, text) {
      linesEl.appendChild(span(cls, text));
    }

    log('dim',   '[CI]Running on agent-01');
    log('dim',   '[CI]Workspace: /var/ci/workspace/infra-deploy');
    await delay(500);

    log('', '');
    log('result', '[CI]Stage: Checkout');
    setStage('stage-checkout', 'running');
    await delay(350);
    log('cmd',  '+ git checkout 4f9a2c1');
    await delay(300);
    log('dim',  'HEAD is now at 4f9a2c1 feat: add cost monitoring Lambda');
    await delay(600);
    setStage('stage-checkout', 'success');

    log('', '');
    log('result', '[CI]Stage: Validate');
    setStage('stage-validate', 'running');
    await delay(350);
    log('cmd',  '+ terraform validate');
    await delay(700);
    log('check', 'Success! The configuration is valid.');
    await delay(600);
    setStage('stage-validate', 'success');

    log('', '');
    log('result', '[CI]Stage: Format Check');
    setStage('stage-fmt', 'running');
    await delay(350);
    log('cmd',  '+ terraform fmt -check -recursive');
    await delay(500);
    log('dim',  'modules/iam/main.tf');
    await delay(200);
    log('dim',  'modules/lambda/variables.tf');
    await delay(300);
    log('check', 'All files formatted correctly.');
    await delay(600);
    setStage('stage-fmt', 'success');

    log('', '');
    log('result', '[CI]Stage: Detect Changes');
    setStage('stage-changes', 'running');
    await delay(350);
    log('cmd',  '+ git diff HEAD~1 --name-only -- "*.tf"');
    await delay(500);
    log('dim',  'modules/iam/main.tf');
    await delay(200);
    log('dim',  'modules/lambda/variables.tf');
    await delay(200);
    log('dim',  'modules/lambda/main.tf');
    await delay(400);
    log('result', '3 file(s) changed. Proceeding with plan.');
    await delay(600);
    setStage('stage-changes', 'success');

    log('', '');
    log('result', '[CI]Stage: Plan');
    setStage('stage-plan', 'running');
    await delay(350);
    log('cmd',  '+ terraform plan -out=tfplan');
    await delay(800);
    log('dim',  '  ~ aws_iam_role.ci_runner');
    await delay(300);
    log('dim',  '  + aws_lambda_function.cost_monitor');
    await delay(300);
    log('dim',  '  + aws_cloudwatch_event_rule.daily');
    await delay(500);
    log('result', '  Plan: 2 to add, 1 to change, 0 to destroy.');
    await delay(600);
    setStage('stage-plan', 'success');

    log('', '');
    log('result', '[CI]Stage: Apply');
    setStage('stage-apply', 'running');
    await delay(350);
    log('cmd',  '+ terraform apply tfplan');
    await delay(600);
    log('dim',  '  aws_iam_role.ci_runner: Modifying...');
    await delay(500);
    log('check', '  aws_iam_role.ci_runner: Modifications complete.');
    await delay(400);
    log('dim',  '  aws_lambda_function.cost_monitor: Creating...');
    await delay(600);

    const fail = Math.random() < 0.35;

    if (fail) {
      setStage('stage-apply', 'failed');
      log('tool',  '  Error: ResourceNotFoundException: Function not found');
      await delay(300);
      log('tool',  '  Error applying plan. 1 error.');
      await delay(500);
      log('', '');
      log('tool',  '[CI]Stage: Apply — FAILED');
      await delay(600);

      log('', '');
      log('result', '[CI]Stage: Rollback');
      setStage('stage-rollback', 'show');
      setStage('stage-rollback', 'running');
      await delay(400);
      log('cmd',  '+ git revert HEAD --no-edit');
      await delay(500);
      log('dim',  'Revert "feat: add cost monitoring Lambda"');
      await delay(400);
      log('dim',  '1 file changed, 4 insertions(+), 12 deletions(-)');
      await delay(500);
      log('cmd',  '+ terraform apply -target=aws_iam_role.ci_runner');
      await delay(700);
      log('dim',  '  aws_iam_role.ci_runner: Reverting...');
      await delay(500);
      log('check', '  aws_iam_role.ci_runner: Revert complete.');
      await delay(400);
      log('result', '  Apply complete! Resources: 0 added, 1 changed, 1 destroyed.');
      await delay(500);
      setStage('stage-rollback', 'success');
      log('', '');
      log('tool',  '[CI]Finished: FAILURE (rolled back)');
    } else {
      log('check', '  aws_lambda_function.cost_monitor: Creation complete.');
      await delay(400);
      log('dim',  '  aws_cloudwatch_event_rule.daily: Creating...');
      await delay(500);
      log('check', '  aws_cloudwatch_event_rule.daily: Creation complete.');
      await delay(600);
      setStage('stage-apply', 'success');
      log('', '');
      log('check', '  Apply complete! Resources: 2 added, 1 changed, 0 destroyed.');
      await delay(400);
      log('', '');
      log('check', '[CI]Finished: SUCCESS');
    }

    await delay(500);

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

