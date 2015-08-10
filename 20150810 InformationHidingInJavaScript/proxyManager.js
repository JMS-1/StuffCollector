"use strict";

// Eine Verwaltung dynamisch erzeugter Kapselungen.
var ProxyManager = function () {

    // Instanzen dieser Klasse werden nicht erzeugt
    function ProxyManager() {
        throw "can not instantiate ProxyManager - use only static methods";
    };

    // Die Verwaltung aller aktiven Kapselungen
    var map = {};

    // Erstellt eine Erzeugungsmethode für ein bestimmte Kapselung
    ProxyManager.registerProxyType = function () {
        // Der erste Parameter ist eine Klasse, zu der eine Kapselung erstellt werden soll
        var args = arguments;
        var type = args[0];

        // Die individuelle Kapselung
        var Proxy = function () {
            function Proxy(index) {
                // Die laufende Nummer der aktiven Kapselung
                this.index = index;
            };

            // Alle weiteren Parameter von registerProxyType sind die Namen der Methoden, die über die Kapselung verfügbar gemacht werden
            for (var i = 1; i < args.length; i++) {
                // Die gewünschte Methode in der konkreten Klasse ermitteln
                var name = args[i];
                var fn = type.prototype[name];
                if (fn === undefined)
                    throw "no method " + name;

                // Eine gleichnamige Methode in der Kapselung anlegen
                Proxy.prototype[name] = function () {
                    // Zur aktiven Kapselung die zugehörige Instanz der konkreten Klasse ermitteln
                    var instance = map[this.index];
                    if (instance === undefined)
                        throw "proxy already disconnected";

                    // Den Funktionsaufruf unverändert an diese Instanz durchreichen
                    return fn.apply(instance, arguments);
                }
            }

            return Proxy;
        }();

        // Erzeugungsmethode für die gewünschte Art von Kapselung
        return function (index) {
            return new Proxy(index);
        };
    };

    // Die laufende Nummer der nächsten aktiven Kapselung
    var index = 0;

    // Erstellt zu einer konkreten Instanz eine neue aktive Kapselung
    ProxyManager.createProxy = function (instance, factory) {
        if (instance === null)
            return null;
        if (instance === undefined)
            return undefined;

        // Kapselung mit einer neuen laufenden Nummer erstellen
        var proxy = factory(index++);

        // Kapselung mit der konkreten Instanz verbinden
        map[proxy.index] = instance;

        return proxy;
    };

    // Deaktiviert eine Kapselung
    ProxyManager.deleteProxy = function (proxy) {
        delete map[proxy.index];
    };

    return ProxyManager;
}();
