import express from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {nanoid} from 'nanoid';
import cookieParser from 'cookie-parser';

const AUTH_SERVER = "http://localhost:3000"
const BACKEND_SERVER = "http://localhost:8080"
const TOKEN_ENDPOINT = `${AUTH_SERVER}/oidc/token`
const client_id = "oidcCLIENT"
const grant_type = "authorization_code"
const OIDC_REDIRECT_PATH = "/oidc_redirect"
const redirect_uri = `${BACKEND_SERVER}${OIDC_REDIRECT_PATH}`
const client_secret =  "Some_super_secret"
const auth_method = "client_secret_jwt"
const scope = "openid name"
const COOKIE_SECRET = nanoid()

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
//Middlewares
app.use(express.static(__dirname + '/public'));
app.set('views', join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cookieParser(COOKIE_SECRET))
app.use(express.urlencoded())

app.post(OIDC_REDIRECT_PATH, async (req, res) => {
    console.log(req.body)
    console.log(req.signedCookies)
    if (!req.signedCookies.state){
        throw new Error("No state cookie")
    }
    if (req.signedCookies.state !== req.body.state){
        throw new Error("States mismatch")
    }
    
    let req_body = {
        code: req.body.code,
        state: req.body.state,
        auth_method,
        client_secret,
        client_id,
        grant_type,
        redirect_uri
    }

    const response = await fetch(TOKEN_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(req_body)

    })
    const data = await response.json();
    if (data.id_token){
        var [t1, t2, t3] = data.id_token.split(".")
        data.jwtInfo = atob(t1)
        data.id_info = atob(t2)
        console.log(data.id_info)
    }
//    res.send(req.body)
    res.render("oidc_redirect.ejs", {code: req.body.code, state: req.body.state, data})

})

app.get("/", (req, res) => {
    const state = nanoid(15)
    res.cookie("state", state, {signed:true})
    const query = {
        response_mode: "form_post",
        response_type: "code",
        client_id,
        redirect_uri,
        scope,
        state
    }
    let link = `<a href="${AUTH_SERVER}/oidc/auth?${new URLSearchParams(query).toString()}">Login with oidc provider</a>`

    res.send(link)
})


app.listen(8080, function (err) {
    if (err) console.error(err)
    console.log('Client is listening on port 8080!');
});