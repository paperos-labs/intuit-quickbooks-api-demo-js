"use strict";

require("dotenv").config({ path: ".env" });
require("dotenv").config({ path: ".env.secret" });

let PORT = process.env.PORT || 3726;

let INTUIT_BASE_URL = process.env.INTUIT_BASE_URL;
let INTUIT_CLIENT_ID = process.env.INTUIT_CLIENT_ID;
let INTUIT_CLIENT_SECRET = process.env.INTUIT_CLIENT_SECRET;
let INTUIT_TOKEN_ENDPOINT = process.env.INTUIT_TOKEN_ENDPOINT;
let INTUIT_USERINFO_ENDPOINT = process.env.INTUIT_USERINFO_ENDPOINT;

let APP_BASE_URL = process.env.APP_BASE_URL;
let APP_AUTH_REDIRECT = process.env.APP_AUTH_REDIRECT;
let APP_INTUIT_REDIRECT = process.env.APP_INTUIT_REDIRECT;

let Http = require("http");
let express = require("express");
let request = require("@root/request");
let server = express();

/** @typedef {import('express').Handler} Handler */

/** @type {Handler} */
async function getEnvs(req, res) {
    res.json({
        APP_BASE_URL,
        APP_AUTH_REDIRECT,
        INTUIT_CLIENT_ID,
    });
}

/** @type {Handler} */
async function intuitAuthorize(req, res) {
    let code = req.query.code;
    let realmId = String(req.query.realmId || "");

    let redirectUri = `${APP_BASE_URL}${req.path}`;
    let resp = await request({
        auth: {
            user: INTUIT_CLIENT_ID,
            pass: INTUIT_CLIENT_SECRET,
        },
        method: "POST",
        url: INTUIT_TOKEN_ENDPOINT,
        form: {
            code: code,
            grant_type: "authorization_code",
            redirect_uri: redirectUri,
        },
        json: true,
    });
    if (!resp.ok) {
        console.error("bad oauth2 response body:");
        console.error(resp.body);
        throw new Error("bad oauth2 response");
    }
    //console.log(resp.body);

    let accessToken = String(resp.body.access_token || "");

    // TODO: Set cookie for own access token exchange instead
    let url = new URL(`${APP_BASE_URL}${APP_INTUIT_REDIRECT}`).toString();
    let searchParams = new URLSearchParams({
        intuit_access_token: accessToken,
        intuit_realm_id: realmId,
    }).toString();
    res.statusCode = 302;
    res.setHeader("Location", `${url}?${searchParams}`);
    res.end();
}

/** @type {Handler} */
async function intuitUserinfo(req, res) {
    let intuitAccessToken = req.query.intuit_access_token;
    let resp = await request({
        url: INTUIT_USERINFO_ENDPOINT,
        headers: { Authorization: `Bearer ${intuitAccessToken}` },
        json: true,
    });
    if (!resp.ok) {
        console.error("bad userinfo response body:");
        console.error(resp.body);
        throw new Error("bad userinfo response");
    }

    res.json(resp.body);
}

/** @type {Handler} */
async function intuitPnl(req, res) {
    let intuitAccessToken = req.query.intuit_access_token;
    let intuitRealmId = req.query.intuit_realm_id;

    let d = new Date();
    let startDate = getStartDate(d);
    let endDate = getEndDate(d);

    let pnlSearch = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
        customer: "1",
        minorversion: "65",
    });
    let pnlUrl = `${INTUIT_BASE_URL}/v3/company/${intuitRealmId}/reports/ProfitAndLoss?${pnlSearch}`;
    let resp = await request({
        url: pnlUrl,
        headers: { Authorization: `Bearer ${intuitAccessToken}` },
        json: true,
    });
    if (!resp.ok) {
        console.error("bad pnl response body:");
        console.error(resp.body);
        throw new Error("bad pnl response");
    }

    res.json(resp.body);
}

/**
 * Calculate the last date of the given date's month
 * @param {Date} date
 * @returns {String}
 */
function getEndDate(date) {
    let endDate = new Date(date.toISOString());
    // from next month
    endDate.setUTCMonth(endDate.getUTCMonth() + 1);
    // to the last day of this month
    endDate.setUTCDate(-1 * (endDate.getUTCDate() + 1));

    // "YYYY-MM-DD".length
    return endDate.toISOString().slice(0, 10);
}

/**
 * Calculate the first day of the month 3 months prior to the given date
 * @param {Date} date
 * @returns {String}
 */
function getStartDate(date) {
    let startDate = new Date(date.toISOString());
    // first day of the month
    startDate.setUTCDate(1);
    // count back `n` months (`n + 1` months total)
    startDate.setUTCMonth(startDate.getUTCMonth() - 2);

    return startDate.toISOString().slice(0, 10);
}

/** @type {Handler} */
async function intuitProxy(req, res) {
    let intuitAccessToken = req.query.intuit_access_token;
    let intuitRealmId = req.query.intuit_realm_id || "";

    let proxyPath = req.params["0"];
    //@ts-ignore
    let intuitPath = proxyPath.replace(":realm_id", intuitRealmId);

    let resp = await request({
        url: `${INTUIT_BASE_URL}/${intuitPath}`,
        headers: { Authorization: `Bearer ${intuitAccessToken}` },
        json: true,
    });
    if (!resp.ok) {
        console.error("bad proxy response body:");
        console.error(resp.body);
        throw new Error("bad proxy response");
    }

    res.json(resp.body);
}

let app = require("@root/async-router").Router();
server.set("json spaces", 2);
server.use(app);

app.get("/api/envs", getEnvs);
app.get("/api/intuit/userinfo", intuitUserinfo);
app.get("/api/intuit/pnl", intuitPnl);
app.get("/api/intuit/proxy/*", intuitProxy);
app.get("/api/webhooks/intuit/oauth2", intuitAuthorize);

let httpServer = Http.createServer(server);
httpServer.listen(PORT, function () {
    console.info("Listening on", httpServer.address());
});
