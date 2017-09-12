'use strict';
const aplicacion = 
{
    elemento:
    {
        latitud: undefined,
        longitud: undefined,
        mapa: undefined,
        miUbicacion: undefined,
        cajaTextoOrigen: undefined,
        cajaTextoDestino: undefined,
        servicioDirecciones: undefined,
        representacionDirecciones: undefined,
        marcadorAutomatico: undefined,
        detalleUbicacionAutomatico: undefined
    },
    
    inicio: function()
    {
        aplicacion.elemento.mapa = new google.maps.Map(document.getElementById("mapa"),
        {
            zoom: 5,
            center: {lat: -9.1191427, lng: -77.0349046},
            mapTypeControl: false,
            zoomControl: false,
            streetViewControl: false
        });
        aplicacion.elemento.cajaTextoOrigen = document.getElementById('origen');
        aplicacion.elemento.cajaTextoDestino = document.getElementById('destino');
        aplicacion.autoCompletarCajaTexto(aplicacion.elemento.cajaTextoOrigen);
        aplicacion.autoCompletarCajaTexto(aplicacion.elemento.cajaTextoDestino);
        aplicacion.elemento.servicioDirecciones = new google.maps.DirectionsService;
        aplicacion.elemento.representacionDirecciones = new google.maps.DirectionsRenderer;
        aplicacion.elemento.marcadorAutomatico = aplicacion.crearMarcador(aplicacion.elemento.mapa);
        aplicacion.elemento.detalleUbicacionAutomatico = new google.maps.InfoWindow();
        aplicacion.establecer();
    },
    
    establecer: function()
    {
        document.getElementById('btnEncuentrame').addEventListener("click", aplicacion.buscar);
        document.getElementById("ruta").addEventListener("click", function()
        {
            aplicacion.dibujarRuta(aplicacion.elemento.servicioDirecciones, aplicacion.elemento.representacionDirecciones)
        });
        aplicacion.elemento.representacionDirecciones.setMap(aplicacion.elemento.mapa);
    },
    
    autoCompletarCajaTexto: function(cajaTexto)
    {
        let autocompletar = new google.maps.places.Autocomplete(cajaTexto);
        autocompletar.bindTo('bounds', aplicacion.elemento.mapa);
        let detalleUbicacion = new google.maps.InfoWindow();
        let marcador = aplicacion.crearMarcador(aplicacion.elemento.mapa);
        aplicacion.crearEvento(autocompletar, detalleUbicacion, marcador);
    },
    
    crearMarcador: function(mapa) 
    {
        var icono = 
        {
            url: 'http://icons.iconarchive.com/icons/sonya/swarm/128/Bike-icon.png',
            size: new google.maps.Size(71, 71),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(35, 35)
        };
        let marcador = new google.maps.Marker({
            map: aplicacion.elemento.mapa,
            animation: google.maps.Animation.DROP,
            icon: icono,
            anchorPoint: new google.maps.Point(0, -29)
        });
        return marcador;
    },
    
    crearEvento: function(autocompletar, detalleUbicacion, marcador) 
    {
        autocompletar.addListener('place_changed', function() 
        {
            detalleUbicacion.close();
            marcador.setVisible(false);
            aplicacion.elemento.detalleUbicacionAutomatico.close();
            aplicacion.elemento.marcadorAutomatico.setVisible(false);
            let lugar = autocompletar.getPlace();
            aplicacion.marcarUbicacion(lugar, detalleUbicacion, marcador);
        });
    },
    
    marcarUbicacion: function(lugar, detalleUbicacion, marcador) 
    {
        if (!lugar.geometry) 
        {
            // Error si no encuentra el lugar indicado
            window.alert("No encontramos el lugar que indicaste: '" + lugar.name + "'");
            return;
        }
        // Si el lugar tiene una geometría, entonces presentarlo en un mapa.
        if (lugar.geometry.viewport) 
        {
            aplicacion.elemento.mapa.fitBounds(lugar.geometry.viewport);
        } 
        else 
        {
            aplicacion.elemento.mapa.setCenter(lugar.geometry.location);
            aplicacion.elemento.mapa.setZoom(17);
        }

        marcador.setPosition(lugar.geometry.location);
        marcador.setVisible(true);

        let direccion = '';
        if (lugar.address_components) 
        {
            direccion = [
                (lugar.address_components[0] && lugar.address_components[0].short_name || ''),
                (lugar.address_components[1] && lugar.address_components[1].short_name || ''),
                (lugar.address_components[2] && lugar.address_components[2].short_name || '')
            ].join(' ');
        }

        detalleUbicacion.setContent('<div><strong>' + lugar.name + '</strong><br>' + direccion);
        detalleUbicacion.open(aplicacion.elemento.mapa, marcador);
    },
    
    buscar: function()
    {
        if(navigator.geolocation)
        {
            navigator.geolocation.getCurrentPosition(aplicacion.marcarUbicacionAutomatica, aplicacion.funcionError);
        }
    },
    
    marcarUbicacionAutomatica: function(posicion)
    {
        aplicacion.elemento.detalleUbicacionAutomatico.close();
        aplicacion.elemento.marcadorAutomatico.setVisible(false);
        aplicacion.elemento.latitud = posicion.coords.latitude;
        aplicacion.elemento.longitud = posicion.coords.longitude;
        
        aplicacion.elemento.marcadorAutomatico.setPosition({lat: aplicacion.elemento.latitud, lng: aplicacion.elemento.longitud});
        aplicacion.elemento.marcadorAutomatico.setVisible(true);
        
        aplicacion.elemento.mapa.setZoom(17);
        aplicacion.elemento.mapa.setCenter({lat: aplicacion.elemento.latitud, lng: aplicacion.elemento.longitud});
        
        aplicacion.elemento.detalleUbicacionAutomatico.setContent('<div><strong>Mi ubicación actual</strong><br>');
        aplicacion.elemento.detalleUbicacionAutomatico.open(aplicacion.elemento.mapa, aplicacion.elemento.marcadorAutomatico);
    },
    
    funcionError: function(error)
    {
        alert("Tenemos un problema con encontrar tu ubicación");
    },
        
    dibujarRuta: function(servicioDirecciones, representacionDirecciones) 
    {
        let origen = document.getElementById("origen").value;
        let destino = document.getElementById('destino').value;
        if(destino != "" && destino != "") 
        {
            servicioDirecciones.route({
                origin: origen,
                destination: destino,
                travelMode: "DRIVING"
            },
            function(respuesta, estado) 
            {
                if (estado === "OK") 
                {
                    representacionDirecciones.setDirections(respuesta);
                } 
                else
                {
                    aplicacion.funcionErrorRuta();
                }
            });
        }
    },
        
    funcionErrorRuta: function()
    {
        alert("No ingresaste un origen y un destino validos");
    }
        
}

function initMap() 
{
    aplicacion.inicio();
}