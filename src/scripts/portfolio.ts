let disposePage = () => {};

function initializePortfolio() {
  disposePage();
  document.body.classList.toggle('in-catalog-iframe', window.self !== window.top);
  (window as Window & { lucide?: { createIcons: () => void } }).lucide?.createIcons();

  const main = document.getElementById('main-content');
  const grid = main?.querySelector('.projects-grid');
  if (!main || !grid) return;

  const controller = new AbortController();
  const timers: number[] = [];
  const marquee = main.querySelector<HTMLElement>('.marquee-container');
  const marqueeToggle = main.querySelector<HTMLButtonElement>('.marquee-toggle');
  marqueeToggle?.addEventListener('click', () => {
    const paused = marquee?.classList.toggle('is-paused') ?? false;
    marqueeToggle.setAttribute('aria-pressed', String(paused));
    marqueeToggle.textContent = paused ? 'Retomar movimento' : 'Pausar movimento';
  }, { signal: controller.signal });
  const observed = main.querySelectorAll<HTMLElement>('.timeline-item-wrapper, .projects-grid, .cta-section');

  let revealObserver: IntersectionObserver | undefined;
  if ('IntersectionObserver' in window) {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        if (entry.target.classList.contains('projects-grid')) {
          entry.target.querySelectorAll('.project-card').forEach((card, index) => {
            timers.push(window.setTimeout(() => card.classList.add('active'), index * 200));
          });
        } else {
          entry.target.classList.add('active');
        }
        revealObserver?.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
    observed.forEach((element) => revealObserver?.observe(element));
  } else {
    observed.forEach((element) => element.classList.add('active'));
    grid.querySelectorAll('.project-card').forEach((card) => card.classList.add('active'));
  }

  const progressLine = document.getElementById('timeline-progress-v');
  const timelineBody = main.querySelector('.timeline-body');
  const updateTimelineProgress = () => {
    if (!progressLine || !timelineBody) return;
    const rect = timelineBody.getBoundingClientRect();
    const startScroll = rect.top - window.innerHeight / 2;
    if (startScroll < 0) {
      const progress = Math.min(Math.max((Math.abs(startScroll) / rect.height) * 100, 0), 100);
      progressLine.style.height = `${progress}%`;
    }
  };

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    main.querySelectorAll<HTMLElement>('.project-card').forEach((card) => {
      card.addEventListener('mousemove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
        const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -10;
        const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 10;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      }, { signal: controller.signal });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
      }, { signal: controller.signal });
    });
  }

  window.addEventListener('scroll', updateTimelineProgress, { passive: true, signal: controller.signal });
  window.addEventListener('resize', updateTimelineProgress, { signal: controller.signal });
  updateTimelineProgress();

  disposePage = () => {
    revealObserver?.disconnect();
    controller.abort();
    timers.forEach((timer) => clearTimeout(timer));
  };
}

document.addEventListener('astro:page-load', initializePortfolio);
