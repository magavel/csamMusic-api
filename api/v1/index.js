const express = require('express');
const router = express.Router();
const Partition = require('../models/partition');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const mongoose = require('mongoose');


router.get('/ping', (req, res) => {
    res.status(200).json({ msg: 'pong', date: new Date() });
});
//////////////////          //////////////              /////////////
//://               configuration de multer                        //


//configuration des uploads des files
const storagePartition = multer.diskStorage({
    destination: './upload/partitions/',
    filename: function (req, file, callback) {
        crypto.pseudoRandomBytes(16, (err, raw) => {
            if (err) return callback(err);
            //callback(null, raw.toString('hex') + path.extname(file.originalname));
            lastUploadesPartition = raw.toString('hex') + path.extname(file.originalname);
            console.log('lastUploadesPartition ', lastUploadesPartition)
            callback(null, lastUploadesPartition);
        });
    }
});
//configuration des uploads des files
const storageImage = multer.diskStorage({
    destination: './upload/images/',
    filename: function (req, file, callback) {
        crypto.pseudoRandomBytes(16, (err, raw) => {
            if (err) return callback(err);
            callback(null, raw.toString('hex') + path.extname(file.originalname));
        });
    }
});
//configuration des uploads des files
const storageAbcFile = multer.diskStorage({
    destination: './upload/abcFiles/',
    filename: function (req, file, callback) {
        crypto.pseudoRandomBytes(16, (err, raw) => {
            if (err) return callback(err);
            callback(null, raw.toString('hex') + path.extname(file.originalname));
 
        });
    }
});


const uploadPartition = multer({ storage: storagePartition });
const uploadImage = multer({ storage: storageImage });
const uploadAbcFile = multer({ storage: storageAbcFile });

let lastUploadesPartition = '';



//file upload
/**
 * route upload des partitions
 */
router.post('/partitions/files', uploadPartition.single('partitionFile'), (req, res) => {
    if (!req.file.originalname.match(/\.(pdf|jpg|jpeg|png)$/)) {
        res.status(400).json({ message: 'Seul les fichiers pdf, jepg, jpg, png sont authorisés' });
    }
    res.status(201).send({ filename: req.file.filename, file: req.file });
    console.log(req.file.filename);
    // req.files is array of `photos` files
    // req.body will contain the text fields, if there were any
});


/**
 * route upload des images
 */
router.post('/partitions/images', uploadImage.single('imageFile'), (req, res) => {
    res.status(201).send({ filename: req.file.filename, file: req.file });
    // req.files is array of `photos` files
    // req.body will contain the text fields, if there were any
});

/**
 * route d'upload des fichiers abc
 */
router.post('/partitions/abc', uploadAbcFile.single('abcFile'), (req, res) => {
    if (!req.file.originalname.match(/\.(abc)$/)) {
        res.status(400).json({ message: 'Seul les fichiers abc sont authorisés' });
    }
    res.status(201).send({ filename: req.file.filename, file: req.file });
    // req.files is array of `photos` files
    // req.body will contain the text fields, if there were any
});



/////////////         FIN GESTION FICHIERS                ///////////////


/**
 * Creation d'une partition
 */
router.post('/partitions', (req, res) => {
    console.log('req.body', req.body);
    //const partition = new Partition(req.body);
    //on eclate le req.body et on ecrase  le file avec le nom du fichier
    const partition = new Partition( {...req.body, partitionFile: lastUploadesPartition, abc: 'test'});
    partition.save((err, blogPost) => {
        if (err) {
            return res.status(500).json(err);
        }
        res.status(201).json(blogPost);
    });
});

/**
 * get de toutes les partitions
 */
router.get('/partitions', (req, res) => {
    console.log('req.user', req.user);
    Partition.find()                                               // methode qui renvoie tous les articles a chainer avec .exec si pad de cb ds le .find
        .sort({ 'createdOn': -1 })                                    //le tri avec .sort à -1 permet de trier du plus récent vers le plus vieux
        .exec()                                                     // il faut mettre exec car on n'a pas mis de call back ds le find()
        .then(blogPost => res.status(200).json(blogPost))
        .catch(err => res.status(500).json({
            message: 'partition non trouvée...',
            error: err
        }));                                                        // comme c'est une prmesse on met .then qui nous retourne une cb avec blogpost en param . on renvoie un status 200 et le json en blogpost
});

/**
 * get d'une partition par ID
 */
router.get('/partitions/:id', (req, res) => {
    const id = req.params.id;                             //on recupere l'id avec params qui recupere tout les parametre de l'url
    Partition.findById(id)
        .then(blogPost => res.status(200).json(blogPost))                                     //si les choses de sont bien passées on récupere un element que l'on nomme blogpost ds le .then ce blogpost est envoyé ds la reponse en json
        .catch((err) => {
            res.status(500).json({
                msg: 'partition non trouvée',
                err
            });
        });                               //si les choses se passent mal
});

/**
 * Update partition
 */
router.put('/partitions/:id', uploadPartition.single('partitionFile'), (req, res)=>{
    const id = req.params.id;
    const condition = { _id:id };
    //on ajoute au req.body le dernier fichier téléchargé.
    const partition = {...req.body, partitionFile: lastUploadesPartition };
    // $set permet d'attribuer une valeur a une variable
    const update = { $set: partition};

    //pour mongo db on utilise upsert ==> update-inserte pour dir que si
    // le document n'existe pas on le créé.
    const options = {
        upsert: true,               //s'il nexiste pas on le crée
        new:true                    // retourne à l'utilisateur le document une fois modifié
    };
    Partition.findOneAndUpdate(condition, update, options, (err, response)=>{
        if(err) return res.status(500).json({msg:'pb update partition', err});
        res.status(200).json({msg: `partition ${id} mise à jour`, response})
    });
});







/**
 * Suppression d'un fichier par ID
 */
router.delete('/partitions/:id', (req, res) => {
    const id = req.params.id;
    Partition.findByIdAndDelete(id, (err, blogPost) => {
        if (err) {
            return res.status(500).json(err);
        }
        res.status(202).json({ msg: `la partition pour id ${blogPost._id} a été supprimée` });
    });
});


/**
 * suppression de plusiuers ids
 */
router.delete('/partitions', (req, res) => {
    //  http://localhost:3000/api/v1/partitions?ids=5c1133b8225e420884687048,5c1133b6225e420884687047
    const ids = req.query.ids;
    console.log('query allIds', ids);
    const allIds = ids.split(',').map(id => {
        // casting as a mongoose ObjectId	
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            return mongoose.Types.ObjectId((id));
        } else {
            console.log('id is not valid', id);
            return -1;


        }
    });
    const condition = { _id: { $in: allIds } };
    Partition.deleteMany(condition, (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }
        res.status(202).json(result);
    });
});

module.exports = router;