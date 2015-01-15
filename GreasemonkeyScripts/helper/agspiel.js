// ==UserScript==
// @name AG-Spiel.de Helper
// @namespace http://notforu.com
// @version 0.1
// @description Opens all links in the CodeProject newsletter 
// @match http://www.ag-spiel.de/*
// @copyright 2014+, Tr0nYx
// @require http://code.jquery.com/jquery-latest.js
// ==/UserScript==

function script() {
    addGlobalStyle(getGlobalStyle());
    if (/\bsection=agdepot\b/.test(location.search)) {
        depotchanges();
    }
}

function depotchanges() {
    $('#depot tr').each(function (i, v) {
        if (i == 0) {
            $(this).append('<th num="23" class="sorting" role="columnheader" tabindex="0" aria-controls="depot" rowspan="1" colspan="1" aria-label="Verkauf: activate to sort column ascending" style="width: 46px;">Verkauf</th>');
            $(this).append('<th num="24" class="sorting" role="columnheader" tabindex="0" aria-controls="depot" rowspan="1" colspan="1" aria-label="Kauf: activate to sort column ascending" style="width: 46px;">Kauf</th>');
        } else {
            var aglink = $(this).children('td:first').children('a').last().prop('href').split("&")[1].split("=")[1];
            var buy = $(this).children('td[align="center"]').children('span.red');
            var buyval = buy.text();
            var sell = $(this).children('td[align="center"]').children('span.green');
            var sellval = sell.text();
            var amount = $(this).children('td:nth-child(3)').text();
            buy.html('<a href="#" class="buy">' + buyval + "</a>");
            if (!(sellval.match('n.a.'))) {
                sell.html('<a href="#" class="sell">' + sellval + "</a><br />");
            }
            $(this).append("<td>" + sellval + "</td>");
            $(this).append("<td>" + buyval + "</td>");
        }
    });
    bindHrefs();
}

function bindHrefs() {
    $('#depot a.buy').on('click', function (e) {
        e.preventDefault();
        var tokenurl = $(this).closest('td').prev('td').prev('td').prev('td').children('a').last().prop('href');
        var aglink = $(this).closest('td').prev('td').prev('td').prev('td').children('a').last().prop('href').split("&")[1].split("=")[1];
        var price = $(this).text();
        var token = "";

        console.log("http://www.ag-spiel.de/index.php?section=profil&aktie=" + aglink);
        /*GM_xmlhttpRequest({
         method: "GET",
         url:"http://www.ag-spiel.de/index.php?section=profil&aktie="+aglink,
         onload: function (response) {
         GM_xmlhttpRequest({
         method: "GET",
         url: tokenurl,
         onload: function (response) {
         var div = $($.parseHTML(response.responseText)).find('#orderform');
         token = $(div).find('input[name=token]').val();
         //var maxstock = $(div).find('#briefkurs').children('a').last().prop('href').split("&")[3].split("=")[1];
         console.log($(div).find('#briefkurs').html());
         var amount = prompt("Bitte Anzahl die gekauft werden soll eingeben", maxstock);
         var myobject = new Object();
         myobject.aktie = aglink;
         myobject.anzahl = amount;
         myobject.limit = price;
         myobject.token = token;
         var jsonStr = JSON.stringify(myobject);
         console.log(jsonStr);
         /*if (token != ""){
         $.post(
         "http://www.ag-spiel.de/index.php?section=agorderbuch&action=create&ele=",
         {
         aktie: aglink,
         anzahl: amount,
         order: "buy",
         limit: price,
         token: token,
         submit: 'Order erstellen'

         }
         )
         .done(function( data ) {
         console.log( data );
         });
         }
         }
         });
         }
         });*/
    });
    $('#depot a.sell').on('click', function (e) {
        e.preventDefault();
        var tokenurl = $(this).closest('td').prev('td').prev('td').prev('td').children('a').last().prop('href');
        var aktie = $(this).closest('td').prev('td').prev('td').prev('td').children('a').last().prop('href').split("&")[1].split("=")[1];
        var stock = $(this).closest('td').prev('td').text().replace('.', '');
        var amount = prompt("Bitte Anzahl die verkauft werden soll eingeben", stock);
        var limit = ($(this).parent().parent().children('span').last().children('a').text().replace(',','.'));
        //var price = $(this).text();
        var params = new Object();
        params.aktie = aktie;
        params.anzahl = amount;
        params.order= "sell";
        params.limit = limit;
        params.submit = "Order erstellen";
        var $token = getToken(tokenurl);
        $token.then(
            function (data) {
                createSellOrder(data, params);
            })
    });
}

function getToken(url) {
    return $.ajax({
        method: "GET",
        url: url
    });
}

function createSellOrder(data, params) {
    var div = $($.parseHTML(data.data)).find('#orderform');
    var token = $(div).find('input[name=token]').val();
    var url = "http://www.ag-spiel.de/index.php?section=agorderbuch&aktie="+params.aktie+"&limit="+params.limit+"&anzahl="+params.anzahl+"&check=1&privat=";
    var postparams = "aktie=" + params.aktie + "&anzahl=" + params.anzahl + "&order=sell&limit=" + params.limit + "&token=" + token + "&submit=Order erstellen";
    GM_xmlhttpRequest({
        method: "POST",
        url: url,
        data: postparams,
        synchronous: true,
        onload: function (data) {
            console.log(data.responseText);
        }
    });
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
script();