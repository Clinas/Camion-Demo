DOMINIO:
tengo un sistema de gestion de ventas donde ingresan pedidos con su detalle, luego preparan esos pedidos con productos que hay en el sistema (producto  
 significa sku o registro que identifica una unidad fisica real. en su forma generica se denomina articulo), remiten y cargan en camiones, junto con  
 muchas otras features de produccion, etc (es un ERP legacy completo).  
 en los pedidos los clientes pueden solicitar productos especificos, que significan una unidad, o articulos,
junto con una cantidad o kilos pretendidos.
estos pedidos son informados a un sistema de terceros que los prioriza y asigna a camiones en dias especificos y les establece un orden de entrega.

Luego nos pasa esta informacion a nosotros via api y se registra el camion y el orden de entrega en el pedido.
a partir de ahi, o mientras tanto, existen varias formas en la que la planta puede operar para cumplir con esos  
 pedidos. algunos generan un remito directamente en base al pedido, reemplazando articulos con cantidad por productos especificos para cumplir y
confiando en que el stock del sistema es correcto al indicar que un producto existe fisicamente.
otros pueden optar por ir al almacen y "colectar" productos para cada pedido, leyendolos con un scanner en un colector android. completandolos de esta forma y luego generando un remito en base a lo  
 COLECTADO.
otros pueden hacer variaciones del proceso donde, por ejemplo, ellos pueden querer ordenar los productos en el orden que deben ser subidos al
camion, pero no subirlos efectivamente en ese momento y luego generar el remito, y ese seria su acto de "colectar" porque hacen tanto el ordenamiento  
 como la colectada en la misma accion, mientras que otros pueden separar o verificar los productos colectandolos previamente, generar o no el remito,  
 luego ordenarlos y luego remitir y subirlos al camion.
tambien existe la opcion de colectar para una determinada cuenta (cliente) y asignar arbitrariamente a un camion en una fecha sin tener un pedido y por el momento sin
orden de entrega. esto se llama colectada simple o colectada sin pedido. luego se pueden generar los remitos para estas colectadas o simplemente se puede
cargar un remito arbitrariamente cuando se desee.  
 como se ve, existen varias formas mas o menos directas y fiables de llegar de un pedido a un remito, pero al final del proceso, lo que importa es que lo que se
encuentra en el camion coincida con lo que dicen los remitos y el orden de carga de los productos sea el correcto (FIFO) y en consecuenciaque los productos
correctos hayan egresado del sistema.
por supuesto existen casos donde se pueden remitir varios pedidos de la misma cuenta en un solo remito, en cuyo caso se entregaran todos  
 juntos. el sistema ya tiene todas las tablas y datos necesarios para hacer cualquiera de estos procesos.

algunas reglas y restricciones que pueden ser relevantes:

- Los pedidos son inmutables, las colectadas se registran en otra tabla y pueden no coincidir exactamente con lo pedido.
- Los remitos son inmutables y son un documento legal. Debe indicar exactamente lo que contiene el camion y si no debe anularse.
- Los productos dejan de estar en stock cuando se genera el remito
- Los productos solo pueden colectarse una vez y si estan en stock, pero no es garantia de que no deje de estarlo antes de generar el remito.
- los productos solo pueden estar en un pedido, pero eso no es garantia de que no dejen de estar en stock antes de generar el remito.
- cada producto tiene un codigo de barra con un numero denominado "identificador"
- La patente del camion es obligatoria en el remito (todos los remitos tienen camion asignado)

Requerimiento:

Desarrollar una aplicacion movil que permita realizar el proceso de "control de carga" donde se pueda mostrar el contenido que debe tener un camion en una determinada fecha y en que orden cargarlo, permitiendo al usuario validar leyendo los codigos de barra de los productos fisicos.
El contenido del camion puede venir de tres grandes vias: remitos, colectadas con o sin pedido sin remitir o pedidos que aun no tienen nada colectado ni remito,
pero ya pueden haber sido asignados al camion.
La idea es tener una interface agil que de la maxima visibilidad posible a esta informacion para realizar un control en cualquier momento, siempre que ya haya mercaderia asignada al camion de alguna manera.
Existe algo muy importante y es que esta aplicacion debe poder funcionar "offline" ya que en ciertos lugares de los depositos no hay wifi, por lo que las lecturas de los codigos de barra se deben almacenar para sincronizar luego. Si bien los productos con SKU pueden ser cotejados en el momento sin acceso al servidor, si se da el caso donde solo tengo un pedido con un codigo de articulo y 20 unidades, yo no tengo conexion para obtener la data de ese identificador y cotejar si coincide. por eso debe tener un modo "offline" donde si no puede cotejar sku en el momento, debe almacenar la informacion para ser cotejada mas adelante, sin perder la agilidad del proceso. en casos donde los skus ya esten determinados, se puede cotejar en la aplicacion.
obviamente la aplicacion debe alertar cuando un producto se esta leyendo fuera de orden o duplicado, o simplemente no coincide con lo que debe tener el camion.
Tambien estaria bueno ofrecer al usuario informacion y seleccion sobre de donde tomar los datos para el contenido del camion. es decir, poder elegir si es de remitos, de pedidos, de colectadas, cruzar si un pedido tiene colectadas asociadas y quizas indicar que productos coinciden pedido/colectada/remito y cuales no, para que el usuario haga con esa informacion lo que desee (quizas es correcto). quizas desee grabar todo lo que leyo fisicamente como colectado para cierto pedido, y asi unificar el paso ordenamiento/colectada para luego generar el remito correcto. seguramente existan otros puntos de cruce de informacion util que ahora no veo. tambien podemos contemplar correcciones (recordar que los pedidos y los remitos son inmutables). importante siempre tener en cuenta la conectividad!

Desarrollame una app en el framework que te parezca (react native, flutter, kotlin, capacitor, maui) para android solo a modo prototipo, no necesito auth ni nada, con datasources falsos o una api en node, lo que sea, pero que muestre este flujo y parezca que funciona jeje
