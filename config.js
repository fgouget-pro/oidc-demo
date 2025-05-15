let config = {
    // OIDC SET UP
    client_id: "oidcCLIENT",
    client_secret: "Some_super_secret",
    response_type: "code",
    response_mode: "form_post",
    scope: "openid",
    
    // APP SERVER INFO
    app_port: "8080",
    app_base_server: "http://localhost",
    redirect_path: "oidc_redirect",
    cookie_secret: 'SUPER_SECRET_SECRET',

    // OIDC SERVER INFO
    oidc_base_server: "http://localhost",
    oidc_port: "3000",
    oidc_path: "oidc",
}
config.app_server = `${config.app_base_server}:${config.app_port}`
config.oidc_server = `${config.oidc_base_server}:${config.oidc_port}`
config.redirect_uri = `${config.app_server}/${config.redirect_path}`
config.auth_endpoint = `${config.oidc_server}/${config.oidc_path}/auth`

export default config
