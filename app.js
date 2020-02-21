const express = require('express');
const app = express();
const api = require('./api/v1/index');
const bodyParser = require ('body-parser');
const cors = require('cors');
const chalk = require('chalk');                                             //pour les logs
const mongoose = require ('mongoose');
const connection = mongoose.connection;
const MongoClient = require('mongodb').MongoClient;


const uri = 'mongodb+srv://csam:csam@cluster0-v4vo9.mongodb.net/test?retryWrites=true&w=majority';
const client = new MongoClient(uri, { useNewUrlParser: true });

//chemin des upload
//la methode path permet de concatener le repertoire courant avec un dossier
const uploadPartitionFile = require('path').join(__dirname, 'upload/partitions');

app.set('port', (process.env.port || 3000));                                //permet de configurer un port via la variable env ou par default 3000

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());                                                        // permets à 'lapi d'estre consommé par un client ayant un autre nom de domaine ==> npm cors
app.use((req, res, next)=>{                                                 //creation d'un middlexare maison qui va taguer la requete de l'heure
    console.log(chalk.blue.bgWhiteBright(`la requete est passée à ${new Date()}`));
    next();                                                                             //attention mettre le next() car sinon le processus s'arrete et le serveur tourne
});
app.use(express.static(uploadPartitionFile));

//sur ce middlewar pas besoin de mettre le next car comme c'est le test d'une erreur c'est bloquant ds  tout les cas
/*  app.use((req, res)=>{
    const err= new Error();
    err.status = 404;
    res.json( {msg:'Erreur 404!!!!!!!', err});

    console.log(chalk.red('erreur sur le fichier demandé'));
}); 
 */
const versioApi= '/api/v1';                                                     // on souhaite une requete localhost:3000/api/v1  permet de versionner l'api
app.use(versioApi, api); 

//connexion a la base de données mongo
mongoose.connect('mongodb://localhost:27017/csamPartitions', { useNewUrlParser: true ,useUnifiedTopology: true });

connection.on('error',(err)=>{
    console.log(chalk.red.bgBlueBright(`erreur de connexion mongodb: ${err.message}`));
});

//s'execute une fois
connection.once('open', ()=>{
    console.log(chalk.yellow('ouverture mongo db'));
    //le app.get permet de recuper le app.set ==> donc le env.port
    app.listen(app.get('port'), ()=>{
        //console.log(`express serveur écoute sur ${app.get('port')}`);
        console.log(`cliquer sur : http://localhost:${app.get('port')}${versioApi}`);
    });
});


//pour recharger le srv a chaud on install nodemon
