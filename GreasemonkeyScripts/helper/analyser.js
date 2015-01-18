// ==UserScript==
// @name AG-Spiel.de Analyser
// @namespace http://notforu.com
// @version 0.0.1
// @description adds some useful things to AG-Spiel.de
// @match http://www.ag-spiel.de/*
// @copyright 2014+, Tr0nYx
// @downloadURL https://raw.githubusercontent.com/Tr0nYx/AGSpiel/master/GreasemonkeyScripts/helper/analyser.js
// @updateUrl https://raw.githubusercontent.com/Tr0nYx/AGSpiel/master/GreasemonkeyScripts/helper/analyser.js
// @require http://code.jquery.com/jquery-latest.js
// ==/UserScript==
(function () {
    var AG_mainFunction = function () {
        function init() {
            addMenuEntry();
        }

        function addMenuEntry(){
            $('div#nav').children('ul').children('li').first().children('ul').append('<li><a href="#" class="analyzer">Analyser</a>');
            $('a.analyzer').on('click',function(){
                openAnalyzer();
            });
            
        }
        
        function openAnalyzer(){

        }
        function createTweak() {
            var AGDSversion = "0.0.1";
            init();
        }

        function AG_checkIfLoaded() {
            var docstate = document.readyState;
            try {
                if (docstate !== undefined) {
                    if (docstate == "complete") {
                        createTweak();
                    } else {
                        window.setTimeout(AG_checkIfLoaded, 1000);
                    }
                } else {
                    window.setTimeout(AG_checkIfLoaded, 1000);
                }
            } catch (e) {
                if (typeof console != 'undefined') {
                    console.log(e);
                }
                else {
                    if (window.opera) {
                        opera.postError(e);
                    }
                }
            }
        }

        if (/ag-spiel\.de/i.test(document.domain)) {
            window.setTimeout(AG_checkIfLoaded, 1000);
        }

    };

    var agTweakScript = document.createElement("script");
    txt = AG_mainFunction.toString();
    agTweakScript.innerHTML = "(" + txt + ")();";
    agTweakScript.type = "text/javascript";
    if (/ag-spiel\.de/i.test(document.domain)) {
        document.getElementsByTagName("head")[0].appendChild(agTweakScript);
    }
})();