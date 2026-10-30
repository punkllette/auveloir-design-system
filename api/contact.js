const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzQpe1D_HfVxHIJAs6Fk6IUo5HR7P1MPgRL0_AzhGBlBXVC_8WCU6xwBqOJ85i7jHx4/exec';

export default {
  async fetch(request) {
    if (request.method !== 'POST') return Response.json({ ok: false }, { status: 405 });
    if (Number(request.headers.get('content-length') || 0) > 8192) return Response.json({ ok: false }, { status: 413 });
    const origin = request.headers.get('origin');
    if (origin && origin !== new URL(request.url).origin) return Response.json({ ok: false }, { status: 403 });

    let data;
    try {
      data = await request.formData();
    } catch {
      return Response.json({ ok: false }, { status: 400 });
    }
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const telefone = String(data.get('telefone') || '').trim();
    const submissionId = String(data.get('submission_id') || '');
    const validId = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(submissionId);
    if (data.get('_honey') || !name || name.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || !/^[+\d\s().-]{8,40}$/.test(telefone) || data.get('consentimento') !== 'Sim' || !validId) {
      return Response.json({ ok: false, message: 'Confira os dados e tente novamente.' }, { status: 400 });
    }

    const body = new URLSearchParams({ name, email, telefone, consentimento: 'Sim', submission_id: submissionId, response_format: 'json' });
    try {
      const upstream = await fetch(WEB_APP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
        signal: AbortSignal.timeout(20000),
      });
      if (!upstream.ok) throw new Error('upstream status');
      const result = await upstream.json();
      if (result.ok === true && result.saved === true && result.submissionId === submissionId) {
        return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
      }
      return Response.json({ ok: false, message: 'O salvamento não foi confirmado. Tente novamente.' }, { status: 502 });
    } catch {
      return Response.json({ ok: false, message: 'Não foi possível confirmar o envio. Tente novamente.' }, { status: 502 });
    }
  },
};
