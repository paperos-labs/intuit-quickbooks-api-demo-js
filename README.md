# intuit-quickbooks-api-demo-js

A simple demo of the Intuit QuickBooks API getting Profit &amp; Loss statements

## TL;DR

```bash
git clone git@github.com:savvi-legal/intuit-quickbooks-api-demo-js.git
pushd ./intuit-quickbooks-api-demo-js/
npm ci
```

Then edit the configs and run the demo:

```sh
npm start
```

```sh
caddy run -conf ./Caddyfile
```

Try it out at <https://YOUR_DEMO_DOMAIN.duckdns.org> or <https://localhost> (with caddy), or <http://localhost:3726> (node only).

## Setup

0. Install [node](https://webinstall.dev/node) and [caddy](https://webinstall.dev/caddy) \
    ```sh
    # On Mac, Linux
    curl -sS https://webi.sh/node | sh
    curl -sS https://webi.sh/caddy | sh
    ```
    ```pwsh
    # On Windows
    curl.exe https://webi.ms/node | powershell
    curl.exe https://webi.ms/caddy | powershell
    ```
    Follow the on-screen instructions.
1. (optional) Get a test domain (via [duckdns.org](https://duckdns.org)
2. Create an app from the "My Apps Dashboard" \
   https://developer.intuit.com/app/developer/myapps
3. Copy `example.env` to `.env` and edit
    - Intuit credentials
    - domain
4. Copy `example.Caddyfile` to `Caddyfile` and edit
    - domain (`localhost` is valid)
    - path to demo repo
5. Create a sandbox company \
   https://developer.intuit.com/app/developer/sandbox
