
function genericListSearch(url, done, fail) {
    $.get({
        url: url
        //async: false
    }).done(function (result) {
        done(result);
    }).fail(function (result) {
        fail(result);
    });
}

function genericSaveItem(url, item, done, fail) {
    $.post({
        url: url,
        data: item,
        async: false,
        contentType: "application/json; charset=utf-8"
    }).done(function (result) {
        done(result);
    }).fail(function (result) {
        fail(result);
    });
}

function genericSaveItemAsync(url, item, done, fail) {
    $.post({
        url: url,
        data: item,
        contentType: "application/json; charset=utf-8"
    }).done(function (result) {
        done(result);
    }).fail(function (result) {
        fail(result);
    });
}

function genericUploadFile(url, data, done, fail) {
    $.post({
        url: url,
        data: data,
        async: false,
        processData: false,
        contentType: false
    }).done(function (result) {
        done(result);
    }).fail(function (result) {
        fail(result);
    });
}

function genericDeleteItem(url, itemId, done, fail) {
    bootbox.confirm({
        size: "small",
        message: "Seguro desea eliminar?",
        buttons: {
            confirm: {
                label: 'Eliminar',
                className: 'btn btn-sm btn-danger'
            },
            cancel: {
                label: 'Cancelar',
                className: 'btn btn-sm btn-link'
            }
        },
        callback: function (yes) {
            if (yes) {
                $.ajax({
                    url: url + "/" + itemId,
                    method: "DELETE"
                }).done(function () {
                    done();
                }).fail(function (result) {
                    fail(result);
                });
            }
        }
    });
}

function genericBootboxConfirm(message, confirmLabel, confirmClass, cancelLabel, cancelClass, callbackFunction){
    bootbox.confirm({
        size: "small",
        message: message,
        buttons: {
            confirm: {
                label: confirmLabel,
                className: confirmClass
            },
            cancel: {
                label: cancelLabel,
                className: cancelClass
            }
        },
        callback: function (yes) {
            if (yes) {
                callbackFunction();
            }
        }
    });
}

function genericRestoreItem(url, itemId, done, fail) {
    $.ajax({
        url: url + "/" + itemId,
        method: "DELETE"
    }).done(function () {
        done();
    }).fail(function (result) {
        fail(result);
    });
}

function genericDeleteItems (url, items, done, fail) {
    bootbox.confirm({
        size: "small",
        message: "Seguro desea eliminar estos elementos?",
        buttons: {
            confirm: {
                label: 'Eliminar',
                className: 'btn btn-danger'
            },
            cancel: {
                label: 'No',
                className: 'btn btn-link'
            }
        },
        callback: function (yes) {
            if (yes) {
                $.post({
                    url: url,
                    data: items,
                    //async: false,
                    contentType: "application/json; charset=utf-8"
                }).done(function () {
                    done();
                }).fail(function (result) {
                    fail(result);
                });
            }
        }
    });
}
