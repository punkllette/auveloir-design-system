document.addEventListener('click', (event) => {
  const link = event.target instanceof Element
    ? event.target.closest('a[data-track-contact="true"]')
    : null;
  if (!link) return;

  // The GA4 tag queues the event in dataLayer even if it is still loading.
  // Let the mailto link open normally; never send the visitor's address.
  window.gtag?.('event', 'generate_lead', {
    method: 'email',
    event_category: 'contact',
    event_label: 'iniciar_uma_conversa',
  });
});
