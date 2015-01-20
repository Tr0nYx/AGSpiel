// ==UserScript==
// @name AG-Spiel.de Helper
// @namespace http://notforu.com
// @version 0.3.2
// @description adds some useful things to AG-Spiel.de
// @match http://www.ag-spiel.de/*
// @copyright 2014+, Tr0nYx
// @downloadURL https://raw.githubusercontent.com/Tr0nYx/AGSpiel/master/GreasemonkeyScripts/helper/agspiel.js
// @updateUrl https://raw.githubusercontent.com/Tr0nYx/AGSpiel/master/GreasemonkeyScripts/helper/agspiel.js
// @require http://code.jquery.com/jquery-latest.js
// @require https://cdnjs.cloudflare.com/ajax/libs/jquery-cookie/1.4.1/jquery.cookie.min.js
// ==/UserScript==

(function () {
    var AG_mainFunction = function () {
        function init() {
            createCookies();
            addMenuEntry();
            addNavButton();
            addGlobalStyle(getGlobalStyle());
            if (/\bsection=agdepot\b/.test(location.search)) {
                if (!(/Keine Einträge gefunden./i.test($('table#depot tr').find('td').html()))) {
                    depotChanges();
                }
            }
            if (/\bsection=thread\b/.test(location.search)) {
                forumChanges();
            }
            if (/\bsection=neue\b/.test(location.search)) {
                neueAgsChanges();
            }
        }

        function addMenuEntry() {
            $('div#nav').children('ul').children('li:nth-child(4)').children('ul').children('li:nth-child(4)').after('<li><a href="#advancedchat" class="advancedchat">Advanced Chat</a>');
            $('a.advancedchat').on('click', function () {
                openChat();
            });

        }

        function addNavButton() {
            $('#top').before(
                    '<nav><ul><li id="advancedchat"><a id="chat-trigger" href="#">Chat<span>▼</span></a>' +
                    '<div id="chat-content">' +
                    '<iframe src="http://217.79.181.59:2001" width="1200px" height="600px"/>' +
                    '</div></li></ul></nav>'
            )
            $('#chat-trigger').click(function () {
                $(this).next('#chat-content').slideToggle();
                $(this).toggleClass('active');

                if ($(this).hasClass('active')) $(this).find('span').html('&#x25B2;')
                else $(this).find('span').html('&#x25BC;')
            })

        }

        function openChat() {
            $('#content').html('<iframe src="http://217.79.181.59:2001" width="100%" height="600px"/>')
        }
        
        function depotChanges() {
            createFormChangeCheckBoxes();
            $('#depot tr').each(function (i, v) {
                var html = "";
                if (i === 0) {
                    $(this).append('<th num="23" class="geld" role="columnheader" tabindex="0" aria-controls="depot" rowspan="1" colspan="1" aria-label="Verkauf: activate to sort column ascending" style="width: 46px;">Buy</th>');
                    $(this).append('<th num="24" class="brief" role="columnheader" tabindex="0" aria-controls="depot" rowspan="1" colspan="1" aria-label="Unterbieten: activate to sort column ascending" style="width: 46px;">Sell</th>');
                    $(this).append('<th num="25" class="actions" role="columnheader" tabindex="0" aria-controls="depot" rowspan="1" colspan="1" aria-label="Actions: activate to sort column ascending" style="width: 46px;">Actions</th>');
                } else {
                    var agid = $(this).children('td:first').children('a').last().prop('href').split("&")[1].split("=")[1];
                    var buy = $(this).children('td[align="center"]').children('span.red');
                    var buyval = buy.text();
                    var sell = $(this).children('td[align="center"]').children('span.green');
                    var sellval = sell.text();
                    var amount = $(this).children('td:nth-child(3)').text();
                    if (!(buyval.match('n.a.'))) {
                        //buyval = parseFloat(buy.text().replace(',', '.')).toFixed(2);
                        buy.html('<a href="#" class="buy">' + buyval + "</a>");
                    }
                    if (!(sellval.match('n.a.'))) {
                        sell.html('<a href="#" class="sell">' + sellval + "</a><br />");
                    }
                    var selllower = parseFloat(buy.text().replace(',', '.')) - 0.01;
                    $(this).append('<td class="geld">' + sellval + '</td>');
                    $(this).append('<td class="brief"><a href="#" class="selllower">' + selllower.toFixed(2) + '</a></td>');
                    if ($(this).hasClass('red')) {
                        html = '<a style="float: right;text-indent: -9999px" class="showmessage button cross" href="#">Löschen</a>';
                    }
                    $(this).append(
                            '<td class="actions">' +
                            html +
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
                var limit = $(this).text();
                var params = new Object();
                params.aktie = aktie;
                params.anzahl = amount;
                params.order = "sell";
                params.limit = limit;
                params.submit = "Order erstellen";
                $.when(getToken(tokenurl)).then(
                    function (data) {
                        createOrder(data, params);
                    })
            });
            $('#depot a.button.cross.showmessage').on('click', function (e) {
                e.preventDefault();
                var tokenurl = $(this).parent('td').parent('tr').children('td:first').children('a').last().prop('href');
                var aktie = $(this).parent('td').parent('tr').children('td:first').children('a').last().prop('href').split("&")[1].split("=")[1];
                var check = $.when(getOrderbuch()).then(
                    function (data) {
                        stopSellOrder(data, aktie);
                    })
            })
            $('#depot a.selllower').on('click', function (e) {
                e.preventDefault();
                var tokenurl = $(this).parent('td').parent('tr').children('td:first').children('a').last().prop('href');
                var aktie = $(this).parent('td').parent('tr').children('td:first').children('a').last().prop('href').split("&")[1].split("=")[1];
                var stock = $(this).parent('td').parent('tr').children('td:nth-child(3)').text().replace('.', '');
                var token = "";
                var limit = $(this).text();
                var params = new Object();
                params.aktie = aktie;
                params.tokenurl = tokenurl;
                params.anzahl = stock;
                params.order = "sell";
                params.limit = limit;
                params.submit = "Order erstellen";
                var check = $.when(getOrderbuch()).then(
                    function (data) {
                        checkforSell(data, params);
                    })
            });
        }

        function stopSellOrder(data, aktie) {
            var div = $($.parseHTML(data)).find('table#openorders tbody');
            $(div).find('tr').each(function () {
                var text = $(this).find('td').first().find('a').html().split('<br>')[0];
                var link = $(this).find('td').last().children('a').attr('href');
                var patt = new RegExp(aktie, 'i');
                var result = text.match(patt);
                if (result != null) {
                    stopOrder(link);
                }
            })

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

        function getOrderbuch() {
            return $.ajax({
                method: "GET",
                url: "http://www.ag-spiel.de/index.php?section=agorderbuch"
            });
        }

        function checkforSell(data, params) {
            var div = $($.parseHTML(data)).find('table#openorders tbody');
            var exists = 0;
            var price = "";
            var modalparams = new Object;
            $(div).find('tr').each(function () {
                var text = $(this).find('td').first().find('a').html().split('<br>')[0];
                modalparams.link = $(this).find('td').last().children('a').attr('href');
                var tdprice = $(this).find('td:nth-child(5)').find('a');
                var style = $(tdprice).parent().css('border');
                price = $(tdprice).html();
                var patt = new RegExp(params.aktie, 'i');
                var result = text.match(patt);
                if (result != null && !(/2px solid orange/i.test(style))) {
                    exists = 1;
                    return false;
                } else if (result != null && (/2px solid orange/i.test(style))) {
                    exists = 2;
                    return false;
                } else {
                    exists = 0;
                }
            })

            if (exists == 1) {
                modalparams.content = "Wollen sie ihre aktuelle SellOrder für " + price + "€ auf " + params.limit + "€ stellen?";
                modalparams.title = "Bereits bestehende Sellorder";
                createDialog(modalparams, params, exists);
            } else if (exists == 2) {
                modalparams.content = "geht nicht günstiger";
                modalparams.title = "Ihre Sellorder ist bereits die günstigste";
                createDialog(modalparams, params);
            } else if (exists == 0) {
                modalparams.content = "Sellorder für " + params.limit + "€ tätigen?";
                modalparams.title = "Sellorder tätigen";
                createDialog(modalparams, params, exists);
            }
        }

        function createDialog(modalparams, params, exists) {
            $('<div></div>').appendTo('body')
                .html('<div><p>' + modalparams.content + '</p></div>')
                .dialog({
                    modal: true,
                    title: modalparams.title,
                    zIndex: 10000,
                    autoOpen: true,
                    width: 'auto',
                    resizable: false,
                    buttons: {
                        Ja: function () {
                            if (exists == 1) {
                                resellOrder(params, modalparams.link)
                            } else {
                                $.when(getToken(params.tokenurl)).then(
                                    function (data) {
                                        createOrder(data, params);
                                    })
                            }
                            $(this).dialog("close");
                        },
                        Nein: function () {
                            $(this).dialog("close");
                        }
                    },
                    close: function (event, ui) {
                        $(this).remove();
                    }
                });
        }

        function stopOrder(url) {
            return $.ajax({
                method: "GET",
                url: 'http://www.ag-spiel.de/' + url
            });
        }

        function resellOrder(params, stopurl) {
            $.when(stopOrder(stopurl)).then(getToken(params.tokenurl)).then(
                function (data) {
                    createOrder(data, params);
                })
        }

        function createOrder(data, params) {
            var div = $($.parseHTML(data)).find('#orderform');
            var token = $(div).find('input[name=token]').val();
            var mins = $(div).find('input[name=gab_minute]').val();
            var tag = $(div).find('input[name=gab_tag]').val();
            var monat = $(div).find('input[name=gab_monat]').val();
            var jahr = $(div).find('input[name=gab_jahr]').val();
            var stunde = $(div).find('input[name=gab_stunde]').val();
            var minsup = parseInt(mins / 5) * 5 + 5;
            $.post(
                "http://www.ag-spiel.de/index.php?section=agorderbuch&action=create&ele=",
                {
                    aktie: params.aktie,
                    anzahl: params.anzahl,
                    order: params.order,
                    limit: params.limit,
                    gab_tag: tag,
                    gab_monat: monat,
                    gab_jahr: jahr,
                    gab_stunde: stunde,
                    gab_minute: minsup,
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
                var link = '<p><a href="' + window.location + '#' + postid + '">#' + postid + '</a></p>';
                if ($(this).children('td:not(.posttext)').attr('rowspan') == '2') {
                    $(this).children('td:not(.posttext)').prepend(link);
                }
            })
        }

        function neueAgsChanges() {
            $('table#neueAgs tbody tr:first').before('<tr><td colspan="10" style="text-align:center; font-weight:bold;">Alle Eingabefelder sind die Maximalwerte!</td></tr><tr>' +
                '<td></td>' +
                '<td></td>' +
                '<td><input type="text" name="bargeld" size="2"></td>' +
                '<td><input type="text" name="depotwert" size="2"></td>' +
                '<td><input type="text" name="bwaktie" size="2"></td>' +
                '<td><input type="text" name="briefkurs" size="2"></td>' +
                '<td><input type="text" name="briefbw" size="2"></td>' +
                '<td></td>' +
                '<td><select name="anteil"><option>Bitte wählen</option><option value=""now">Jetzt</option><option value="0">0%</option><option value="5">5%</option></select></td>' +
                '<td><select name="time"><option>Bitte wählen</option><option value="day">1 Tag</option><option value="12hours">12 Stunden</option></select></td>' +
                '</tr>');
            makeTableSortable();
            bindneueAgsInputs();
        }

        function makeTableSortable() {
            $('table#neueAgs tbody tr').removeClass('even').removeClass('odd');
            zebraRows('table#neueAgs tbody tr:odd', 'odd');
            $('table#neueAgs tbody tr').hover(function () {
                $(this).find('td').addClass('hovered');
            }, function () {
                $(this).find('td').removeClass('hovered');
            });
            //grab all header rows
            $('table#neueAgs thead th').each(function (column) {
                $(this).addClass('sortable').click(function () {
                    var findSortKey = function ($cell) {
                        return $cell.find('.sort-key').text().toUpperCase() + ' ' + $cell.text().toUpperCase();
                    };
                    var sortDirection = $(this).is('.sorted-asc') ? -1 : 1;

                    //step back up the tree and get the rows with data
                    //for sorting
                    var $rows = $(this).parent().parent().parent().find('tbody tr').get();

                    //loop through all the rows and find
                    $.each($rows, function (index, row) {
                        if ($(row).children('td').attr('colspan')) {
                            $(row).children('td').hide();
                        }
                        row.sortKey = findSortKey($(row).children('td').eq(column));
                    });

                    //compare and sort the rows alphabetically
                    $rows.sort(function (a, b) {
                        if (a.sortKey < b.sortKey) return -sortDirection;
                        if (a.sortKey > b.sortKey) return sortDirection;
                        return 0;
                    });

                    //add the rows in the correct order to the bottom of the table
                    $.each($rows, function (index, row) {
                        $('tbody').append(row);
                        row.sortKey = null;
                    });

                    //identify the column sort order
                    $('th').removeClass('sorted-asc sorted-desc');
                    var $sortHead = $('th').filter(':nth-child(' + (column + 1) + ')');
                    sortDirection == 1 ? $sortHead.addClass('sorted-asc') : $sortHead.addClass('sorted-desc');

                    //identify the column to be sorted by
                    $('td').removeClass('sorted')
                        .filter(':nth-child(' + (column + 1) + ')')
                        .addClass('sorted');

                    $('tr.visible').removeClass('odd');
                    zebraRows('tr.visible:even', 'odd');
                });
            });

        }

        //used to apply alternating row styles
        function zebraRows(selector, className) {
            $(selector).removeClass(className).addClass(className);
        }

        function bindneueAgsInputs() {
            $('table#neueAgs tbody tr select[name=time]').on('change', function () {
                var maxval = $(this).val();
                $('table#neueAgs tbody tr:gt(0)').each(function () {
                    var lastonline = $(this).children('td').eq(9).text();
                    if (maxval == "day") {
                    }
                })
            })
            $('table#neueAgs tbody tr input[name=bargeld]').on('keyup', function () {
                var maxval = $(this).val();
                $('table#neueAgs tbody tr:gt(0)').each(function () {
                    var percentage = parseFloat($(this).children('td').eq(2).text().replace('€', '').replace('.', ''));
                    if (percentage > maxval) {
                        $(this).hide().removeClass('visible');
                    } else {
                        $(this).show().addClass('visible');
                    }
                })
            })
            $('table#neueAgs tbody tr input[name=depotwert]').on('keyup', function () {
                var maxval = $(this).val();
                $('table#neueAgs tbody tr:gt(0)').each(function () {
                    var percentage = parseFloat($(this).children('td').eq(3).text().replace('€', '').replace('.', ''));
                    if (percentage > maxval) {
                        $(this).hide().removeClass('visible');
                    } else {
                        $(this).show().addClass('visible');
                    }
                })
            })
            $('table#neueAgs tbody tr input[name=bwaktie]').on('keyup', function () {
                var maxval = $(this).val();
                $('table#neueAgs tbody tr:gt(0)').each(function () {
                    var percentage = parseFloat($(this).children('td').eq(4).text().replace('€', '').replace(',', '.'));
                    if (percentage > maxval) {
                        $(this).hide().removeClass('visible');
                    } else {
                        $(this).show().addClass('visible');
                    }
                })
            })
            $('table#neueAgs tbody tr input[name=briefkurs]').on('keyup', function () {
                var maxval = $(this).val();
                $('table#neueAgs tbody tr:gt(0)').each(function () {
                    var percentage = parseFloat($(this).children('td').eq(5).text().replace('€', '').replace(',', '.'));
                    if (percentage > maxval) {
                        $(this).hide().removeClass('visible');
                    } else {
                        $(this).show().addClass('visible');
                    }
                })
            })
            $('table#neueAgs tbody tr input[name=briefbw]').on('keyup', function () {
                var maxval = $(this).val();
                $('table#neueAgs tbody tr:gt(0)').each(function () {
                    var percentage = $(this).children('td').eq(6).text().replace('%', '');
                    if (percentage > maxval) {
                        $(this).hide().removeClass('visible');
                    } else {
                        $(this).show().addClass('visible');
                    }
                })
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
            var css = "									 \
 span.green a{text-decoration:underline;color: #009900}  \
 span.red a{text-decoration:underline;color: #BB0000}	 \
th.sortable { color: #666;cursor: pointer;text-decoration:underline;}\
th.sortable:hover{color: black;}\
th.sorted-asc, th.sorted-desc{color: black;} \
td.hovered{background-color: lightblue;color: #666;}\
nav ul{margin: 0;padding: 0;list-style: none; position: relative;float: right;background: #eee;border-bottom: 1px solid #fff;border-radius: 3px;right:-15px;}\
nav li{float: left;}\
nav #advancedchat {border-right: 1px solid #ddd;box-shadow: 1px 0 0 #fff;list-style-type:none;}\
nav #chat-trigger{display: inline-block;*display: inline;*zoom: 1;height: 25px;line-height: 25px;font-weight: bold;padding: 0 8px;text-decoration: none;color: #444;text-shadow: 0 1px 0 #fff;}\
nav #chat-trigger{border-radius: 0 3px 3px 0;position:absolute;right:-62px;background: #eee;}\
nav #chat-trigger:hover,nav #login .active{background: #fff;}\
nav #chat-content {display: none;position: absolute;top: 0px;right: 0;z-index: 999;background: #fff;background-image: linear-gradient(top, #fff, #eee);padding: 15px;box-shadow: 0 2px 2px -1px rgba(0,0,0,.9);border-radius: 3px 0 3px 3px;}\
nav li #chat-content {right: 50x;width: 1200px;}\
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
})
();