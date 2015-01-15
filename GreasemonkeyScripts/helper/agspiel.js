// ==UserScript==
// @name AG-Spiel.de Helper
// @namespace http://notforu.com
// @version 0.0.1
// @description adds some useful things to AG-Spiel.de
// @match http://www.ag-spiel.de/*
// @copyright 2014+, Tr0nYx
// @updateUrl https://raw.githubusercontent.com/Tr0nYx/AGSpiel/master/GreasemonkeyScripts/helper/agspiel.js
// @require http://code.jquery.com/jquery-latest.js
// @require https://cdnjs.cloudflare.com/ajax/libs/jquery-cookie/1.4.1/jquery.cookie.min.js
// ==/UserScript==

(function () {
    var AG_mainFunction = function () {

        function init() {
            createCookies();
            addGlobalStyle(getGlobalStyle());
            if (/\bsection=agdepot\b/.test(location.search)) {
                depotChanges();
            }
            if (/\bsection=thread\b/.test(location.search)) {
                forumChanges();
            }
        }

        function depotChanges() {
            createFormChangeCheckBoxes();
            $('#depot tr').each(function (i, v) {
                if (i === 0) {
                    $(this).append('<th num="23" class="geld" role="columnheader" tabindex="0" aria-controls="depot" rowspan="1" colspan="1" aria-label="Verkauf: activate to sort column ascending" style="width: 46px;">Verkauf</th>');
                    $(this).append('<th num="24" class="brief" role="columnheader" tabindex="0" aria-controls="depot" rowspan="1" colspan="1" aria-label="Kauf: activate to sort column ascending" style="width: 46px;">Kauf</th>');
                    $(this).append('<th num="25" class="actions" role="columnheader" tabindex="0" aria-controls="depot" rowspan="1" colspan="1" aria-label="Actions: activate to sort column ascending" style="width: 46px;">Actions</th>');
                } else {
                    var agid = $(this).children('td:first').children('a').last().prop('href').split("&")[1].split("=")[1];
                    var buy = $(this).children('td[align="center"]').children('span.red');
                    var buyval = buy.text();
                    var sell = $(this).children('td[align="center"]').children('span.green');
                    var sellval = sell.text();
                    var amount = $(this).children('td:nth-child(3)').text();
                    buy.html('<a href="#" class="buy">' + buyval + "</a>");
                    if (!(sellval.match('n.a.'))) {
                        sell.html('<a href="#" class="sell">' + sellval + "</a><br />");
                    }
                    $(this).append('<td class="geld">' + sellval + '</td>');
                    $(this).append('<td class="brief">' + buyval + '</td>');
                    $(this).append('' +
                        '<td class="actions">' +
                        '<a style="float: right" title="Zu Favoriten hinzufügen" href="index.php?section=favoriten&amp;aktie=' + agid + '&amp;action=add"><img src="ico/star_full.png"></a>' +
                        '<a style="float: right" href="index.php?section=beobachtungsliste&amp;action=add&amp;id=100352"><img title="auf die Beobachtungsliste setzen" src="ico/eye.png"></a></td>');
                }
            });
            bindHrefs();
        }

        function bindHrefs() {
            $('#depot a.buy').on('click', function (e) {
                e.preventDefault();
                var tokenurl = $(this).closest('td').prev('td').prev('td').prev('td').children('a').last().prop('href');
                var aktie = $(this).closest('td').prev('td').prev('td').prev('td').children('a').last().prop('href').split("&")[1].split("=")[1];
                var price = $(this).text();
                var token = "";
                var amount = prompt("Bitte Anzahl die verkauft werden soll eingeben");
                //var limit = ($(this).parent().parent().children('span').last().children('a').text().replace(',', '.'));
                var limit = $(this).text();
                var params = new Object();
                params.aktie = aktie;
                params.anzahl = amount;
                params.order = "buy";
                params.limit = limit;
                params.submit = "Order erstellen";
                var $token = getToken(tokenurl);
                $.when(getToken(tokenurl)).then(
                    function (data) {
                        createOrder(data, params);
                    })
            });
            $('#depot a.sell').on('click', function (e) {
                e.preventDefault();
                var tokenurl = $(this).closest('td').prev('td').prev('td').prev('td').children('a').last().prop('href');
                var aktie = $(this).closest('td').prev('td').prev('td').prev('td').children('a').last().prop('href').split("&")[1].split("=")[1];
                var stock = $(this).closest('td').prev('td').text().replace('.', '');
                var amount = prompt("Bitte Anzahl die verkauft werden soll eingeben", stock);
                //var limit = ($(this).parent().parent().children('span').last().children('a').text().replace(',', '.'));
                var limit = $(this).text();
                var params = new Object();
                params.aktie = aktie;
                params.anzahl = amount;
                params.order = "sell";
                params.limit = limit;
                params.submit = "Order erstellen";
                var $token = getToken(tokenurl);
                $.when(getToken(tokenurl)).then(
                    function (data) {
                        createOrder(data, params);
                    })
            });
        }

        function createFormChangeCheckBoxes() {
            var geldcheck;
            var briefcheck;
            var actionscheck;
            if (getCookie("geld") !== undefined) {
                geldcheck = "checked";
            }
            if (getCookie("brief") !== undefined) {
                briefcheck = "checked";
            }
            if (getCookie("actions") !== undefined) {
                actionscheck = "checked";
            }
            $('form[name=columns_form]').append(
                    '<input style="vertical-align:text-bottom;" class="agformcolumnsort" type="checkbox" id="geld" value="" ' + geldcheck + '>Geld' +
                    '<input style="vertical-align:text-bottom;" class="agformcolumnsort" type="checkbox" id="brief" value="" ' + briefcheck + '>Brief' +
                    '<input style="vertical-align:text-bottom;" class="agformcolumnsort" type="checkbox" id="actions" value="" ' + actionscheck + '>Actions');
            $('form[name=columns_form] input.agformcolumnsort').on('click', function (e) {
                saveinputstate($(this));
                var selclass = $(this).attr('id');
                $('td.' + selclass).toggle();
                $('th.' + selclass).toggle();
                $(this).prop('checked', !$(this).prop('checked'));
            });
        }

        function saveinputstate(elem) {
            $(elem).prop('checked', !$(elem).prop('checked'));
            $.cookie("cookieStore", JSON.stringify(elem.attr('id'), $(elem).prop('checked')));
        }

        function getToken(url) {
            return $.ajax({
                method: "GET",
                url: url
            });
        }

        function createOrder(data, params) {
            var div = $($.parseHTML(data)).find('#orderform');
            var token = $(div).find('input[name=token]').val();
            var url = "http://www.ag-spiel.de/index.php?section=agorderbuch&action=create&ele=";
            $.post(
                "http://www.ag-spiel.de/index.php?section=agorderbuch&action=create&ele=",
                {
                    aktie: params.aktie,
                    anzahl: params.anzahl,
                    order: params.order,
                    limit: params.limit,
                    token: token,
                    submit: params.submit
                }
            ).
                done(function (data) {
                    console.log(data);
                });
        }

        function forumChanges() {
            $('table.thread tr').each(function () {
                var postid = $(this).children('td.posttext').prop('id');
                console.log($(this).children('td:not(.posttext)'));
                var link = '<p><a href="' + window.location + '#' + postid + '">#' + postid + '</a></p>';
                if ($(this).children('td:not(.posttext)').attr('rowspan') == '2') {
                    $(this).children('td:not(.posttext)').prepend(link);
                }

            })

        }

        function addGlobalStyle(css) {
            var head, style;
            head = document.getElementsByTagName('head')[0];
            if (!head) {
                return;
            }
            style = document.createElement('style');
            style.type = 'text/css';
            style.innerHTML = css;
            head.appendChild(style);
        }

        function getGlobalStyle() {
            var css = "														\
 span.green a{text-decoration:underline;color: #009900}  \
 span.red a{text-decoration:underline;color: #BB0000}	\
 ";
            return css;
        }

        //GM_[s|g]etValue not working?
        function setCookie(key, value) {
            var expires = new Date();
            expires.setTime(expires.getTime() + (1 * 24 * 60 * 60 * 1000));
            document.cookie = key + '=' + value + ';expires=' + expires.toUTCString();
        }

        function getCookie(key) {
            var cookie = JSON.parse($.cookie("cookieStore"));
            return cookie.key;
        }

        function createCookies() {
            var cookies = new Object();
            cookies.geld = "";
            cookies.brief = "";
            cookies.actions = "";
            $.cookie("cookieStore", JSON.stringify(cookies));
        }

        function createTweak() {
            var AGHversion = "0.0.1";
            var AGTweak = {};
            var AGH = {};
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