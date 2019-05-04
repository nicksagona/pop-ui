/**
 * pop-ui.js
 */

var popUi = {
    bottom : false,

    fetchResults : function() {
        var url      = $('#results').attr('data-url');
        var page     = $('#results').attr('data-page');
        var limit    = $('#results').attr('data-limit');
        var sort     = $('#results').attr('data-sort');
        var filter   = $('#results').attr('data-filter');
        var fields   = $('#results').attr('data-fields');
        var numbered = $('#results').attr('data-numbered');

        url = url + '?page=' + page + '&limit=' + limit;

        if ((sort != null) && (sort != undefined) && (sort != '')) {
            url = url + '&sort=' + sort;
        }

        if ((filter != null) && (filter != undefined) && (filter != '')) {
            var filterAry = (filter.indexOf(',') != -1) ? filter.split(',') : [filter];
            for (var i = 0; i < filterAry.length; i++) {
                url = url + '&filter[]=' + filterAry[i];
            }
        }

        if ((fields != null) && (fields != undefined) && (fields != '')) {
            var fieldsAry = (fields.indexOf(',') != -1) ? fields.split(',') : [fields];
            for (var i = 0; i < fieldsAry.length; i++) {
                url = url + '&fields[]=' + fieldsAry[i];
            }
        }

        $.getJSON(url, function (data) {
            if ((data.results != undefined) && (data.results.length > 0)) {
                var nextRows = '';
                var start    = $('#results > tbody > tr').length + 1;
                var keys     = Object.keys(data.results[0]);

                if (data.results_count != undefined) {
                    if ($('#results-count')[0] != undefined) {
                        $('#results-count')[0].innerHTML = data.results_count;
                    } else {
                        $('#results-header').append(' <span>(<span id="results-count">' + data.results_count + '</span>)</span>');
                    }
                }

                if ($('#results > thead > tr').length == 0) {
                    var keys = Object.keys(data.results[0]);
                    var tableHeader = '<tr>';

                    if (numbered == 1) {
                        tableHeader = tableHeader + '<th>#</th>';
                    }

                    for (var i = 0; i < keys.length; i++) {
                        tableHeader = tableHeader + '<th><a href="?sort=' + popUi.getSort(keys[i]) + '">' +
                            popUi.convertCase(keys[i]) + '</a></th>';
                    }

                    tableHeader = tableHeader + '</tr>';

                    $('#results > thead').append(tableHeader);
                }

                for (var i = 0; i < data.results.length; i++) {
                    nextRows = nextRows + '<tr>';
                    if (numbered == 1) {
                        nextRows = nextRows + '<td>' + (start + i) + '</td>';
                    }
                    for (var j = 0; j < keys.length; j++) {
                        nextRows = nextRows + '<td>' + ((!popUi.isEmpty(data.results[i][keys[j]])) ?
                            data.results[i][keys[j]] : '') + '</td>';
                    }
                    nextRows = nextRows + '</tr>';
                }

                $('#results > tbody').append(nextRows);
                $('#loading').css('background-image', 'none');
            }
        });
    },

    isEmpty : function(value) {
        return ((value == undefined) || (value == null) || (value == '') ||
            (value == 'undefined') || (value == 'null'));
    },

    getQuery : function(key, u) {
        var vars = [];
        var url  = (u != null) ? u : location.href;

        if (url.indexOf('?') != -1) {
            var varString = url.substring(url.indexOf('?') + 1);
            if (varString.indexOf('#') != -1) {
                varString = varString.substring(0, varString.indexOf('#'));
            }

            var varsAry = varString.split('&');
            for (var i = 0; i < varsAry.length; i++) {
                var gV = varsAry[i].split('=');
                var k  = decodeURIComponent(gV[0]);
                var v  = decodeURIComponent(gV[1])

                if (k.indexOf('[') != -1) {
                    k = k.substring(0, k.indexOf('['));
                    if (vars[k] == undefined) {
                        vars[k] = [];
                    }
                }

                if ((vars[k] != undefined) && (vars[k].constructor == Array)) {
                    vars[k].push(v);
                } else {
                    vars[k] = v;
                }
            }
        }

        if ((key != undefined) && (key != null)) {
            return (vars[key] != undefined) ? vars[key] : undefined;
        } else {
            return vars;
        }
    },

    getSort : function(sort) {
        if (popUi.getQuery('sort') == sort) {
            sort = (sort.substring(0, 1) == '-') ? sort.substring(1) : '-' + sort;
        }
        return sort;
    },

    convertCase : function(str) {
        if (str == 'id') {
            return 'ID';
        } else {
            str = str.replace('_', ' ');
            str = str.split(' ');

            for (var i = 0, x = str.length; i < x; i++) {
                str[i] = str[i][0].toUpperCase() + str[i].substr(1);
            }

            return str.join(' ');
        }
    }
};

$(document).ready(function(){
    if ($('#results')[0] != undefined) {
        // Fetch initial result set
        popUi.fetchResults();

        // On window scroll, fetch the next page
        $(window).scroll(function() {
            if (($(window).height() + $(window).scrollTop()) == $(document).height()) {
                if (parseInt($('#results-count')[0].innerHTML) > $('#results > tbody > tr').length) {
                    $('#loading').css('background-image', 'url(/assets/img/loading.gif)');

                    popUi.bottom = false;
                    var page     = $('#results').attr('data-page');
                    page         = parseInt(page) + 1;

                    $('#results').attr('data-page', page);
                    popUi.fetchResults();
                }
                popUi.bottom = true;
            } else {
                popUi.bottom = false;
            }
        });
    }
});