// ==UserScript==
// @name AG-Spiel.de TradeHelper
// @namespace http://notforu.com
// @version 0.0.1
// @description adds some useful things to AG-Spiel.de
// @match http://www.ag-spiel.de/*
// @copyright 2014+, Tr0nYx
// @downloadURL https://raw.githubusercontent.com/Tr0nYx/AGSpiel/master/GreasemonkeyScripts/helper/tradehelper.js
// @updateUrl https://raw.githubusercontent.com/Tr0nYx/AGSpiel/master/GreasemonkeyScripts/helper/tradehelper.js
// @require http://code.jquery.com/jquery-latest.js
// ==/UserScript==

function init() {
    checkWatchList();
    if (/\bsection=beobachtungsliste\b/.test(location.search)) {
        watchlistChanges();
    }
}

function watchlistChanges() {
    $('#content table tr').each(function (i, v) {
        if (i == 0) {
            $(this).append('<th>Helper</th>');
        } else {
            var wkntext = $(this).children('td:first').html().split('<br>')[0];
            var patt = new RegExp("WKN", 'i');
            var result = wkntext.match(patt);
            if (result !== null) {
                var wkn = wkntext.split(' ')[1];
                var selanalysetype = GM_getValue(wkn);
                console.log(selanalysetype);
                $(this).append('<td>' +
                    '<select name="tradehelperselect">' +
                    '<option value="' + selanalysetype + '">keine</option>' +
                    '<option value="' + selanalysetype + '">MACD Triple</option>' +
                    '</select></td>');
            }
        }
    })

}
function checkWatchList() {
    GM_xmlhttpRequest({
        method: 'GET',
        header: {
            'Cache-Control': 'max-age=0, must-revalidate'
        },
        url: 'http://www.ag-spiel.de/index.php?section=beobachtungsliste',
        onload: function (responseDetails) {
            updateWatchList(responseDetails.responseText);
        },
        onerror: function (responseDetails) {
            log("info", "Errorcode " + responseDetails.status);
        }
    });

    function updateWatchList(data) {
        $(data).find('#content table tr:gt(0)').each(function () {
            var wkntext = $(this).children('td:first').html().split('<br>')[0].split(' ')[1];
            if (isNumber(wkntext)){
                if (GM_getValue(wkntext) === undefined) {
                    GM_setValue(wkntext, '0');
                }
            }
        })
        console.log(GM_listValues());
    }

    function isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }
}

init();