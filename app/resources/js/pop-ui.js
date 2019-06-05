/**
 * pop-ui.js
 */

var popUi = {
    bottom   : false,
    tabIndex : 10001,

    // Main method fo fetch results
    fetchResults : function() {
        var url         = $('#results').attr('data-url');
        var page        = $('#results').attr('data-page');
        var limit       = $('#limit').val();
        var sort        = $('#results').attr('data-sort');
        var filter      = $('#results').attr('data-filter');
        var fields      = $('#results').attr('data-fields');
        var urlQuery    = [];
        var filterAry   = [];
        var filterQuery = '';
        var numbered    = $('#results').attr('data-numbered');
        var edit        = $('#results').attr('data-edit');
        var searchFor   = (!popUi.isEmpty(popUi.getQuery('search_for'))) ? popUi.getQuery('search_for') : null;
        var searchBy    = (!popUi.isEmpty(popUi.getQuery('search_by'))) ? popUi.getQuery('search_by') : null;
        var apiKey      = popUi.getCookie('api_key');

        if (numbered == 1) {
            $('#numbered').prop('checked', true);
        } else {
            $('#numbered').prop('checked', false);
        }

        if (searchFor != null) {
            $('#search_for').prop('value', searchFor);
        } else if ($('#search_for').prop('value') != '') {
            searchFor = $('#search_for').prop('value');
        }

        if ((searchBy == null) && ($('#search_by').val() != '')) {
            searchBy = $('#search_by').val();
        }

        if (fields != null) {
            $('#fields').prop('value', fields);
        }

        var headers = (apiKey != '') ? { 'Authorization' : 'Bearer ' + apiKey} : {};

        // Set field options and checkboxes in the search form
        if ($('#search_by > option').length == 0) {
            $.ajax({
                dataType: 'json',
                headers: headers,
                url:  url + '/fields',
                success: function (fieldsData) {
                    if (fieldsData.fields != undefined) {
                        var options     = '';
                        var checkboxes  = '';

                        for (var i = 0; i < fieldsData.fields.length; i++) {
                            if (fieldsData.fields[i] != 'id') {
                                options = options + '<option value="' + fieldsData.fields[i] + '"' +
                                    ((searchBy == fieldsData.fields[i]) ? ' selected="selected"' : '') + '>'
                                    + popUi.convertCase(fieldsData.fields[i]) + '</option>';
                            }

                            checkboxes  = checkboxes + '<span><input tabindex="' + (i + 9).toString() + '" type="checkbox" name="fields[]" id="fields'
                                + (i + 1) + '" value="' + fieldsData.fields[i] + '"' +
                                (((!popUi.isEmpty(fields)) && (fields.indexOf(fieldsData.fields[i]) != -1)) ?
                                    ' checked="checked"' : '') + ' /> ' + popUi.convertCase(fieldsData.fields[i]) + '</span>';
                        }
                        $('#field-checkboxes').append(checkboxes);
                        $('#search_by').append(options);

                        $('#numbered').click(function() {
                            if ($(this).prop('checked')) {
                                $('#results').attr('data-numbered', 1);
                            } else {
                                $('#results').attr('data-numbered', 0);
                            }
                            if (popUi.isScroll()) {
                                popUi.fetchSearch();
                            }
                        });
                        $('#field-checkboxes input[type=checkbox]').click(function() {
                            if ($(this).prop('id') != 'numbered') {
                                popUi.setFields(this);
                                if (popUi.isScroll()) {
                                    popUi.fetchSearch();
                                }
                            }
                        });
                    }
                }
            }).fail(popUi.showError);
        }

        // Construct the URL query
        if ((sort != null) && (sort != undefined) && (sort != '')) {
            urlQuery.push('sort=' + sort);
        }

        if (!popUi.isEmpty(filter)) {
            filterAry = (filter.indexOf(',') != -1) ? filter.split(',') : [filter];
            for (var i = 0; i < filterAry.length; i++) {
                filterQuery = filterQuery + '&filter[]=' + filterAry[i];
                urlQuery.push('filter[]=' + filterAry[i]);
            }
        }

        if (!popUi.isEmpty(fields)) {
            urlQuery.push('fields=' + fields);
        }

        url = url + '?page=' + page + '&limit=' + limit;
        if (urlQuery.length > 0) {
            url = url + '&' + urlQuery.join('&');
            var href = $('#export-btn').attr('href');
            if (href.indexOf('?') != -1) {
                href = href.substring(0, href.indexOf('?'));
            }
            $('#export-btn').attr('href', href + '?' + urlQuery.join('&'));
        }

        $('#results > thead > tr').remove();

        // Fetch results
        $.ajax({
            dataType: 'json',
            headers: headers,
            url:  url,
            success: function (data) {
                // If there are results
                if ((data.results != undefined) && (data.results.length > 0)) {
                    $('#results').show();
                    $('#no-results').hide();

                    var nextRows = '';
                    var start    = $('#results > tbody > tr').length + 1;
                    var keys     = Object.keys(data.results[0]);

                    // Set total count
                    if (data.total_count != undefined) {
                        if ($('#total-count')[0] != undefined) {
                            $('#total-count')[0].innerHTML = data.total_count;
                        } else {
                            $('#results-header').append(' <span>(<span id="total-count">' +
                                data.total_count + '</span>)</span>');
                        }
                    }

                    // Set table headers
                    if ($('#results > thead > tr').length == 0) {
                        var keys        = Object.keys(data.results[0]);
                        var tableHeader = '<tr>';
                        var tabIndex    = 7;

                        if (numbered == 1) {
                            tableHeader = tableHeader + '<th class="th-number">#</th>';
                        }

                        for (var i = 0; i < keys.length; i++) {
                            var caret = '';

                            if (popUi.getQuery('sort') == keys[i]) {
                                caret = ' <i class="fa fa-caret-up"></i>';
                            } else if (popUi.getQuery('sort') == '-' + keys[i]) {
                                caret = ' <i class="fa fa-caret-down"></i>';
                            }

                            tableHeader = tableHeader + '<th><a tabindex="' + tabIndex++ + '" href="?sort=' + popUi.getSort(keys[i]) +
                                ((searchFor != null) ? '&search_for=' + searchFor : '') +
                                ((searchBy != null) ? '&search_by=' + searchBy : '') +
                                ((!popUi.isScroll()) ? '&scroll=0' : '') +  '">' +
                                popUi.convertCase(keys[i]) + '</a>' + caret + '</th>';
                        }

                        tableHeader = tableHeader + '</tr>';

                        $('#results > thead').append(tableHeader);
                        popUi.setThLinks(searchBy, searchFor);
                    }

                    // Set table header links
                    popUi.setThLinks(searchBy, searchFor, fields, filterQuery);
                    var hasId = false;

                    // Set result rows
                    for (var i = 0; i < data.results.length; i++) {
                        nextRows = nextRows + '<tr>';
                        var numberedValue = (popUi.isScroll()) ? (start + i) : ((i + 1) + ((page - 1) * limit));
                        if (numbered == 1) {
                            nextRows = nextRows + '<td class="td-number">' + numberedValue + '</td>';

                        }
                        for (var j = 0; j < keys.length; j++) {
                            if (keys[j] == 'id') {
                                nextRows = nextRows + '<td>' + ((!popUi.isEmpty(data.results[i][keys[j]])) ?
                                    data.results[i][keys[j]] : '') + '</td>';
                            } else {
                                var input = '';
                                if ((edit == 1) && (data.results[i]['id'] != undefined)) {
                                    hasId = true;
                                    input = '<input type="text" class="form-control form-control-sm td-input" tabindex="' + popUi.tabIndex++ +
                                        '" name="' + keys[j] + '" id="' + keys[j] + '-' + numberedValue + '" data-id="' + data.results[i]['id'] + '" value="' +
                                        (!popUi.isEmpty(data.results[i][keys[j]]) ? data.results[i][keys[j]] : '') + '" />';
                                }
                                nextRows = nextRows + '<td id="td-' + keys[j] + '-' + numberedValue + '"><span class="td-span">' +
                                    ((!popUi.isEmpty(data.results[i][keys[j]])) ?
                                        data.results[i][keys[j]] : '&nbsp;') +
                                    '</span>' + input + ' </td>';
                            }
                        }
                        nextRows = nextRows + '</tr>';
                    }

                    $('#results > tbody').append(nextRows);
                    if ((edit == 1) && (hasId)) {
                        $('#results > tbody > tr > td > span').dblclick(popUi.showInput);
                        $('#results > tbody > tr > td > input').keydown(popUi.tabToNextInput);
                    }
                    $('#loading').hide();
                    $('#loading').css('background-image', 'none');
                // Else, no results
                } else {
                    if ($('#total-count')[0] != undefined) {
                        $('#total-count')[0].innerHTML = 0;
                    } else {
                        $('#results-header').append(' <span>(<span id="total-count">0</span>)</span>');
                    }

                    $('#results').hide();
                    $('#no-results').show();
                }
            }
        }).fail(popUi.showError);
    },

    // Method to fetch results based on search criteria
    fetchSearch : function() {
        var searchFor = $('#search_for').val();
        var searchBy  = $('#search_by').val();

        // Reset data points and remove existing results rows
        $('#results').attr('data-page', 1);

        if ($('#results > tbody > tr').length > 0) {
            $('#results > tbody > tr').remove();
        }

        if (!popUi.isEmpty($('#search_for').val()) && !popUi.isEmpty($('#search_for').val())) {
            $('#results').attr('data-filter', searchBy + '+LIKE+' + searchFor + '%25');
        } else {
            $('#results').attr('data-filter', '');
        }

        popUi.fetchResults();
    },

    // Method to set table header links
    setThLinks : function(searchBy, searchFor, fields, filterQuery) {
        var thLinks = $('#results > thead > tr > th > a');
        var filter  = (!popUi.isEmpty(searchBy) && !popUi.isEmpty(searchFor)) ?
            searchBy + '+LIKE+' + searchFor + '%25' : '';

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
            if (!popUi.isEmpty(fields) && (href.indexOf('&fields') == -1)) {
                href = href + '&fields=' + fields;
            }
            $(thLinks[i]).attr('href', href);
        }
    },

    // Method to set field values in the hidden fields element
    setFields : function(checkbox) {
        if ($('#fields')[0] != undefined) {
            var value  = $(checkbox).prop('value');
            var fields = $('#fields').prop('value');
            if ($(checkbox).prop('checked')) {
                var newFields = ((fields != '') && (fields != null) && (fields != undefined)) ?
                    fields + ',' + value : value;
                $('#fields').prop('value', newFields);
                $('#results').attr('data-fields', newFields);
            } else {
                if ((fields.indexOf(',') == -1) && (fields == value)) {
                    $('#fields').prop('value', '');
                    $('#results').attr('data-fields', '');
                } else {
                    var fieldAry     = (fields.indexOf(',') != -1) ? fields.split(',') : [fields];
                    var newFieldsAry = [];
                    for (var i = 0; i < fieldAry.length; i++) {
                        if (fieldAry[i] != value) {
                            newFieldsAry.push(fieldAry[i]);
                        }
                    }
                    $('#fields').prop('value', newFieldsAry.join(','));
                    $('#results').attr('data-fields', newFieldsAry.join(','));
                }
            }

        }
    },

    // Method to show input field in
    showInput : function() {
        popUi.hideAllInputs();

        $(this).hide();

        var id    = $(this).parent().prop('id');
        var width = parseFloat($('#' + id).css('width'));
        $('#' + id + ' > input').css('width', (width - 25) + 'px');
        $('#' + id + ' > input').css('display', 'inline-block');
        $('#' + id).css('width', width + 'px');

        $('#' + id + ' > input').keyup(function(){
            $('#' + id + ' > span')[0].innerHTML = $(this).val();
        });

        $('#' + id + ' > input').focus();
    },

    // Method to hide all inputs
    tabToNextInput : function(e) {
        if (e.which == 9) {
            if ($(this)[0].defaultValue != $(this).val()) {
                popUi.saveEdit();
            }

            popUi.hideAllInputs();

            var tabindex = (e.shiftKey) ? parseInt($(this).attr('tabindex')) - 1 : parseInt($(this).attr('tabindex')) + 1;

            if ($('input[tabindex="' + tabindex.toString() + '"')[0] != undefined) {
                var id = $('input[tabindex="' + tabindex.toString() + '"').parent().prop('id');
                var width = parseFloat($('#' + id).css('width'));
                $('#' + id + ' > span').hide();
                $('#' + id + ' > input').css('width', (width - 25) + 'px');
                $('#' + id + ' > input').css('display', 'inline-block');
                $('#' + id).css('width', width + 'px');

                $('#' + id + ' > input').keyup(function(){
                    $('#' + id + ' > span')[0].innerHTML = $(this).val();
                });
                $(this).blur(function(){
                    $('#' + id + ' > input').focus();
                });

            }
        }
    },

    // Method to hide all inputs
    hideAllInputs : function() {
        $('#results > tbody > tr > td > span').show();
        $('#results > tbody > tr > td > input').hide();
    },

    // Method to save current edit
    saveEdit : function() {
        var id      = $(':focus').data('id');
        var field   = $(':focus').prop('name');
        var value   = $(':focus').val();
        var url     = $('#results').attr('data-url');
        var apiKey  = popUi.getCookie('api_key');
        var headers = (apiKey != '') ? { 'Authorization' : 'Bearer ' + apiKey} : {};
        var data    = {};

        $(':focus')[0].defaultValue = value;
        data[field] = value;

        $.ajax({
            dataType: 'json',
            method: 'PUT',
            headers: headers,
            contentType: 'application/json',
            url:  url + '/' + id,
            data: JSON.stringify(data)
        }).fail(popUi.showError);
    },

    // Method to check if value is truly empty
    isEmpty : function(value) {
        return ((value == undefined) || (value == null) || (value == '') ||
            (value == 'undefined') || (value == 'null'));
    },

    // Method to get query parameters
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
                var v  = decodeURIComponent(gV[1]);

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

    setCookie : function(name, value, options) {
        if (typeof value != 'string') {
            if (typeof value == 'number') {
                value = value.toString();
            } else {
                value = JSON.stringify(value);
            }
        }
        var cookie = name + '=' + encodeURI(value);

        // Parse options
        if (options != undefined) {
            cookie += (options.domain != undefined) ? ';domain=' + options.domain : '';
            cookie += (options.path != undefined) ? ';path=' + options.path : '';
            if (options.expire != undefined) {
                var expdate = new Date();
                expdate.setDate(expdate.getDate() + options.expire);
                cookie += ';expires=' + expdate.toGMTString();
            }
        }

        // Set the cookie.
        document.cookie = cookie;

        return this;
    },

    // Method to get cookie
    getCookie : function(name) {
        var value = '';

        // If the cookie is set, parse the value.
        if (document.cookie.length > 0) {
            if (name == null) {
                value = {};
                var ary = document.cookie.split(';');
                for (var i = 0; i < ary.length; i++) {
                    var a = ary[i].trim().split('=');
                    var n = a[0];
                    var v = decodeURI(a[1]);
                    if ((v.indexOf('{') != -1) || (v.indexOf('[') != -1)) {
                        v = JSON.parse(decodeURIComponent(v));
                    }
                    value[n] = v;
                }
            } else {
                var start = document.cookie.indexOf(name + '=');

                if (start != -1) {
                    start = start + name.length + 1;
                    var end = document.cookie.indexOf(';', start);
                    if (end == -1) {
                        end = document.cookie.length;
                    }

                    value = decodeURI(document.cookie.substring(start, end));
                    if ((value.indexOf('{') != -1) || (value.indexOf('[') != -1)) {
                        value = JSON.parse(decodeURIComponent(value));
                    }
                }
            }
        }

        return value;
    },

    removeCookie : function(name) {
        if (name == null) {
            var c = this.load();
            for (var n in c) {
                this.save(n, '', {"expire" : -1});
            }
        } else {
            this.save(name, '', {"expire" : -1});
        }

        return this
    },

    // Method to determine sort parameter
    getSort : function(sort) {
        if (popUi.getQuery('sort') == sort) {
            sort = (sort.substring(0, 1) == '-') ? sort.substring(1) : '-' + sort;
        }
        return sort;
    },

    // Method to detect if the page is scroll-enabled
    isScroll : function() {
        return (popUi.getQuery('scroll') == undefined);
    },

    // Method to convert case
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
    },

    showError : function(xhr) {
        var json = JSON.parse(xhr.responseText);
        $('#results').hide();
        $('#no-results').hide();
        $('#error > h4.error')[0].innerHTML = 'Error: ' + json.error;
        $('#error').show();
    }
};

$(document).ready(function(){
    if ($('#results')[0] != undefined) {
        var searchFor = (!popUi.isEmpty(popUi.getQuery('search_for'))) ? popUi.getQuery('search_for') : null;
        var searchBy  = (!popUi.isEmpty(popUi.getQuery('search_by'))) ? popUi.getQuery('search_by') : null;

        if ((searchFor != null) && (searchBy != null)) {
            $('#results').attr('data-filter', searchBy + '+LIKE+' + searchFor + '%25');
        }

        // Fetch initial result set
        popUi.fetchResults();

        // On window scroll, fetch the next page
        if (popUi.isScroll()) {
            $(window).scroll(function() {
                if (($(window).height() + $(window).scrollTop()) == $(document).height()) {
                    if (parseInt($('#total-count')[0].innerHTML) > $('#results > tbody > tr').length) {
                        $('#loading').css('background-image', 'url(/assets/img/loading.gif)');
                        $('#loading').show();

                        var page     = $('#results').attr('data-page');
                        page         = parseInt(page) + 1;
                        popUi.bottom = false;

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
            $('#limit').change(popUi.fetchSearch);

            $('#scroll-top > a').click(function(){
                $('html, body').animate({scrollTop : 0}, 500);
                return false;
            });
        }

        // On ESC
        $(document).keydown(function(e){
            if ((e.which == 27) || (e.which == 13)) {
                if ($(':focus')[0].defaultValue != $(':focus').val()) {
                    popUi.saveEdit();
                }
                popUi.hideAllInputs();
            }
        });
    }
});