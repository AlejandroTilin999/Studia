<x-mail::message>
# ¡Hola, {{ $userName }}!

Tu cuenta se ha creado con éxito. Estamos muy alegres de tenerte aquí.

<x-mail::button :url="config('app.url')">
Acceder a mi Cuenta
</x-mail::button>

Gracias,<br>
{{ config('app.name') }}
</x-mail::message>