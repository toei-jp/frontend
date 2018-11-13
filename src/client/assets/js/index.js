/**
 * パラメーター取得
 * @returns {any}
 */
function getParameter() {
    var result = null;
    var params = location.search.replace('?', '').split('&');
    var result = (location.search === '') ? null : {};
    var transactionId = null;
    for (var i = 0; i < params.length; i++) {
        var param = params[i].split('=');
        var key = param[0];
        var value = param[1];
        if (key && value) {
            result[key] = value;
        }
    }
    return result;
}

(function () {
    var params = getParameter();
    if (params === null) {
        var json = sessionStorage.getItem('parameters');
        if (json === null) {
            return;
        }
        params = JSON.parse(json);
        params.signInRedirect = true;
    } else {
        params.signInRedirect = false;
    }

    sessionStorage.setItem('parameters', JSON.stringify(params));
})();
