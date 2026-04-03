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

  const mobileIndicator = document.getElementById('mobileStageIndicator');

  function updateMobileIndicator(el, status) {
    if (!mobileIndicator) return;
    mobileIndicator.className = 'mobile-stage-indicator ' + status;
    mobileIndicator.querySelector('.mobile-stage-label').textContent = el.querySelector('.stage-name').textContent;
  }

  function setStage(id, status) {
    const el = document.getElementById(id);
    if (!el) return;
    if (status === 'show') { el.style.opacity = '1'; el.style.pointerEvents = ''; return; }
    const wasMobileActive = el.classList.contains('mobile-active');
    el.className = 'stage-item ' + status;
    if (status === 'running') {
      // Promote current active → prev, evict oldest if more than 2 prev exist
      document.querySelectorAll('.stage-item.mobile-active').forEach(s => {
        s.classList.remove('mobile-active');
        s.classList.add('mobile-prev');
      });
      const prevItems = document.querySelectorAll('.stage-item.mobile-prev');
      if (prevItems.length > 2) prevItems[0].classList.remove('mobile-prev');
      el.classList.add('mobile-active');
      updateMobileIndicator(el, status);
    } else if (wasMobileActive) {
      el.classList.add('mobile-active');
      updateMobileIndicator(el, status);
    }
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

  const stageIds = ['stage-checkout','stage-test','stage-package','stage-s3','stage-lambda','stage-apigw','stage-tfvalidate','stage-tfplan','stage-tfapply'];

  function reset() {
    running = false;
    linesEl.innerHTML = '';
    stageIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.className = 'stage-item pending';
    });
    if (mobileIndicator) {
      mobileIndicator.className = 'mobile-stage-indicator';
      mobileIndicator.querySelector('.mobile-stage-label').textContent = '';
    }
  }

  async function run() {
    if (running) return;
    running = true;
    linesEl.innerHTML = '';

    await delay(300);

    function log(cls, text) {
      linesEl.appendChild(span(cls, text));
    }

    log('dim', '[CI/CD]Running on agent-01');
    log('dim', '[CI/CD]Workspace: /var/ci/workspace/api-deploy');
    await delay(500);

    // Checkout
    log('', '');
    log('result', '[CI/CD]Stage: Checkout');
    setStage('stage-checkout', 'running');
    await delay(350);
    log('cmd', '+ git checkout 4f9a2c1');
    await delay(300);
    log('dim', 'HEAD is now at 4f9a2c1 feat: add cost monitoring endpoint');
    await delay(500);
    setStage('stage-checkout', 'success');

    // Test
    log('', '');
    log('result', '[CI/CD]Stage: Test');
    setStage('stage-test', 'running');
    await delay(350);
    log('cmd', '+ npm ci');
    await delay(600);
    log('dim', 'added 247 packages in 3.2s');
    await delay(400);
    log('cmd', '+ npm test');
    await delay(700);
    log('dim', '  \u2714 GET /health \u2192 200');
    await delay(200);
    log('dim', '  \u2714 POST /events \u2192 201');
    await delay(200);
    log('dim', '  \u2714 GET /metrics \u2192 200');
    await delay(400);
    log('check', '  12 tests, 0 failures');
    await delay(500);
    setStage('stage-test', 'success');

    // Package
    log('', '');
    log('result', '[CI/CD]Stage: Package');
    setStage('stage-package', 'running');
    await delay(350);
    log('cmd', '+ npm run build');
    await delay(500);
    log('cmd', '+ zip -r function.zip dist/ node_modules/');
    await delay(600);
    log('dim', '  adding: dist/index.js (deflated 68%)');
    await delay(300);
    log('dim', '  adding: node_modules/ (stored 0%)');
    await delay(400);
    log('check', '  function.zip: 4.2MB');
    await delay(500);
    setStage('stage-package', 'success');

    // S3 Upload
    log('', '');
    log('result', '[CI/CD]Stage: S3 Upload');
    setStage('stage-s3', 'running');
    await delay(350);
    log('cmd', '+ aws s3 cp function.zip s3://adjentic-0904c3ea/builds/4f9a2c1/function.zip');
    await delay(700);
    log('check', '  upload: function.zip to s3://adjentic-0904c3ea/builds/4f9a2c1/function.zip');
    await delay(500);
    setStage('stage-s3', 'success');

    // Lambda
    log('', '');
    log('result', '[CI/CD]Stage: Lambda');
    setStage('stage-lambda', 'running');
    await delay(350);
    log('cmd', '+ aws lambda update-function-code \\');
    log('dim', '    --function-name api-handler \\');
    log('dim', '    --s3-bucket adjentic-0904c3ea \\');
    log('dim', '    --s3-key builds/4f9a2c1/function.zip');
    await delay(700);
    log('cmd', '+ aws lambda wait function-updated --function-name api-handler');
    await delay(800);
    log('check', '  Function updated. Runtime: nodejs20.x');
    await delay(500);
    setStage('stage-lambda', 'success');

    // API Gateway
    log('', '');
    log('result', '[CI/CD]Stage: API Gateway');
    setStage('stage-apigw', 'running');
    await delay(350);
    log('cmd', '+ aws apigateway create-deployment \\');
    log('dim', '    --rest-api-id a1b2c3d4e5 \\');
    log('dim', '    --stage-name prod');
    await delay(700);
    log('check', '  Deployment created: x7y8z9a1');
    await delay(500);
    setStage('stage-apigw', 'success');

    // Terraform Validate + fmt
    log('', '');
    log('result', '[CI/CD]Stage: Tf Validate');
    setStage('stage-tfvalidate', 'running');
    await delay(350);
    log('cmd', '+ terraform validate');
    await delay(600);
    log('check', '  Success! The configuration is valid.');
    await delay(350);
    log('cmd', '+ terraform fmt -check -recursive');
    await delay(700);
    log('check', '  All files formatted correctly.');
    await delay(500);
    setStage('stage-tfvalidate', 'success');

    // Terraform Plan
    log('', '');
    log('result', '[CI/CD]Stage: Tf Plan');
    setStage('stage-tfplan', 'running');
    await delay(350);
    log('cmd', '+ terraform plan -out=tfplan');
    await delay(700);

    const failPlan = Math.random() < 0.3;

    if (failPlan) {
      log('tool', '  Error: Error locking state: Error acquiring the state lock');
      await delay(300);
      log('tool', '  Lock Info:');
      await delay(150);
      log('dim',  '    ID:        b7e3a2f1-04cd-4812-9c3e-d1f8a0e29b55');
      await delay(150);
      log('dim',  '    Path:      adjentic-tfstate/api-deploy.tfstate');
      await delay(150);
      log('dim',  '    Operation: plan');
      await delay(150);
      log('dim',  '    Who:       ci@agent-02');
      await delay(400);
      log('tool', '  Error: Failed to acquire lock. Another plan may be in progress.');
      await delay(400);
      setStage('stage-tfplan', 'failed');
      log('', '');
      log('tool', '[CI/CD]Stage: Tf Plan — FAILED');
      await delay(400);
      log('tool', '[CI/CD]Finished: FAILURE');
    } else {
      log('dim', '  ~ aws_lambda_function.api_handler');
      await delay(300);
      log('dim', '  ~ aws_api_gateway_stage.prod');
      await delay(500);
      log('result', '  Plan: 0 to add, 2 to change, 0 to destroy.');
      await delay(600);
      setStage('stage-tfplan', 'success');

      // Terraform Apply
      log('', '');
      log('result', '[CI/CD]Stage: Tf Apply');
      setStage('stage-tfapply', 'running');
      await delay(350);
      log('cmd', '+ terraform apply tfplan');
      await delay(600);
      log('dim', '  aws_lambda_function.api_handler: Modifying...');
      await delay(600);
      log('check', '  aws_lambda_function.api_handler: Modifications complete.');
      await delay(400);
      log('dim', '  aws_api_gateway_stage.prod: Modifying...');
      await delay(500);
      log('check', '  aws_api_gateway_stage.prod: Modifications complete.');
      await delay(500);
      setStage('stage-tfapply', 'success');
      log('', '');
      log('check', '  Apply complete! Resources: 0 added, 2 changed, 0 destroyed.');
      await delay(400);
      log('', '');
      log('check', '[CI/CD]Finished: SUCCESS');
    }

    await delay(500);

  }

  // Re-run button
  const rerunBtn = document.getElementById('pipelineRerun');
  if (rerunBtn) {
    rerunBtn.addEventListener('click', () => { reset(); setTimeout(run, 200); });
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

