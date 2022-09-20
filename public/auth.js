(async function () {
    "use strict";

    let envs = await fetch("/api/envs", {}).then((resp) => resp.json());
    //envs.APP_BASE_URL = "https://intuit-demo.duckdns.org";
    //envs.APP_AUTH_REDIRECT = "/api/webhooks/intuit/oauth2";
    //envs.INTUIT_CLIENT_ID = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";

    let crypto = window.crypto;
    let intuitScopes = [
        //"com.intuit.quickbooks.payment",
        "com.intuit.quickbooks.accounting",
        "openid",
        "profile",
        "email",
        //"phone",
        //"address",
    ];

    let baseUrl = "https://appcenter.intuit.com/connect/oauth2";
    let state = crypto.randomUUID();

    let search = new URLSearchParams({
        client_id: envs.INTUIT_CLIENT_ID,
        scope: intuitScopes.join(" "),
        redirect_uri: `${envs.APP_BASE_URL}${envs.APP_AUTH_REDIRECT}`,
        response_type: "code",
        state: state,
    }).toString();

    document.querySelector(
        "a[data-name='connect-to-quickbooks']"
    ).href = `${baseUrl}?${search}`;
})();
