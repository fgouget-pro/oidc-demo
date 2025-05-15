import express from 'express';
import {nanoid} from 'nanoid';
import cookieParser from 'cookie-parser';
import config from './config.js';
const COOKIE_SECRET = config.cookie_secret
const AUTH_ENDPOINT = config.auth_endpoint
const CLIENT_ID = config.client_id
const CLIENT_SECRET = config.client_secret

const app = express()
app.use(express.urlencoded())
app.use(cookieParser(COOKIE_SECRET))
app.set('views', './views');
app.set('view engine', 'ejs');


app.get("/", (req, res) => {
    const state = nanoid(15)
    res.cookie("state", state, {signed: true})
    let query = new URLSearchParams({
        client_id: CLIENT_ID,
        redirect_uri: config.redirect_uri,
        response_mode: config.response_mode,
        response_type: config.response_type,
        scope: config.scope,
        state
    })
    res.render("login.ejs", {link_url:`${AUTH_ENDPOINT}?${query.toString()}`})
    // res.send("<a href=\"\">Login With OIDC PROVIDER</a>")
})

app.post(`/${config.redirect_path}`, async (req, res) => {
    console.log(req.body)
    if (!req.signedCookies || !req.signedCookies.state){
        throw new Error ("Unable to find state")
    }
    if (!req.body.state){
        throw new Error ("No state in body")
    }
    if (req.body.state !== req.signedCookies.state){
        throw new Error ("States don't match!")
    }
    
    let req_body = {
        code: req.body.code,
        state: req.body.state,
        client_secret: config.client_secret,
        client_id: config.client_id,
        grant_type: config.grant_type,
        redirect_uri: config.redirect_uri
    }

    const response = await fetch(config.token_endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams(req_body).toString()
    })
    
    const data = await response.json();

    let token = data.id_token
    let [t1, t2, signature] = token.split('.')
    data.p1 = atob(t1)
    data.p2 = atob(t2)
    data.signature = signature
    res.render("oidc_redirect_demo.ejs", { body:req.body, data })
})

app.listen(config.app_port, function (err) {
    if (err) console.log(err)
    console.log(`Application is listening on port ${config.app_port}!`);
});


// nodemon client.js