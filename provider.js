import express from 'express';
import * as oidcProvider from 'oidc-provider';
import config from './config.js';
 console.log(config)

const app = express();
const client_id = config.client_id
const client_secret = config.client_secret
const configuration = {
    clients: [{
        client_id,
        client_secret,
        grant_types: ["authorization_code", "refresh_token"],
        redirect_uris: [config.redirect_uri],
        response_types: [config.response_type],
    }],
    pkce: {
        required: () => false,
    },
    async findAccount(ctx, id) {
        return {
            accountId: id,
            async claims(use, scope) {
                return { sub: id, name: "myUser" };
            },
        };
    },
    clientBasedCORS: () => true
};
// function handleClientAuthErrors(_, err) {
//     console.log(err)
// }

const oidc = new oidcProvider.Provider(config.oidc_server, configuration);
// oidc.on("grant.error", handleClientAuthErrors);
// oidc.on("introspection.error", handleClientAuthErrors);
// oidc.on("revocation.error", handleClientAuthErrors);
app.use(`/${config.oidc_path}`, oidc.callback());

app.listen(config.oidc_port, function () {
    console.log(`OIDC is listening on port ${config.oidc_port}!`);
});

// http://localhost:3000/oidc/.well-known/openid-configuration