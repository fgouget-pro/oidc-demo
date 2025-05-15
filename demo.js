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

app.post(`/${config.redirect_path}`, (req, res) => {
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
    res.send("Hello World")
})

app.listen(config.app_port, function (err) {
    if (err) console.log(err)
    console.log(`Application is listening on port ${config.app_port}!`);
});


// nodemon client.js