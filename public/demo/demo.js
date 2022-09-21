var Demo = {};
(async function () {
    "use strict";

    let envs = await fetch("/api/envs", {}).then((resp) => resp.json());
    //envs.APP_BASE_URL = "https://intuit-demo.duckdns.org";

    function main() {
        let query = getQueryParams();
        let intuitAccessToken = getIntuitAccessToken(query);
        let intuitRealmId = getIntuitRealmId(query);

        authorizeDemoUrls(intuitAccessToken, intuitRealmId);
        authorizeProxyUrlOnChange(intuitAccessToken, intuitRealmId);

        Demo.updateProxyUrl = function (ev) {
            document.querySelector("[name='intuit-proxy']").value =
                ev.target.innerText;

            authorizeProxyUrl(intuitAccessToken, intuitRealmId);
        };
    }

    function getQueryParams() {
        // #/?foo=bar => foo=bar
        let search = document.location.hash.slice(1).replace(/^\/?\??/, "");
        let params = new URLSearchParams(search);
        let query = {};
        params.forEach(function (v, k) {
            query[k] = v;
        });

        return query;
    }

    function getIntuitAccessToken(query) {
        if (!query.intuit_access_token) {
            let err = new Error("missing intuit_access_token");
            window.alert(err.message);
            document.location.href = "/";
            throw err;
        }

        return query.intuit_access_token;
    }

    function getIntuitRealmId(query) {
        if (!query.intuit_realm_id) {
            let err = new Error("missing intuit_realm_id");
            window.alert(err.message);
            throw err;
        }

        return query.intuit_realm_id;
    }

    function authorizeDemoUrls(intuitAccessToken, intuitRealmId) {
        document.querySelectorAll("[data-href]").forEach(function ($el) {
            $el.href = `${$el.dataset.href}?intuit_access_token=${intuitAccessToken}&intuit_realm_id=${intuitRealmId}`;
        });
    }

    function authorizeProxyUrlOnChange(intuitAccessToken, realmId) {
        document
            .querySelector("[name='intuit-proxy']")
            .addEventListener(
                "change",
                createAuthorizeProxyUrl(intuitAccessToken, realmId)
            );
    }

    function authorizeProxyUrl(intuitAccessToken, intuitRealmId) {
        // foo => /foo
        // /foo => /foo
        let path = document
            .querySelector("[name='intuit-proxy']")
            .value.replace(/^\/?/, "/");

        let url = new URL(`${envs.APP_BASE_URL}/api/intuit/proxy${path}`);
        document.querySelector("[data-name='intuit-proxy']").href =
            url.toString();

        url.searchParams.append("intuit_access_token", intuitAccessToken);
        url.searchParams.append("intuit_realm_id", intuitRealmId);
        document.querySelector("[data-name='intuit-proxy']").href =
            url.toString();
    }

    function createAuthorizeProxyUrl(intuitAccessToken, intuitRealmId) {
        return function () {
            return authorizeProxyUrl(intuitAccessToken, intuitRealmId);
        };
    }

    main();
})();
