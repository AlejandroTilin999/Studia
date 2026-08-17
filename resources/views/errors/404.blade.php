@php
    // Nunca consultamos al usuario en un 404: la respuesta debe ser inmediata.
    $role = explode('/', trim(request()->path(), '/'))[0] ?? '';
    $user = in_array($role, ['admin', 'docente', 'alumno'], true);
    $homeUrl = match ($role) {
        'admin' => '/admin',
        'docente' => '/docente',
        'alumno' => '/alumno',
        default => '/',
    };
    $homeLabel = $user ? 'Volver a mi inicio' : 'Ir a la página principal';
@endphp
<!DOCTYPE html>
<html lang="es-MX">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex">
    <title>Página no encontrada · {{ config('app.name', 'Prepahid') }}</title>
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <style>
        :root { color-scheme: light; }
        * { box-sizing: border-box; }
        body { margin: 0; min-width: 320px; background: #f8fafc; color: #0f172a; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
        .page { min-height: 100vh; display: grid; place-items: center; padding: 48px clamp(24px, 7vw, 120px); background-color: #f8fafc; background-image: linear-gradient(to right, rgba(2, 102, 224, .035) 1px, transparent 1px), linear-gradient(to bottom, rgba(2, 102, 224, .035) 1px, transparent 1px), radial-gradient(circle at 10% 18%, rgba(2, 102, 224, .10) 0 34px, transparent 35px), radial-gradient(circle at 89% 78%, rgba(2, 102, 224, .08) 0 52px, transparent 53px); background-size: 32px 32px, 32px 32px, auto, auto; }
        .page::before, .page::after { content: ''; position: fixed; pointer-events: none; opacity: .5; }
        .page::before { top: 15%; right: 10%; width: 52px; height: 52px; border: 2px solid #bfdbfe; border-radius: 13px; transform: rotate(18deg); }
        .page::after { bottom: 13%; left: 12%; width: 44px; height: 44px; border: 2px solid #dbeafe; border-radius: 999px; }
        .content { width: min(100%, 1320px); min-height: min(76vh, 720px); padding: clamp(52px, 7vw, 96px) clamp(28px, 7vw, 112px); display: flex; flex-direction: column; align-items: center; justify-content: center; background: #fff; border: 1px solid #dbe4ef; border-radius: 8px; text-align: center; }
        .logo { width: 174px; height: auto; margin: 0 auto 52px; display: block; }
        .eyebrow { margin: 0 0 18px; color: #0266e0; font-size: 12px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; }
        h1 { max-width: 900px; margin: 0 0 18px; font-size: clamp(34px, 4.2vw, 58px); line-height: 1.08; letter-spacing: -.05em; }
        .description { max-width: 560px; margin: 0 auto; color: #64748b; font-size: clamp(16px, 1.4vw, 19px); line-height: 1.6; }
        .actions { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; margin-top: 36px; }
        a { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: 0 20px; border-radius: 10px; font-weight: 700; text-decoration: none; transition: background .15s ease, color .15s ease; }
        .primary { background: #0266e0; color: #fff; }
        .primary:hover { background: #0759ba; }
        .secondary { border: 1px solid #cbd5e1; color: #334155; }
        .secondary:hover { background: #f8fafc; }
        @media (max-width: 720px) { .page { padding: 20px 16px; } .content { width: 100%; min-height: calc(100vh - 40px); padding: 48px 22px; border-radius: 7px; } .logo { width: 146px; margin-bottom: 42px; } .eyebrow { font-size: 10px; letter-spacing: .14em; } h1 { font-size: clamp(33px, 10vw, 45px); } .actions { width: 100%; flex-direction: column; } .actions a { width: 100%; } }
    </style>
</head>
<body>
    <main class="page">
        <section class="content" aria-labelledby="error-title">
            <img class="logo" src="/assets/phid_logo.webp" alt="Prepahid" draggable="false">
            <p class="eyebrow">No pudimos encontrarte el camino</p>
            <h1 id="error-title">¡Ups! La página que buscas no existe.</h1>
            <p class="description">La dirección puede haber cambiado, estar incompleta o ya no estar disponible.</p>
            <div class="actions">
                <a class="primary" href="{{ $homeUrl }}" onclick="if (window.history.length > 1) { event.preventDefault(); window.history.back(); }">Regresar</a>
                <a class="secondary" href="{{ $homeUrl }}">{{ $homeLabel }}</a>
            </div>
        </section>
    </main>
</body>
</html>
