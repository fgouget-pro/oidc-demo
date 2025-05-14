import express from 'express';

const app = express()

app.get("/", (req, res) => {
    res.send("<h1>hello world</h1>")
})

app.listen(3001, function (err) {
    if (err) console.log(err)
    console.log('OIDC is listening on port 3001!');
});


// nodemon provider.ts