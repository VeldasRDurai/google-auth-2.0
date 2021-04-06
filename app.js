const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();

const {OAuth2Client} = require('google-auth-library');
const CLIENT_ID = process.env.CLIENT_ID ;
const client = new OAuth2Client(CLIENT_ID);

async function verify( token ) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    console.log(payload);
    return payload;
}

function cheakAuthenticatied( req , res , next ){
    let token = req.cookies['session-token'];
    verify(token)
    .then( ( payload ) => {
        req.user = payload;
        next();
    })
    .catch( e => {
        res.redirect('/log-in');
    });
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

app.post('/log-in' , (req,res) => {
    let token = req.body.token;
    console.log(token);
    verify(token)
    .then( () => {
        res.cookie('session-token',token);
        res.send('success');
    })
    .catch(console.error);
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