/**
 * pop-ui.js
 */

var popUi = {
    bottom : false,

    fetchResults : function() {
        var url         = $('#results').attr('data-url');
        var page        = $('#results').attr('data-page');
        var limit       = $('#results').attr('data-limit');
        var sort        = $('#results').attr('data-sort');
        var filter      = $('#results').attr('data-filter');
        var fields      = $('#results').attr('data-fields');
        var filterAry   = [];
        var filterQuery = '';
        var numbered    = $('#results').attr('data-numbered');
        var searchFor   = (!popUi.isEmpty(popUi.getQuery('search_for'))) ? popUi.getQuery('search_for') : null;
        var searchBy    = (!popUi.isEmpty(popUi.getQuery('search_by'))) ? popUi.getQuery('search_by') : null;

        if (searchFor != null) {
            $('#search_for').val(searchFor);
        }

        if ($('#search_by > option').length == 0) {
            $.getJSON(url + '/fields', function (data) {
                if (data.fields != undefined) {
                    var options     = '';
                    var checkboxes  = '';

                    for (var i = 0; i < data.fields.length; i++) {

                        if (data.fields[i] != 'id') {
                            options = options + '<option value="' + data.fields[i] + '"' +
                                ((searchBy == data.fields[i]) ? ' selected="selected"' : '') + '>'
                                + popUi.convertCase(data.fields[i]) + '</option>';
                        }

                        checkboxes  = checkboxes + '<span><input type="checkbox" name="fields[]" id="fields'
                            + (i + 1) + '" value="' + data.fields[i] + '"' +
                            (((!popUi.isEmpty(fields)) && (fields.indexOf(data.fields[i]) != -1)) ?
                                ' checked="checked"' : '') + ' /> ' + popUi.convertCase(data.fields[i]) + '</span>';
                    }
                    $('#field-checkboxes').append(checkboxes);
                    $('#search_by').append(options);

                    $('#field-checkboxes input[type=checkbox]').click(function() {
                        popUi.setFields(this);
                    });
                }
            });
        }

        url = url + '?page=' + page + '&limit=' + limit;

        if ((sort != null) && (sort != undefined) && (sort != '')) {
            url = url + '&sort=' + sort;
        }

        if (!popUi.isEmpty(filter)) {
            filterAry = (filter.indexOf(',') != -1) ? filter.split(',') : [filter];
            for (var i = 0; i < filterAry.length; i++) {
                filterQuery = filterQuery + '&filter[]=' + filterAry[i];
            }
            url = url + filterQuery;
        }

        if (!popUi.isEmpty(fields)) {
            url = url + '&fields=' + fields;
        }

        $.getJSON(url, function (data) {
            if ((data.results != undefined) && (data.results.length > 0)) {
                $('#results').show();
                $('#no-results').hide();

                var nextRows = '';
                var start    = $('#results > tbody > tr').length + 1;
                var keys     = Object.keys(data.results[0]);

                if (data.total_count != undefined) {
                    if ($('#total-count')[0] != undefined) {
                        $('#total-count')[0].innerHTML = data.total_count;
                    } else {
                        $('#results-header').append(' <span>(<span id="total-count">' + data.total_count + '</span>)</span>');
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

                popUi.setThLinks(searchBy, searchFor, filterQuery);

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
                $('#loading').hide();
                $('#loading').css('background-image', 'none');
            } else {
                if ($('#total-count')[0] != undefined) {
                    $('#total-count')[0].innerHTML = 0;
                } else {
                    $('#results-header').append(' <span>(<span id="total-count">0</span>)</span>');
                }

                $('#results').hide();
                $('#no-results').show();
            }
        });
    },

    fetchSearch : function() {
        if (!popUi.isEmpty($('#search_for').val()) && !popUi.isEmpty($('#search_for').val())) {
            var searchFor = $('#search_for').val();
            var searchBy  = $('#search_by').val();
            if ($('#results > tbody > tr').length > 0) {
                $('#results > tbody > tr').remove();
            }

            $('#results').attr('data-page', 1);
            $('#results').attr('data-filter', searchBy + ' LIKE ' + searchFor + '%');

            popUi.setThLinks(searchBy, searchFor);
            popUi.fetchResults();
        }
    },

    setThLinks : function(searchBy, searchFor, filterQuery) {
        var thLinks = $('#results > thead > tr > th > a');
        var filter  = (!popUi.isEmpty(searchBy) && !popUi.isEmpty(searchFor)) ?
            searchBy + '%20LIKE%20' + searchFor + '%25' : '';

        for (var i = 0; i < thLinks.length; i++) {
            var href = $(thLinks[i]).attr('href');
            if (href.indexOf('&filter') != -1) {
                href = href.substring(0, href.indexOf('&filter'));
            }
            if (!popUi.isEmpty(filter)) {
                href = href + '&filter[]=' + filter;
            } else if (!popUi.isEmpty(filterQuery)) {
                href = href + filterQuery;
            }
            //if (!popUi.isEmpty(fieldsQuery) && (href.indexOf('&fields') == -1)) {
            //    href = href + '&' + fieldsQuery;
            //}
            $(thLinks[i]).attr('href', href);
        }
    },

    setFields : function(checkbox) {
        if ($('#fields')[0] != undefined) {
            var value  = $(checkbox).prop('value');
            var fields = $('#fields').prop('value');
            if ($(checkbox).prop('checked')) {
                var newFields = ((fields != '') && (fields != null) && (fields != undefined)) ?
                    fields + ',' + value : value;
                $('#fields').prop('value', newFields);
            } else {
                if ((fields.indexOf(',') == -1) && (fields == value)) {
                    $('#fields').prop('value', '');
                } else {
                    var fieldAry     = (fields.indexOf(',') != -1) ? fields.split(',') : [fields];
                    var newFieldsAry = [];
                    for (var i = 0; i < fieldAry.length; i++) {
                        if (fieldAry[i] != value) {
                            newFieldsAry.push(fieldAry[i]);
                        }
                    }
                    $('#fields').prop('value', newFieldsAry.join(','));
                }


            }

        }
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
        var searchFor = (!popUi.isEmpty(popUi.getQuery('search_for'))) ? popUi.getQuery('search_for') : null;
        var searchBy  = (!popUi.isEmpty(popUi.getQuery('search_by'))) ? popUi.getQuery('search_by') : null;

        if ((searchFor != null) && (searchBy != null)) {
            $('#results').attr('data-filter', searchBy + ' LIKE ' + searchFor + '%');
        }

        // Fetch initial result set
        popUi.fetchResults();

        // On window scroll, fetch the next page
        $(window).scroll(function() {
            if (($(window).height() + $(window).scrollTop()) == $(document).height()) {
                if (parseInt($('#total-count')[0].innerHTML) > $('#results > tbody > tr').length) {
                    $('#loading').css('background-image', 'url(/assets/img/loading.gif)');
                    $('#loading').show();

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

        $('#search_for').keyup(popUi.fetchSearch);
        $('#search_by').change(popUi.fetchSearch);
    }
});