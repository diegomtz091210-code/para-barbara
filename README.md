# Bárbara, mira esto.

Una carta ilustrada para recorrer a pie: portada, 49 obras (22 de Vincent van Gogh) y una última hoja que dice «Te amo». Las obras aparecen completas en cinco tramos. Cada obra tiene una nota breve para Bárbara, escrita con palabras de todos los días.

## El paseo

Dos siluetas de tinta, un niño y una niña, caminan de la mano en el margen inferior. El niño guía y lleva una ramita en la mano libre. Al regresar, ambos giran alrededor de sus manos unidas sin saltar de un lado a otro. La posición, los pasos y las huellas siguen a las flechas y a las hojas que se arrastran, se sostienen o se devuelven.

El paisaje continuo empieza en un huerto y pasa por girasoles, una casa de contraventanas, un puente y un cielo de estrellas. La ramita florece durante el paseo. Al llegar la pareja sigue de la mano y el niño lleva la flor para Bárbara. En el borde de la página final hay una flor por cada pintura, con un pigmento tomado de su propia reproducción.

La portada conserva su pincel, ahora sobre la invitación «Vi estos girasoles y pensé en ti. ¿Me acompañas un ratito?». Bajo «Ven conmigo» ya no se muestra la instrucción sobre el niño. Un hilo sale de las estampas y llega al comienzo del camino. El collage de la portada y el paisaje del margen también se usan en la imagen para compartir el enlace.

## Las láminas y las cartas

La colección incluye 49 obras, entre ellas grabados y óleos. *Autorretrato con Saskia* de Rembrandt y *El paseo* de Renoir ocupan el lugar de las dos obras retiradas. Las diez incorporaciones son *La urraca*, *La carta*, *Ejiri en la provincia de Suruga*, *Muchacha leyendo*, *Calle de París, día de lluvia* y cinco láminas de Van Gogh: *La cosecha*, *Barcos de pesca en la playa de Saintes-Maries*, *La silla de Van Gogh*, *El cartero Joseph Roulin* y *Trigal con cuervos*. Las fichas de los museos y la procedencia de las reproducciones se conservan en `artworks.json`.

Los detalles de los márgenes se elaboran desde las imágenes reales: una parte queda como estudio de tinta y el pigmento reaparece en el resto. Algunas parejas se leen en dos medallones unidos por un hilo. La obra principal sigue sin filtros ni recortes. En tamaños estrechos los estudios se ajustan al espacio libre.

El sobre «Una nota» despliega una carta distinta en la portada, en cada pintura y en la llegada. El texto y el sello cambian juntos. El cuaderno abre un mapa de cinco tramos donde se elige una miniatura o «Una al azar» para sacar una obra de una baraja sin repeticiones en la misma vuelta; el autor distingue los dos cuadros titulados *El beso*. Al tocar una pintura se puede ampliar y consultar su ficha.

## La luz y el atardecer

Un reflector dibujado en la parte superior dirige un haz triangular cálido hacia el libro. Las esquinas de arriba quedan en sombra. La luz permanece fija durante el giro y deja pasar los toques y gestos. La última página muestra un atardecer pintado especialmente para la dedicatoria (no es una pintura atribuida a un autor del catálogo). El encuadre para cada pantalla conserva el sol detrás de «Te amo». El nombre, la declaración y la última frase se revelan por orden, después de asentarse la hoja. Al levantarla solo un poco se ve el cielo sin adelantar la dedicatoria. Con movimiento reducido, todo el texto está visible de inmediato.

## Navegar

Flechas, teclado, deslizamiento o arrastre controlan el mismo recorrido. Una hoja doblada poco regresa; al soltarla más lejos acaba el giro. Los saltos grandes desde el mapa llevan a la pareja a su destino sin hacerla correr a través de todo el libro. Con movimiento reducido se omiten el giro, la animación de la carta, la escritura y la marcha, manteniendo la posición correcta.

Los enlaces nuevos a las pinturas usan identificadores estables, como `#obra/courting-garden`. `#0` abre la portada y `#te-amo` el final. Los números de página de la versión anterior conservan su destino original, aunque cambie la posición. Los enlaces a obras retiradas ahora abren su sustitución.

## Archivos y publicación

- `dist/app.js`: navegación, mapa, cartas, escritura, gestos y sincronización del paseo.
- `dist/traveler.js` y `dist/journey.js`: dibujo de las dos figuras, escenarios y recorrido de la pareja. El paisaje se prerenderiza por tamaño y se desplaza durante el giro.
- `dist/postscript.js`: las cartas de portada y despedida, el acceso a la nota de cada obra y las marcas dibujadas de los cinco tramos.
- `dist/folio.js`, `dist/plate-studies.js` y `dist/brush-engine.js`: composición de cada pintura, grabados originales derivados de los detalles, pigmentos y pincel de portada.
- `dist/book-engine.js`: pliegue cilíndrico oblicuo, papel envejecido, luces, sombras y recortes de la tinta. El giro automático dura 1,69 segundos.
- `dist/luz.css` y el SVG de `dist/index.html`: reflector, haz y posición del texto sobre el sol.
- `dist/endpapers.js` y `dist/graphics/`: portada y guarda final. `design/atardecer.md` identifica la ilustración y conserva el encargo original. `scripts/render-share-card.cjs` reproduce la imagen social de 1200 × 630 px a partir de los mismos dibujos.
- `artworks.json` y `dist/artworks.js`: imágenes, autores, fechas, frases, notas, puntos de enfoque, paletas y licencias.
- `dist/images/`, `dist/thumbs/` y `dist/fonts/`: reproducciones, miniaturas y tipografía locales.

Sitio estático. Para alojarlo en un servidor estático, publica el contenido de `dist`. No tiene cuentas, cookies, seguimiento ni dependencias de producción.

## Verificación

`node checks/navigation.cjs` ejecuta las 51 escenas con un DOM y un reloj controlados. Verifica que marcha y página coinciden al avanzar, regresar, cancelar, interrumpir, abrir una posdata, saltar desde un enlace anterior y usar movimiento reducido.

`node checks/book-engine.cjs` comprueba el giro real en Canvas, los extremos exactos y la ausencia de huecos en tres tamaños, a densidad 1 y 2. `node checks/journey.cjs` comprueba las dos figuras por píxeles: dos cabezas separadas, manos unidas, paso y regreso, y márgenes completos en las dos puntas del recorrido. La prueba de navegación también comprueba que la dedicatoria comienza oculta, revela sus tres partes y respeta el movimiento reducido.

En Chrome se revisaron el reflector sobre la portada y una pintura nocturna, la pareja en el camino y las distintas partes de la dedicatoria sobre el atardecer. Se comprobó el cierre a 320 × 568 y 390 × 844 píxeles CSS. Son comprobaciones en navegador, no en teléfonos físicos.

## Papel y tinta · revisión 19

Papel crema y beige, tinta azul oscuro. Caligrafía Pinyon Script para títulos y Petit Formal Script para las frases, con licencias OFL locales. La mujer con sombrilla de Monet (1875, NGA 1983.1.29) se suma al tramo verde y azul; las 49 reproducciones conservan su color. Las letras y la navegación mantienen un tono cercano.

Revisión 19: portada, sombrilla de Monet, nota desplegada, frase nocturna más larga y dedicatoria comprobadas en Chrome a 390 × 844 y 320 × 568; también 700 × 390. Navegación y geometría de papel verificadas con las comprobaciones locales.
