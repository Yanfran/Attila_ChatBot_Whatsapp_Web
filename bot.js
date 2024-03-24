const { Client, Location, List, Buttons, LocalAuth } = require('./index');

const qrcode = require("qrcode-terminal");

const express = require("express");
const app = express();
const server = require("http").createServer(app);
app.use(express.json());
const axios = require("axios");

const cors = require("cors");

const mysql = require('mysql2');

// CONEXION A MYSQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'referidos'
});


app.use(cors());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://187.188.105.205:8082/");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});


require("dotenv").config();
const FormData = require("form-data");
const { Console } = require("console");


const client = new Client({
    authStrategy: new LocalAuth(),
    puppetter: {
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-extensions"],
    },
});

console.log("Iniciando procesos");
client.on("qr", (qr) => {
    //console.log("aqui2");
    qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
    console.log("El cliente está listo");
    server.listen(3010, () => console.log("Conectado al puerto 3010"));
});

client.on("authenticated", () => {
    console.log("AUTHENTICATED");
});

client.on("auth_failure", (msg) => {
    // Habilitado si la restauración de la sesión no tuvo éxito
    console.error("AUTHENTICATION FAILURE", msg);
});

client.initialize();

// Variables globales para verificar si se enviaron los mensajes
let welcomeSent = false;
let menuSent = false;


// URLGLOBAL
// const urlGlobal = "http://187.188.105.205:8082/";
// const urlGlobal = "http://localhost:8080/";
const urlGlobal = "http://localhost/";

const calcularDuracion = (dias) => {
    if (dias < 1) {
      return 'Menos de 1 día';
    } else if (dias === 1) {
      return '1 día';
    } else if (dias >= 2 && dias < 7) {
      return `${dias} días`;
    } else if (dias >= 7 && dias < 30) {
      const semanas = Math.floor(dias / 7);
      const diasRestantes = dias % 7;
      let resultado = '';
      if (semanas > 0) {
        resultado += `${semanas} semana${semanas > 1 ? 's' : ''}`;
      }
      if (diasRestantes > 0) {
        resultado += ` ${diasRestantes} día${diasRestantes > 1 ? 's' : ''}`;
      }
      return resultado.trim();
    } else {
      const meses = Math.floor(dias / 30);
      const diasRestantes = dias % 30;
      const semanas = Math.floor(diasRestantes / 7);
      const diasExtras = diasRestantes % 7;
      let resultado = '';
      if (meses > 0) {
        resultado += `${meses} mes${meses > 1 ? 'es' : ''}`;
      }
      if (semanas > 0) {
        resultado += ` ${semanas} semana${semanas > 1 ? 's' : ''}`;
      }
      if (diasExtras > 0) {
        resultado += ` ${diasExtras} día${diasExtras > 1 ? 's' : ''}`;
      }
      return resultado.trim();
    }
  }; 


var codigo_generado = "";
client.on("message", async (msg) => {

    // if (msg.hasMedia) {
    //     const media = await msg.downloadMedia();
    //     // do something with the media data here
    // }

    const { from, to, body } = msg;

    // Obtenemos número de WS
    console.log("from ", from);
    var ChatID = from.split("@");

    ChatID = "+" + ChatID[0];
    ChatID = ChatID.split("-");
    ChatID = ChatID[0];

    var validar = false;

    var cliente = {};

    var ticketID = [];
     
    // const clienteWS = "+584122771265"; // German
    const clienteWS = "+584243177318"; // Yan        
    // const clienteWS = "+584243579367"; // Jorge        
    console.log("ChatID ", ChatID);
    const robotEmoji = "🤖"; //'🤖'

    //Menú
    const arrMenuList1 = [
        `MENU:
        1.- Seguimiento de orden de reparación
        2.- Nueva orden de reparación
        3.- Cotizar correa/accesorio`,
    ];

    if (ChatID == clienteWS) {
        var telefonoWsSQL = "";        
        var objCliente = {};
        var clientePosition = "";
        var sqlClienteP = "";

        // Crear el objeto FormData
        const formData = new FormData();

        console.log("Here Bot --> ", ChatID);
        var tlfChaID = ChatID;
        // tlfChaID = tlfChaID.substring(3); // Elimina los primeros tres caracteres del número

        console.log("Telefono formato cleaned", tlfChaID);

        var tlfonoWS = tlfChaID;
        var codigo_cliente_node = "";        

        try {
            // tlfonoWS = tlfonoWS.replace("+", "");
            formData.append("telefono", tlfonoWS);

            // Realizar la solicitud POST al servidor
            const response = await axios.post(
                urlGlobal + "ReferidosBack/cliente/cliente.php",
                formData
            );

            objCliente = response.data;            

            if (objCliente && objCliente.clienteRes) {
                console.log("-----------Here: ", objCliente.clienteRes.telefono);                
                telefonoWsSQL = objCliente.clienteRes.telefono;
                codigo_cliente_node = objCliente.clienteRes.codigo_cliente;
            } else {
                console.log(
                    "Error: telefono no encontrado en la respuesta del servidor"
                );
            }
        } catch (error) {
            console.error(error);
        }

        console.log("Info del Cliente2 : ", objCliente);
        var arrayP = {};
        var arrayP1 = {};
        var arrayP2 = {};
        var arrayP3 = {};

        var respStatus = {};
        var respTicket = {};

        if (telefonoWsSQL) {
            const formData2 = new FormData();
            formData2.append("telefono", `${telefonoWsSQL}`);

            // consultar la posición del cliente
            try {
                const response = await axios.post(
                    urlGlobal + "ReferidosBack/cliente/clientePosition.php",
                    formData2
                );

                arrayP = response.data;
                console.log("--------------*arrayP --------> ", arrayP);
                if (arrayP && arrayP.clienteRes) {
                    clientePosition = arrayP.clienteRes;
                    console.log(
                        "--------------*clientePosition --------> ",
                        clientePosition
                    );
                } else {
                    console.log("El cliente tiene posicion indefinida");
                }
                console.log("Res telefonoWsSQL devueltos: ", arrayP);
            } catch (error) {
                console.error(error);
            }
        }

        var posicionTC = clientePosition;
        console.log("posicionTC: ",posicionTC);
        var positionCws;
        var regMS1;      
          

        if (posicionTC == 0 || posicionTC == "") {
                       
                if(posicionTC==""){
                    const welcomeMessage = `¡Hola! Soy el asistente virtual de Attila Distribution Group. ¿Cómo te puedo ayudar? ${robotEmoji}`;
                    client.sendMessage(from, welcomeMessage);
                    const menuListMessage = arrMenuList1.join("\n");
                    client.sendMessage(from, menuListMessage);

                    const psClWs = 0;                                                                                
                    const formData6 = new FormData();
                    formData6.append("telefono", `${telefonoWsSQL}`);                                                
                    formData6.append("posicion", `${psClWs}`); 
        
                    try {
                        const response = await axios.post(
                            urlGlobal + "ReferidosBack/cliente/clienteSetPosition.php",
                            formData6
                        );

                        var respTicketUP10;
                    
                        respTicketUP10 = response.data;            
                        console.log("--------------*CAMBIO A POSICION 1111111* --------> ", respTicketUP10);
                                 
                    } catch (error) {
                        console.error(error); 
                    }

                }else{
                    if (msg.body == 1) {
                        positionCws = 1;
                    } else if (msg.body == 2) {
                        positionCws = 2;
                        console.log("aqui1");
                    } else if (msg.body == 3) {
                        positionCws = 3;
                    }else{
                        const welcomeMessage = `¡Hola! Soy el asistente virtual de Attila Distribution Group. ¿Cómo te puedo ayudar? ${robotEmoji}`;
                        client.sendMessage(from, welcomeMessage);
                        const menuListMessage = arrMenuList1.join("\n");
                        client.sendMessage(from, menuListMessage);
                    }
                }                                    
            
        }
                
        if (posicionTC == 1) {
            regMS1 = msg.body;
            console.log("reg", regMS1);

            const formData5 = new FormData();
            formData5.append("telefono", `${telefonoWsSQL}`);
            formData5.append("codigo_cliente", `${regMS1}`);

            try {
                const response = await axios.post(
                    urlGlobal + "ReferidosBack/ticketCliente/statusTicket.php",
                    formData5
                );

                respStatus = response.data;

                console.log("--------------*respStatus --------> ", respStatus);
                if (respStatus && respStatus.ticketRes) {
                    var descStatus = respStatus.ticketRes.status;
                    var descFechaEntrega = respStatus.ticketRes.fecha_entrega; 

                    console.log(
                        "--------------*respStatus.ticketRes.status --------> ",
                        respStatus.ticketRes.status
                    );
  
                    if (descStatus == "RECEPCION") {
                        var respStatus1 = `Tu reloj está en proceso de ${descStatus}. 
Por ahora se encuentra en el “10%”. Te mantendremos informado`;
                        client.sendMessage(from, respStatus1);

                        const psClWs = "";                                                                                
                        const formData6 = new FormData();
                        formData6.append("telefono", `${telefonoWsSQL}`);                                                
                        formData6.append("posicion", `${psClWs}`); 
            
                        try {
                            const response = await axios.post(
                                urlGlobal + "ReferidosBack/cliente/clienteSetPosition.php",
                                formData6
                            );

                            var respTicketUP10;
                        
                            respTicketUP10 = response.data;            
                            console.log("--------------*respTicket_10% --------> ", respTicketUP10);
                                     
                        } catch (error) {
                            console.error(error); 
                        }


                    } else if(descStatus == "DIAGNOSTICO"){
                        var respStatus2 = `Tu reloj está en proceso de ${descStatus}. 
Por ahora se encuentra en el “20%”. Te mantendremos informado.`;
                        client.sendMessage(from, respStatus2);

                        const psClWs = "";
                        const formData6 = new FormData();
                        formData6.append("telefono", `${telefonoWsSQL}`);
                        formData6.append("posicion", `${psClWs}`);

                        try {
                            const response = await axios.post(
                                urlGlobal + "ReferidosBack/cliente/clienteSetPosition.php",
                                formData6
                            );

                            var respTicketUP20;

                            respTicketUP20 = response.data;
                            console.log("--------------*respTicket_20% --------> ", respTicketUP20);

                        } catch (error) {
                            console.error(error); 
                    }

                    } else if (descStatus == "COTIZACION") {
                        var respStatus3 = `Tu reloj está en proceso de ${descStatus}. 
Por ahora se encuentra en el “30%”. Te mantendremos informado`;
                        client.sendMessage(from, respStatus3);


                        const psClWs = "";                                                                                
                        const formData6 = new FormData();
                        formData6.append("telefono", `${telefonoWsSQL}`);                                                
                        formData6.append("posicion", `${psClWs}`); 
            
                        try {
                            const response = await axios.post(
                                urlGlobal + "ReferidosBack/cliente/clienteSetPosition.php",
                                formData6
                            );
                            
                            var respTicketUP30;

                            respTicketUP30 = response.data;            
                            console.log("--------------*respTicket_30% --------> ", respTicketUP30);
                                     
                        } catch (error) {
                            console.error(error);
                        }


                    } else if (descStatus == "EJECUCION") {
                        var respStatus4 = `Tu reloj está en proceso de ${descStatus}. 
Por ahora se encuentra en el “50%”. Te mantendremos informado`;
                        client.sendMessage(from, respStatus4);

                        const psClWs = "";                                                                                
                        const formData6 = new FormData();
                        formData6.append("telefono", `${telefonoWsSQL}`);                                                
                        formData6.append("posicion", `${psClWs}`); 
            
                        try {
                            const response = await axios.post(
                                urlGlobal + "ReferidosBack/cliente/clienteSetPosition.php",
                                formData6
                            );
                            
                            var respTicketUP50;

                            respTicketUP50 = response.data;            
                            console.log("--------------*respTicket_50% --------> ", respTicketUP50);
                                     
                        } catch (error) {
                            console.error(error);
                        }

                    } else if (descStatus == "FISICO" && descFechaEntrega != null ) {
                        var respStatus5 = `Tu reloj está en proceso de ${descStatus}. 
Por ahora se encuentra en el “90%”. Te mantendremos informado`;
                        client.sendMessage(from, respStatus5);

                        const psClWs = "";
                        const formData6 = new FormData();
                        formData6.append("telefono", `${telefonoWsSQL}`);
                        formData6.append("posicion", `${psClWs}`);

                        try {
                            const response = await axios.post(
                                urlGlobal + "ReferidosBack/cliente/clienteSetPosition.php",
                                formData6
                            );

                            var respTicketUP90;

                            respTicketUP90 = response.data;
                            console.log("--------------*respTicket_90% --------> ", respTicketUP90);

                        } catch (error) {
                            console.error(error);
                        }


                    } else if (descStatus == "ENTREGADO") {
                        var respStatus6 = `Tu reloj está en proceso de ${descStatus}. 
Por ahora se encuentra en el "100%". Te mantendremos informado`;
                        client.sendMessage(from, respStatus6);

                        const psClWs = "";                                                                                
                        const formData6 = new FormData();
                        formData6.append("telefono", `${telefonoWsSQL}`);                                                
                        formData6.append("posicion", `${psClWs}`); 
            
                        try {
                            const response = await axios.post(
                                urlGlobal + "ReferidosBack/cliente/clienteSetPosition.php",
                                formData6
                            );
                            
                            var respTicketUP100;

                            respTicketUP50 = response.data;            
                            console.log("--------------*respTicket_100% --------> ", respTicketUP100);
                                     
                        } catch (error) {
                            console.error(error);
                        }



                    } 
                    
                } else {
                    const message = `El número de folio enviado no es correcto`;
                    client.sendMessage(from, message);

                    const formDatax = new FormData();
                    formDatax.append("telefono", `${telefonoWsSQL}`);
                    formDatax.append("posicion", "0");

                    try {
                        const response = await axios.post(
                            urlGlobal + "ReferidosBack/cliente/clienteSetPosition.php",
                            formDatax
                        );

                        // const welcomeMessage = `¡Hola! Soy el asistente virtual de Attila Distribution Group. ¿Cómo te puedo ayudar? ${robotEmoji}`;
                        // client.sendMessage(from, welcomeMessage);
                        const menuListMessage = arrMenuList1.join("\n");
                        client.sendMessage(from, menuListMessage);

                    } catch (error) {
                        
                    }

                    //console.log("El cliente tiene posicion indefinida");
                }
            } catch (error) {
                console.error(error);
            }
        } else if (posicionTC == 2) {
            console.log("aqui2");
            const psClWs = "";
            const problema = msg.body;

            const maxDigits = 8; // 8 dígitos para representar los números consecutivos
            let ticketCounter = 1; // Inicializar el contador en 1

            // Función para formatear el número como una cadena con ceros a la izquierda
            function formatNumber(number, width) {
                const numStr = number.toString();
                const numZeros = width - numStr.length;
                if (numZeros > 0) {
                    return '0'.repeat(numZeros) + numStr;
                }
                return numStr;
            }
                        

            // Realizar una consulta para obtener el número más alto existente
            connection.execute('SELECT MAX(codigo_cliente) AS max_codigo FROM ticket WHERE tipo_creacion = "whatsapp"', async (error, results) => {
                if (error) {
                    console.error(error);
                } else {
                    const maxCodigo = results[0].max_codigo;
                    if (maxCodigo !== null) {
                        // Si hay un número máximo existente, incrementa el contador en uno
                        ticketCounter = parseInt(maxCodigo, 10) + 1;
                    }
                    // Obtener el número de ticket consecutivo como una cadena
                    const consecutiveTicket = formatNumber(ticketCounter, maxDigits);
                    console.log(consecutiveTicket);
                    codigo_generado = consecutiveTicket;
                    console.log("CODIGGOGOGOGOGOGOGOGGOGOGOGOGO", codigo_generado);

                    const formData6 = new FormData();
                    formData6.append("telefono", `${telefonoWsSQL}`);
                    formData6.append("codigo_cliente", consecutiveTicket); // Usar el número de ticket consecutivo
                    formData6.append("descripcion", `${problema}`);
                    formData6.append("posicion", `${psClWs}`);

                    try {
                        const response = await axios.post(
                            urlGlobal + "ReferidosBack/ticketCliente/regTicket.php",
                            formData6
                        );

                        respTicket = response.data;

                        console.log("--------------*respTicket --------> ", respTicket);

                        if (respTicket && respTicket.ticketRes) {                                                        

                            // ticketID = respTicket.ticketRes.codigo_cliente;

        var respuesta2_1 = `Tu número de Ticket es  ${consecutiveTicket}. 
Para brindarte una respuesta más precisa, necesitamos realizar una recepción de tu reloj.

- Ponemos a su disposición la opción de proporcionar una guía de envío con costo de $300.00, o puede llevar su reloj directamente a nuestras oficinas.

Nuestro horario de servicio es de lunes a viernes, de 9:30 a.m. a 1:30 p.m. y de 3:30 p.m. a 5:30 p.m., en nuestra oficina ubicada en Calle Goldsmith 63 3er piso, Col. Polanco V Sección, Miguel Hidalgo, 11560 CDMX.

- Para facilitar nuestra comunicación y garantizar que estés al tanto de nuestras últimas noticias, promociones y actualizaciones, nos gustaría contar con tu nombre y correo electrónico actualizado para nuestros registros.

Escribe tu correo electrónico:`;

                        const psClWs = "2.1";

                        const formData4 = new FormData();
                        formData4.append("telefono", `${telefonoWsSQL}`);
                        formData4.append("posicion", `${psClWs}`);

                        try {
                            const response = await axios.post(
                                urlGlobal + "ReferidosBack/cliente/clienteSetPosition.php",
                                formData4
                            );

                            clientePosicion = response.data;                            

                            if (clientePosicion.clienteRes.posicion !== undefined && clientePosicion.clienteRes.posicion !== "") {
                                // if (numFolio === null) {
                                //     var respuesta1_2 = `Por favor, cuéntanos cuál es el problema o la situación con la que estás lidiando actualmente.`;
                                //     client.sendMessage(from, respuesta1_2);
                                //     numFoli2o = "Here";
                                //     numFolio = "Yes";
                                // }                                
                                console.log("clientePosition --> ", clientePosicion.clienteRes.posicion);
                            } else {
                                console.log("El cliente tiene posicion indefinida");
                            }

                            console.log("Res telefonoWsSQL devueltos: ", clientePosicion);
                        } catch (error) {
                            console.error(error);
                        }

                    client.sendMessage(from, respuesta2_1);
                } else {
                    var respuesta2_3 = `Ups, ya tiene un ticket creado. Debe esperar que se termine el proceso.`;
                    client.sendMessage(from, respuesta2_3);
                    console.log("respTicket Else");
                }

                        // Incrementar el contador de tickets
                        ticketCounter++;
                    } catch (error) {
                        console.error(error);
                    }
                        
                }

            });

        }else if (posicionTC == 2.1){
            const correoRegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

            const psClWs = 2.2;
            correo = msg.body;
            console.log("reg", correo + " ------- " + codigo_generado);

            if (correoRegExp.test(correo)) {

                const formData5 = new FormData();
                formData5.append("telefono", `${telefonoWsSQL}`);
                formData5.append("codigo_cliente", `${codigo_generado}`);
                formData5.append("correo", `${correo.toLowerCase()}`);
                formData5.append("posicion", `${psClWs}`); 

                try {
                    const response = await axios.post(
                        urlGlobal + "ReferidosBack/cliente/agregarCorreo.php",
                        formData5
                    );

                    respStatus = response.data;

                    const mensajeCorreo = `Escribe tu nombre:`;
                    
                    client.sendMessage(from, mensajeCorreo);

                } catch (error) {
                    console.error(error);
                }

            } else {
                console.log("El correo electrónico no es válido.");
                const mensajeCorreo = `Correo electonico incorrecto, intente nuevamente. 

Escribe tu correo electrónico:`;                    
                client.sendMessage(from, mensajeCorreo);
            }

        }else if (posicionTC == 2.2){
                const psClWs = "";
                nombre = msg.body;
                console.log("reg", nombre + " ------- " + codigo_generado);
    
                const formData5 = new FormData();
                formData5.append("telefono", `${telefonoWsSQL}`);
                formData5.append("codigo_cliente", `${codigo_generado}`);
                formData5.append("nombre", `${nombre.toLowerCase()}`);
                formData5.append("posicion", `${psClWs}`); 
    
                try {
                    const response = await axios.post(
                        urlGlobal + "ReferidosBack/cliente/agregarNombre.php",
                        formData5
                    );
    
                    respStatus = response.data;

                    console.log("telefono registrado en la bd", respStatus)
    
                    const mensajeCorreo = `¡Agradecemos mucho tu confianza! Estaremos en contacto de manera constante para asegurarnos de brindarte el servicio de la más alta calidad.`;
                    
                    client.sendMessage(from, mensajeCorreo);
    
                } catch (error) {
                    console.error(error);
                }
    
            
        }else if (posicionTC == 4){
            const mensaje = msg.body;  

            if (mensaje !== '1' && mensaje !== '2') {
                const mensajeCorreo = `La opción que has proporciona es incorrecta, debes seleccionar entre las opciones previamente indicadas. 

¿Deseas proceder con la reparación?
1.- Sí
2.- No`;                    
                client.sendMessage(from, mensajeCorreo);
                return;
            }           
 
            ejecucionSugerencia = {};                        
            if(mensaje == 1){      
                
                console.log("yeysysysysyysyysysyssysyssysysysysysysy",codigo_cliente_node);

                console.log("hola", mensaje);

                //SUGERENCIA, MONTO SUGERENCIA, TIEMPO ESTIMADO
                const formData2 = new FormData();                
                formData2.append("telefono", `${telefonoWsSQL}`);                        

                try {
                    const response = await axios.post(urlGlobal + "ReferidosBack/cliente/detalleSugerencia.php",formData2);                                                                              
                    ejecucion = response.data;                    
                    if (ejecucion && ejecucion.clienteRes) {

                        ejecucionSugerencia = ejecucion.clienteRes;
                        console.log("******************** EJECUCION ******************* ", ejecucionSugerencia);

                    } else {

                        console.log("El cliente tiene posicion indefinida Cotizacion");

                    }

                } catch (error) {
                    console.error(error);
                }



                if (ejecucionSugerencia.sugerencia && ejecucionSugerencia.costo_sugerencia && ejecucionSugerencia.fecha_sugerencia) {
                                                        
                    const formData1 = new FormData();
                    const psClWs = 5;
                    const coti = 'EJECUCION';
                    formData1.append("telefono", `${telefonoWsSQL}`);        
                    formData1.append("posicion", `${psClWs}`); 
                    formData1.append("cotizacion", `${coti}`);
                    formData1.append("codigo_cliente", `${codigo_cliente_node}`);  
                    
                    const sugerencia = ejecucionSugerencia.sugerencia;
                    const costo_sugerencia = ejecucionSugerencia.costo_sugerencia;
                    const fecha_sugerencia = ejecucionSugerencia.fecha_sugerencia;

                    const duracionEstimada = calcularDuracion(fecha_sugerencia);

                    try {
                        const response = await axios.post(urlGlobal + "ReferidosBack/cliente/ticketSetEstatus.php",formData1);                    

                        const mensajeIf1 = `Dentro del análisis que se realizó, se identificaron los siguientes opcionales: "${sugerencia}".

Por lo anterior el costo adicional de trabajo sería de “$${costo_sugerencia}” y el tiempo estimado aproximado extra es de  “${duracionEstimada}”.

¿Deseas aplicar los adicionales?

1.- Sí
2.- No`;

                        client.sendMessage(from, mensajeIf1);

                        // console.log("respuesta response) ////////////////////////////", response.data);

                        arrayCoti = response.data;
                        // console.log("--------------*Cotizacion --------> ", arrayCoti);
                        if (arrayCoti && arrayCoti.clienteRes) {

                            clienteStatus = arrayCoti.clienteRes;
                            // console.log("--------------*clienteStatus - Cotizacion --------> ",clienteStatus);

                        } else {
                            console.log("El cliente tiene posicion indefinida Cotizacion");
                        }

                    } catch (error) {
                        console.error(error);
                    } 

                } else {

                    const formData1 = new FormData();
                    const psClWs = 5.1;
                    const coti = 'EJECUCION';
                    formData1.append("telefono", `${telefonoWsSQL}`);        
                    formData1.append("posicion", `${psClWs}`); 
                    formData1.append("cotizacion", `${coti}`); 
                    formData1.append("codigo_cliente", `${codigo_cliente_node}`);                           
    
    
                    try {
                        const response = await axios.post(
                        urlGlobal + "ReferidosBack/cliente/ticketSetEstatus.php",
                        formData1
                        );
    
                        //ENVIAR  WHATSAT 
    
                        const mensajeIf1 = `Nos complace informarte que tu reloj será reparado por nuestros técnicos expertos. Una vez finalizada la reparación, te indicaremos por este medio. Nos gustaría saber si prefieres recoger el artículo en persona o si prefieres que te lo entreguemos directamente en tu domicilio. Ten en cuenta que la entrega a domicilio implicará un cargo adicional de $300. Queremos asegurarnos de brindarte la opción más conveniente para ti.
1.- En persona.
2.- Domicilio.`;
    
                        client.sendMessage(from, mensajeIf1);
    
                        console.log("respuesta response) ////////////////////////////", response.data);
    
                        arrayCoti = response.data;
                        console.log("--------------*Cotizacion --------> ", arrayCoti);
                        if (arrayCoti && arrayCoti.clienteRes) {
                        clienteStatus = arrayCoti.clienteRes;
                        console.log(
                            "--------------*clienteStatus - Cotizacion --------> ",
                            clienteStatus
                        );
    
                        } else {
                        console.log("El cliente tiene posicion indefinida Cotizacion");
                        }
    
                    } catch (error) {
                        console.error(error);
                    }

                }
                                

            } else if(mensaje == 2){ 
                console.log("MSG#2: ",mensaje);

                const psClWs = 5.2;

                const formData11 = new FormData();

                const coti2 = 'CANCELADO';

                formData11.append("telefono", `${telefonoWsSQL}`);        
                formData11.append("posicion", `${psClWs}`);  
                formData11.append("cotizacion", `${coti2}`);   
                formData11.append("codigo_cliente", `${codigo_cliente_node}`);                       
                
                try {
                    const response = await axios.post(
                    urlGlobal + "ReferidosBack/cliente/ticketSetEstatus.php",
                    formData11
                    );

                    //ENVIAR  WHATSAT 

                    const mensajeIf2 = `Nos gustaría saber si prefieres recoger tu artículo en persona o si prefieres que te lo entreguemos directamente en tu domicilio. Ten en cuenta que la entrega a domicilio implicará un cargo de $300. Queremos asegurarnos de brindarte la opción más conveniente para ti.
1.- En persona.
2.- Domicilio.`; 
                     
                    client.sendMessage(from, mensajeIf2);

                    console.log("respuesta response2) ////////////////////////////", response.data);

                    arrayCoti = response.data;
                    console.log("--------------*Cotizacion --------> ", arrayCoti);
                    if (arrayCoti && arrayCoti.clienteRes) {
                    clienteStatus = arrayCoti.clienteRes;
                    console.log(
                        "--------------*clienteStatus - Cotizacion --------> ",
                        clienteStatus
                    );

                    } else {
                    console.log("El cliente tiene posicion indefinida Cotizacion");
                    }

                } catch (error) {
                    console.error(error);
                }

            }

        }else if (posicionTC == 5){

            const mensaje = msg.body;

            if (mensaje !== '1' && mensaje !== '2') {
                const msj = `La opción que has proporciona es incorrecta, debes seleccionar entre las opciones previamente indicadas. 

¿Deseas proceder con los adicionales?
1.- Sí
2.- No`;                    
                client.sendMessage(from, msj);

                return;
            }       
 
            clienteStatus = {};            
            console.log("Aquí nuevo mensaje##");
            if(mensaje == 1){
                console.log("MSG#1: ",mensaje);
                
                const formData1 = new FormData();
                const psClWs = 5.1;
                const coti = 'COTIZACION';
                formData1.append("telefono", `${telefonoWsSQL}`);        
                formData1.append("posicion", `${psClWs}`); 
                formData1.append("cotizacion", `${coti}`);   
                formData1.append("codigo_cliente", `${codigo_cliente_node}`);                         


                try {
                    const response = await axios.post(
                    urlGlobal + "ReferidosBack/cliente/ticketSetEstatus.php",
                    formData1
                    );

                    //ENVIAR  WHATSAT 

                    const mensajeIf1 = `Nos complace informarte que tu reloj será reparado por nuestros técnicos expertos. Una vez finalizada la reparación, te indicaremos por este medio. Nos gustaría saber si prefieres recoger el artículo en persona o si prefieres que te lo entreguemos directamente en tu domicilio. Ten en cuenta que la entrega a domicilio implicará un cargo adicional de $300. Queremos asegurarnos de brindarte la opción más conveniente para ti.
1.- En persona.
2.- Domicilio.`;

                    client.sendMessage(from, mensajeIf1);

                    console.log("respuesta response) ////////////////////////////", response.data);

                    arrayCoti = response.data;
                    console.log("--------------*Cotizacion --------> ", arrayCoti);
                    if (arrayCoti && arrayCoti.clienteRes) {
                    clienteStatus = arrayCoti.clienteRes;
                    console.log(
                        "--------------*clienteStatus - Cotizacion --------> ",
                        clienteStatus
                    );

                    } else {
                    console.log("El cliente tiene posicion indefinida Cotizacion");
                    }



                    // SUGERENCIA
                    // ejecucionSugerencia = {};   
                    const sugerencia = 'Con sugerencia';
                    const formDataSugerencia = new FormData();                
                    formDataSugerencia.append("telefono", `${telefonoWsSQL}`);
                    formDataSugerencia.append("sugerencia", `${sugerencia}`);                        
    
                    try {
                        const response = await axios.post(urlGlobal + "ReferidosBack/cliente/sugerencia.php",formDataSugerencia);
                        ConSugerencia = response.data;                    
                        if (ConSugerencia && ConSugerencia.clienteRes) {
    
                            ConSugerencia.clienteRes;
                            console.log("******************** Con Sugerencia ******************* ");
    
                        } else {
    
                            console.log("El cliente tiene posicion indefinida Cotizacion");
    
                        }
    
                    } catch (error) {
                        console.error(error);
                    }


                } catch (error) {
                    console.error(error);
                }
            } else if(mensaje == 2){ 
                console.log("MSG#2 AQUIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII: ",mensaje);

                const psClWs = 5.2;

                const formData11 = new FormData();

                const coti2 = 'EJECUCION';

                formData11.append("telefono", `${telefonoWsSQL}`);        
                formData11.append("posicion", `${psClWs}`);  
                formData11.append("cotizacion", `${coti2}`);                          
                formData11.append("codigo_cliente", `${codigo_cliente_node}`);

                try {
                    const response = await axios.post(
                    urlGlobal + "ReferidosBack/cliente/ticketSetEstatus.php",
                    formData11
                    );

                    //ENVIAR  WHATSAT 

                    const mensajeIf2 = `Nos gustaría saber si prefieres recoger tu artículo en persona o si prefieres que te lo entreguemos directamente en tu domicilio. Ten en cuenta que la entrega a domicilio implicará un cargo de $300. Queremos asegurarnos de brindarte la opción más conveniente para ti.
1.- En persona.
2.- Domicilio.`;
                     
                    client.sendMessage(from, mensajeIf2);

                    console.log("respuesta response2) ////////////////////////////", response.data);

                    arrayCoti = response.data;
                    console.log("--------------*Cotizacion --------> ", arrayCoti);
                    if (arrayCoti && arrayCoti.clienteRes) {
                    clienteStatus = arrayCoti.clienteRes;
                    console.log(
                        "--------------*clienteStatus - Cotizacion --------> ",
                        clienteStatus
                    );

                    } else {
                    console.log("El cliente tiene posicion indefinida Cotizacion");
                    }


                    // SUGERENCIA
                    // ejecucionSugerencia = {};   
                    const sugerencia = 'Sin sugerencia';
                    const formDataSugerencia = new FormData();                
                    formDataSugerencia.append("telefono", `${telefonoWsSQL}`);
                    formDataSugerencia.append("sugerencia", `${sugerencia}`);                        
    
                    try {
                        const response = await axios.post(urlGlobal + "ReferidosBack/cliente/sugerencia.php",formDataSugerencia);
                        SinSugerencia = response.data;                    
                        if (SinSugerencia && SinSugerencia.clienteRes) {
    
                            SinSugerencia.clienteRes;
                            console.log("******************** Sin Sugerencia ******************* ");
    
                        } else {
    
                            console.log("El cliente tiene posicion indefinida Cotizacion");
    
                        }
    
                    } catch (error) {
                        console.error(error);
                    }


                } catch (error) {
                    console.error(error);
                }

            }


        }else if (posicionTC == 5.1){

            const entrega = msg.body;

            if (entrega !== '1' && entrega !== '2') {
                const msj = `La opción que has proporciona es incorrecta, debes seleccionar entre las opciones previamente indicadas. 

1.- En persona.
2.- Domicilio.`;                    
                client.sendMessage(from, msj);

                return;
            }           
            
            console.log("Usted ha seleccionado ->",entrega);



            const formData5 = new FormData();
            formData5.append("telefono", `${telefonoWsSQL}`);            
            formData5.append("entrega", `${entrega}`); 
            formData5.append("codigo_cliente", `${codigo_cliente_node}`); 

            try {
                const response = await axios.post(
                    urlGlobal + "ReferidosBack/cliente/entrega.php",
                    formData5
                );

                respStatus = response.data;
                console.log(respStatus)

                // const mensajeCorreo = `¡Agradecemos mucho tu confianza! Estaremos en contacto de manera constante para asegurarnos de brindarte el servicio de la más alta calidad.`;
                
                // client.sendMessage(from, mensajeCorreo);

            } catch (error) {
                console.error(error);
            }


            // URLGLOBAL

            const mensajeTNKScoti = `Te mantendremos informado(a) sobre su estado. ¡Gracias por tu confianza!`;

            // Te mantendremos informado(a) sobre su estado. ¡Gracias por tu confianza!
            // Valoramos enormemente tu opinión, por eso nos encantaría que llenaras la siguiente encuesta de satisfacción.
            // http://187.188.105.205:8082/encuesta
            // Tu feedback es fundamental para nosotros, ya que nos ayuda a mejorar continuamente nuestra calidad de servicio. Agradecemos tu tiempo y tus comentarios, y te aseguramos que tomaremos en cuenta cada sugerencia para brindarte una experiencia aún mejor en el futuro. ¡Gracias por elegirnos y por contribuir a nuestro crecimiento!

            client.sendMessage(from, mensajeTNKScoti);

            const psClWs = "";
            const formData6 = new FormData();
            formData6.append("telefono", `${telefonoWsSQL}`);
            formData6.append("posicion", `${psClWs}`);

            try {
                const response = await axios.post(
                    urlGlobal + "ReferidosBack/cliente/clienteSetPosition2.php",
                    formData6
                );

                var respTicketUP20;

                respTicketUP20 = response.data;
                console.log("--------------*mensajeTNKScoti --------> ", respTicketUP20);

            } catch (error) {
                console.error(error);
            }


        }else if (posicionTC == 5.2){

            const entrega = msg.body;

            if (entrega !== '1' && entrega !== '2') {
                const msj = `La opción que has proporciona es incorrecta, debes seleccionar entre las opciones previamente indicadas. 

1.- En persona.
2.- Domicilio.`;                    
                client.sendMessage(from, msj);

                return;
            }           
            
            console.log("Usted ha seleccionado ->",entrega);

            
            const formData5 = new FormData();
            formData5.append("telefono", `${telefonoWsSQL}`);            
            formData5.append("entrega", `${entrega}`); 
            formData5.append("codigo_cliente", `${codigo_cliente_node}`); 

            try {
                const response = await axios.post(
                    urlGlobal + "ReferidosBack/cliente/entrega.php",
                    formData5
                );

                respStatus = response.data;
                console.log(respStatus)

                // const mensajeCorreo = `¡Agradecemos mucho tu confianza! Estaremos en contacto de manera constante para asegurarnos de brindarte el servicio de la más alta calidad.`;
                
                // client.sendMessage(from, mensajeCorreo);

            } catch (error) {
                console.error(error);
            }


            // URLGLOBAL

            const mensajeTNKScoti2 = `En breve, te proporcionaremos los detalles necesarios para llevar a cabo la entrega de tu artículo. Te pedimos un poco de paciencia mientras coordinamos los últimos detalles para asegurarnos de que el proceso de entrega sea lo más eficiente y conveniente para ti.
            
Valoramos enormemente tu opinión, por eso nos encantaría que llenaras la siguiente encuesta de satisfacción.

http://187.188.105.205:8082/encuesta

Tu feedback es fundamental para nosotros, ya que nos ayuda a mejorar continuamente nuestra calidad de servicio. Agradecemos tu tiempo y tus comentarios, y te aseguramos que tomaremos en cuenta cada sugerencia para brindarte una experiencia aún mejor en el futuro. ¡Gracias por elegirnos y por contribuir a nuestro crecimiento!`;

            client.sendMessage(from, mensajeTNKScoti2);

            const psClWs = "";
            const formData6 = new FormData();
            formData6.append("telefono", `${telefonoWsSQL}`);
            formData6.append("posicion", `${psClWs}`);

            try {
                const response = await axios.post(
                    urlGlobal + "ReferidosBack/cliente/clienteSetPosition2.php",
                    formData6
                );

                var respTicketUP20;

                respTicketUP20 = response.data;
                console.log("--------------*mensajeTNKScoti2 --------> ", respTicketUP20);

            } catch (error) {
                console.error(error);
            }


        }

        // POSICION DEL CLIENTE INICIO
        if (positionCws !== undefined && positionCws !== "") {
            if (positionCws == 1) {
                const psClWs = 1;

                const formData3 = new FormData();
                formData3.append("telefono", `${telefonoWsSQL}`);
                formData3.append("posicion", `${psClWs}`);

                try {
                    const response = await axios.post(
                        urlGlobal + "ReferidosBack/cliente/clienteSetPosition.php",
                        formData3
                    );

                    arrayP1 = response.data;

                    let numFolio = null;
                    var numFoli2o = null;

                    if (arrayP1.clienteRes.posicion !== undefined && arrayP1.clienteRes.posicion !== "") {

                        if (numFolio === null) {
                            var respuesta1 = `Ingresa tu número de orden o folio.
Recuerda que si proviene de alguna de estas tiendas coloques la siguiente letra antes número de orden o folio:
L – Liverpool (ej: L123456)
P – Palacio de Hierro (ej: P123456)
`;
                            client.sendMessage(from, respuesta1);
                            numFoli2o = "Here";
                            numFolio = "Yes";
                        }

                        msg.body = "";

                        console.log("-----------------------------------");
                        console.log("clientePosition --> ", arrayP1.clienteRes.posicion);


                    } else {
                        

                        console.log("El cliente tiene posicion indefinida");
                    }

                    console.log("Res telefonoWsSQL devueltos: ", arrayP1);
                } catch (error) {
                    console.error(error);
                }
            } else if (positionCws == 2) {
                const psClWs = "2";

                const formData4 = new FormData();
                formData4.append("telefono", `${telefonoWsSQL}`);
                formData4.append("posicion", `${psClWs}`);

                try {
                    const response = await axios.post(
                        urlGlobal + "ReferidosBack/cliente/clienteSetPosition.php",
                        formData4
                    );

                    arrayP2 = response.data;

                    let numFolio = null;
                    var numFoli2o = null;

                    if (arrayP2.clienteRes.posicion !== undefined && arrayP2.clienteRes.posicion !== "") 
                    {
                        if (numFolio === null) {
                            var respuesta1_2 = `Por favor, cuéntanos cuál es el problema o la situación con la que estás lidiando actualmente.`;
                            client.sendMessage(from, respuesta1_2);
                            numFoli2o = "Here";
                            numFolio = "Yes";
                        }

                        // msg.body = "";

                        console.log(
                            "-------------------------------------------------------------------------------"
                        );

                        console.log("clientePosition --> ", arrayP2.clienteRes.posicion);
                    } else {
                        console.log("El cliente tiene posicion indefinida");
                    }

                    console.log("Res telefonoWsSQL devueltos: ", arrayP2);
                } catch (error) {
                    console.error(error);
                }
            } else if (positionCws == 3) {
                const psClWs = "";

                const formData4 = new FormData();
                formData4.append("telefono", `${telefonoWsSQL}`);
                formData4.append("posicion", `${psClWs}`);

                try {
                    const response = await axios.post(
                        urlGlobal + "ReferidosBack/cliente/clienteSetPosition.php",
                        formData4
                    );

                    arrayP3 = response.data;

                    let numFolio3 = null;

                    // if (
                    //     arrayP3.clienteRes.posicion !== undefined &&
                    //     arrayP3.clienteRes.posicion !== ""
                    // ) {
                        if (arrayP3.clienteRes.posicion === "") {
                            var respuesta1_3 = `Por favor, para darte un mejor servicio, te pedimos mandar una foto del frente y reverso de tu reloj donde sea visible el modelo y número de serie a los siguientes correos: iortiz@attilamexico.com  y salfaro@attilamexico.com
                            
En breve te haremos llegar la información. 

¡Muchas gracias por tu preferencia! Te invitamos a visitar nuestra página web y a seguirnos en nuestras redes sociales.

https://www.attila.com.mx/
https://www.instagram.com/attilamexico
https://mx.worldofbomberg.com/
https://www.instagram.com/bombergmexico`;
                            client.sendMessage(from, respuesta1_3);
                            numFolio3 = "Yes";
                        }

                        msg.body = "";

                        console.log(
                            "-------------------------------------------------------------------------------"
                        );

                        console.log("clientePosition --> ", arrayP3.clienteRes.posicion);
                    // } else {
                    //     console.log("El cliente tiene posicion indefinida");
                    // }

                    console.log("Res telefonoWsSQL devueltos: ", arrayP3);
                } catch (error) {
                    console.error(error);
                }
            }

        }
        // POSICION DEL CLIENTE INICIO


    }

    const hoy = new Date();
});

app.use("/sendWS/", async (req, res) => {

    
    const { destino, mensaje } = req.body;    
    
    let chatId = destino.substring(1) + "@c.us";
    await client.sendMessage(chatId, mensaje + "\n");

    var response = { result: true };
    return res.json(response);
});

/*----------------------------> [ API Mensaje Cotización ] http://localhost:3010/sendWS <----------------------------*/
app.post("/enviarWsCotiza/", async (req, res) => {
    console.log("asaasasasas");
    const { destino, mensaje } = req.body;
    console.log("aquiApi " + destino + " " + mensaje);    

    let chatId = destino.substring(1) + "@c.us";
    await client.sendMessage(chatId, mensaje + "\n");

    var response = { result: true };
    return res.json(response);
});

// ---------------------------- FUNCIONES, PETICIONES, CONSULTAS ----------------------------

// --------------------------------------------------------------------------------------------------

client.on("change_state", (state) => {
    console.log("CHANGE STATE", state);
});

client.on("disconnected", (reason) => {
    console.log("Client was logged out", reason);
});
