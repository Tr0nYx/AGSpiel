// ==UserScript==
// @name AG-Spiel.de Dark Skin
// @namespace http://notforu.com
// @version 0.0.1
// @description changes skin
// @match http://www.ag-spiel.de/*
// @copyright 2014+, Tr0nYx
// @downloadURL https://raw.githubusercontent.com/Tr0nYx/AGSpiel/master/GreasemonkeyScripts/skins/dark/agdarkskin.js
// @updateUrl https://raw.githubusercontent.com/Tr0nYx/AGSpiel/master/GreasemonkeyScripts/skins/dark/agdarkskin.js
// @require http://code.jquery.com/jquery-latest.js
// ==/UserScript==

(function () {
    var AG_mainFunction = function () {
        function init() {
            removeGlobalStyle();
            addGlobalStyle();
            addGlobalJavascript();
            changeHtml();
            if (/\bsection=profil\b/.test(location.search)) {
                profilChanges();
            }
        }
        
        function changeHtml(){
            $('#main').addClass('container').removeAttr('id');
            $('#contentside').removeAttr('id');
            $('#content').addClass('col-sm-9').removeAttr('id');
            $('#sidebar').addClass('col-sm-3 col-xs-hidden');
            $('div#nav').children('ul').children('li').addClass('dropdown');
            $('div#nav').children('ul').children('li').children('a').addClass('dropdown-toggle').attr('data-toggle','dropdown').attr('role','button').append('<span class="caret"></span>');
            $('div#nav').children('ul').children('li').children('ul').addClass('dropdown-menu');
            $('div#nav').children('ul').addClass('nav').addClass('navbar-nav');
            $('div#nav').wrap('<div class="container"/>');
            $('div#nav').replaceWith($('<div id="navbar" class="navbar-collapse collapse"/>').html($('div#nav').html()));
            $('div#menu').replaceWith($('<nav class="navbar navbar-default navbar-fixed-top"/>').html($('div#menu').html()));
            $('#onlinelist').hide();
        }
        
        function profilChanges(){
            $('#logospacer, #ribbon, #highscore').wrapAll('<div class="row">');
            $('#kurs, #person').wrapAll('<div class="row">');
            $('#kurs').addClass('col-xs-6').removeAttr('id').wrapInner('<div class="panel panel-default"/>');
            $('#heading').addClass('panel-heading').removeAttr('id');
            $('#kursboxen').children('div').each(function(){
                $(this).wrapInner($('<div class="well well-sm"/>'));
                $(this).addClass('col-xs-4').removeAttr('id');
                
            })
            $('#kursboxen').addClass('panel-body').removeAttr('id');
            $('#logospacer').addClass('col-xs-6');
            $('#ribbon').addClass('col-xs-3');
            $('#highscore').addClass('col-xs-3');
            $('.profilchartbox').addClass('col-sm-4');

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

        function removeGlobalStyle(){
            for( i = 0; (l = document.getElementsByTagName("link")[i]); i++ ) {
                if( l.getAttribute("rel").indexOf("style") >= 0 ) l.disabled = true;
            }
        }

        function addGlobalStyle() {
            var link = window.document.createElement('link');
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = '//maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css';
            document.getElementsByTagName("HEAD")[0].appendChild(link);
        }

        function addGlobalJavascript() {
            var link = window.document.createElement('link');
            link.rel = 'javascript';
            link.type = 'text/javascript';
            link.href = '//maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js';
            document.getElementsByTagName("HEAD")[0].appendChild(link);
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