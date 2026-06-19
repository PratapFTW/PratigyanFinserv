(function () {
  'use strict';

  // Mobile navigation
  const navToggle = document.getElementById('navToggle');
  const nav = document.getElementById('nav');
  const navDropdowns = document.querySelectorAll('.nav-dropdown');

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });

    document.querySelectorAll('.nav-link, .dropdown-menu a').forEach(function (link) {
      link.addEventListener('click', function () {
        if (window.innerWidth <= 768) {
          nav.classList.remove('open');
        }
      });
    });
  }

  navDropdowns.forEach(function (navDropdown) {
    const dropdownLink = navDropdown.querySelector('.nav-link');
    dropdownLink.addEventListener('click', function (e) {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        navDropdowns.forEach(function (item) {
          if (item !== navDropdown) item.classList.remove('open');
        });
        navDropdown.classList.toggle('open');
      }
    });
  });

  // Active nav link on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function updateActiveNav() {
    const scrollY = window.scrollY + 120;

    sections.forEach(function (section) {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(function (link) {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav);

  // Scroll to top button
  const scrollTopBtn = document.getElementById('scrollTop');

  if (scrollTopBtn) {
    window.addEventListener('scroll', function () {
      scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
    });

    scrollTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Animated stats counter
  const statNumbers = document.querySelectorAll('.stat-number');
  let statsAnimated = false;

  function animateStats() {
    if (statsAnimated) return;

    const statsSection = document.querySelector('.stats-section');
    if (!statsSection) return;

    const rect = statsSection.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      statsAnimated = true;

      statNumbers.forEach(function (stat) {
        const target = parseInt(stat.getAttribute('data-target'), 10);
        const duration = 2000;
        const start = 0;
        const startTime = performance.now();

        function update(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          stat.textContent = Math.floor(start + (target - start) * eased);

          if (progress < 1) {
            requestAnimationFrame(update);
          } else {
            stat.textContent = target;
          }
        }

        requestAnimationFrame(update);
      });
    }
  }

  window.addEventListener('scroll', animateStats);
  animateStats();

  // EMI Calculator
  const loanAmount = document.getElementById('loanAmount');
  const loanAmountRange = document.getElementById('loanAmountRange');
  const interestRate = document.getElementById('interestRate');
  const interestRateRange = document.getElementById('interestRateRange');
  const tenure = document.getElementById('tenure');
  const tenureRange = document.getElementById('tenureRange');
  const tenureBtns = document.querySelectorAll('.tenure-btn');
  const calculateBtn = document.getElementById('calculateEmi');
  const emiResult = document.getElementById('emiResult');
  const interestResult = document.getElementById('interestResult');
  const totalResult = document.getElementById('totalResult');
  const viewChartBtn = document.getElementById('viewChart');
  const emiChart = document.getElementById('emiChart');
  const chartCanvas = document.getElementById('chartCanvas');

  let tenureType = 'months';

  function syncInputs(input, range) {
    input.addEventListener('input', function () {
      range.value = input.value;
      calculateEMI();
    });
    range.addEventListener('input', function () {
      input.value = range.value;
      calculateEMI();
    });
  }

  if (loanAmount && loanAmountRange) syncInputs(loanAmount, loanAmountRange);
  if (interestRate && interestRateRange) syncInputs(interestRate, interestRateRange);
  if (tenure && tenureRange) syncInputs(tenure, tenureRange);

  tenureBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      tenureBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      tenureType = btn.getAttribute('data-type');

      if (tenureType === 'years') {
        tenureRange.min = 1;
        tenureRange.max = 30;
        tenureRange.value = Math.max(1, Math.round(tenure.value / 12));
        tenure.value = tenureRange.value;
      } else {
        tenureRange.min = 6;
        tenureRange.max = 360;
        tenureRange.value = tenure.value;
      }

      calculateEMI();
    });
  });

  function formatCurrency(amount) {
    return '₹ ' + Math.round(amount).toLocaleString('en-IN');
  }

  function getTenureMonths() {
    const val = parseFloat(tenure.value) || 0;
    return tenureType === 'years' ? val * 12 : val;
  }

  function calculateEMI() {
    const principal = parseFloat(loanAmount.value) || 0;
    const rate = parseFloat(interestRate.value) || 0;
    const months = getTenureMonths();

    if (principal <= 0 || rate <= 0 || months <= 0) {
      emiResult.textContent = formatCurrency(0);
      interestResult.textContent = formatCurrency(0);
      totalResult.textContent = formatCurrency(0);
      return { emi: 0, totalInterest: 0, totalPayment: 0, principal: 0 };
    }

    const monthlyRate = rate / 12 / 100;
    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) /
      (Math.pow(1 + monthlyRate, months) - 1);
    const totalPayment = emi * months;
    const totalInterest = totalPayment - principal;

    emiResult.textContent = formatCurrency(emi);
    interestResult.textContent = formatCurrency(totalInterest);
    totalResult.textContent = formatCurrency(totalPayment);

    return { emi, totalInterest, totalPayment, principal };
  }

  if (calculateBtn) {
    calculateBtn.addEventListener('click', calculateEMI);
  }

  calculateEMI();

  // Simple chart drawing
  if (viewChartBtn && chartCanvas) {
    viewChartBtn.addEventListener('click', function () {
      const wasHidden = emiChart.hasAttribute('hidden');
      if (wasHidden) {
        emiChart.removeAttribute('hidden');
        drawChart();
        viewChartBtn.textContent = 'Hide Chart';
      } else {
        emiChart.setAttribute('hidden', '');
        viewChartBtn.textContent = 'View Chart';
      }
    });
  }

  function drawChart() {
    const result = calculateEMI();
    const ctx = chartCanvas.getContext('2d');
    const width = chartCanvas.parentElement.clientWidth - 48;
    const height = 280;

    chartCanvas.width = width;
    chartCanvas.height = height;

    const padding = { top: 30, right: 20, bottom: 50, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    ctx.clearRect(0, 0, width, height);

    const principal = result.principal;
    const interest = result.totalInterest;
    const maxVal = Math.max(principal, interest);

    const barWidth = chartWidth / 4;
    const principalHeight = (principal / maxVal) * chartHeight;
    const interestHeight = (interest / maxVal) * chartHeight;

    // Principal bar
    ctx.fillStyle = '#0c4a6e';
    const px = padding.left + barWidth * 0.5;
    ctx.fillRect(px, padding.top + chartHeight - principalHeight, barWidth, principalHeight);

    // Interest bar
    ctx.fillStyle = '#d97706';
    const ix = padding.left + barWidth * 2;
    ctx.fillRect(ix, padding.top + chartHeight - interestHeight, barWidth, interestHeight);

    // Labels
    ctx.fillStyle = '#64748b';
    ctx.font = '13px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Principal', px + barWidth / 2, height - 20);
    ctx.fillText('Interest', ix + barWidth / 2, height - 20);

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillText(formatCurrency(principal), px + barWidth / 2, padding.top + chartHeight - principalHeight - 10);
    ctx.fillText(formatCurrency(interest), ix + barWidth / 2, padding.top + chartHeight - interestHeight - 10);

    // Title
    ctx.fillStyle = '#082f49';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Loan Breakdown', padding.left, 20);
  }

  // Contact form
  const contactForm = document.getElementById('contactForm');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const name = document.getElementById('name').value;
      const phone = document.getElementById('phone').value;
      const email = document.getElementById('email').value;
      const loanType = document.getElementById('loanType').value;
      const message = document.getElementById('message').value;

      const subject = encodeURIComponent('Loan Inquiry from ' + name);
      const body = encodeURIComponent(
        'Name: ' + name + '\n' +
        'Phone: ' + phone + '\n' +
        'Email: ' + email + '\n' +
        'Loan Type: ' + loanType + '\n\n' +
        'Message:\n' + message
      );

      window.location.href = 'mailto:info@pratigyanfinserv.com?subject=' + subject + '&body=' + body;
    });
  }
})();
