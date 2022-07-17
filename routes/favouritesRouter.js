const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favourites = require('../models/favourites');

const favouritesRouter = express.Router();
favouritesRouter.use(bodyParser.json());

favouritesRouter.route('/')
.options(cors.corsWhithOptions, (req, res) => {res.sendStatus(200); }) 
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Favourites.findOne({user: req.user._id})
    .populate('user')
    .populate('dishes')
    .then((favourites) => {
        if(favourites === null){
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            var err = new Error('No favourites found!');
            return next (err);
        }
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favourites);

    }, (err) => next(err))
    .catch((err) => next(err));

})
.post(cors.corsWhithOptions, authenticate.verifyUser, (req,res,next) => {
    Favourites.findOne({user: req.user._id})
    .then((favourites) => {
        if (favourites === null){
            Favourites.create({ 
                user: req.user._id, 
                dishes: req.body
            })
            .then((favourites) => {
                console.log('Favourite Created', favourites);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favourites);
            }, (err) => next(err))
        }
        else {
            req.body.forEach((value) =>{
                if(favourites.dishes.indexOf(value) == -1) {
                    favourites.dishes.push(value);
                }
            })
            favourites.save()
            .then((favourites) => {
                Favourites.findOne({user: req.user._id})
                .populate('user')
                .populate('dishes')
                .then((favourites) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favourites)
                })
            })
        }
    }, (err) => next(err))
    .catch((err) => next(err))
})
.delete(cors.corsWhithOptions, authenticate.verifyUser, (req,res,next) => {
    Favourites.remove({user: req.user._id})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
})


favouritesRouter.route('/:dishId')
.options(cors.corsWhithOptions, (req, res) => {res.sendStatus(200); }) 
.post(cors.corsWhithOptions, authenticate.verifyUser, (req,res,next) => {
    Favourites.findOne({user: req.user._id})
    .then((favourites) => {
        if(favourites.dishes.indexOf(req.params.dishId) == -1) {
            favourites.dishes.push(req.params.dishId);
        }
        favourites.save()
        .then((favourites) => {
            Favourites.findOne({user: req.user._id})
            .then((favourites) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favourites)
            })
        })
    }, (err) => next(err))
    .catch((err) => next(err))
})
.delete(cors.corsWhithOptions, authenticate.verifyUser, (req,res,next) => {
    Favourites.findOne({user: req.user._id})
    .then((favourites) => {
        const index = favourites.dishes.indexOf(req.params.dishId);
        if (index > -1) {
            favourites.dishes.splice(index, 1);
        }
        favourites.save()
        .then((resp) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
        })
    }, (err) => next(err))
    .catch((err) => next(err));
})

module.exports = favouritesRouter;
