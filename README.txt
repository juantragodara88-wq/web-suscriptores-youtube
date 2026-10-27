# Web de suscriptores de YouTube

## Archivos
- `index.html`: tabla principal y formulario para agregar canales.
- `ranking.html`: ranking ordenado por cantidad de suscriptores.
- `styles.css`: diseño adaptable a móvil y escritorio.
- `app.js`: almacenamiento local e historial de consultas.

## Uso
Abre `index.html` en el navegador. Agrega un canal y su cantidad actual de suscriptores. Para registrar una nueva consulta, pulsa **Actualizar cifra**. La web guarda cada cifra y compara las dos últimas consultas para mostrar ganancias o pérdidas.

## Importante
Esta plantilla no consulta YouTube automáticamente. Las cifras se introducen manualmente. Los datos se guardan en `localStorage` del navegador/dispositivo y no se comparten entre dispositivos ni usuarios. Si publicas archivos estáticos en Render, esta plantilla puede servir como base; para sincronización o datos centralizados se necesitaría una API/backend y almacenamiento persistente.
