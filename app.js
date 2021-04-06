const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();

const {OAuth2Client} = require('google-auth-library');
const CLIENT_ID = process.env.CLIENT_ID ;
const client = new OAuth2Client(CLIENT_ID);

const verify = async (token) => {
    const ticket = await client.verifyIdToken({ idToken: token , audience: CLIENT_ID });
    const payload = ticket.getPayload();
    return payload;
}

const cheakAuthenticatied = async ( req , res , next ) => {
    try {
        let token = req.cookies['session-token'];
        req.user = verify(token);
        next()
    } catch ( e ) { res.redirect('/log-in'); }
}

const PORT = process.env.PORT || 3000 ;

app.set("view engine" , "ejs");
app.use(express.json());
app.use(cookieParser());

app.get('/',(req,res) => {
    res.send('server working...');
});

app.get('/log-in', (req,res) => {
    res.render('log-in');
});

app.post('/log-in' , async (req,res) => {
    try {
        let token = req.body.token;
        // console.log(token);
        await verify(token);
        res.cookie('session-token',token);
        res.send('success');
    } catch (e) { res.send(e); }
});

app.get('/profile', cheakAuthenticatied , (req,res) => {
    res.render('profile', req.user );
});

app.get('/log-out', (req,res) => {
    res.clearCookie('session-token');
    res.redirect('/log-in');
})

app.listen( PORT , () => {
    console.log("Server started at port 3000");
});