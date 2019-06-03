/*******************************************************************************
 * Copyright (c) 2019 sensinov (www.sensinov.com)
 * 41 Rue de la découverte, 31676 Labège, France
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     Mahdi Ben Alaya (Project co-founder) - Management and initial specification,
 *         design, implementation, test and documentation.
 *     Ghada Gharbi (Project co-founder) - Management and initial specification,
 *         design, implementation, test and documentation.
 * Authors: 
 * 		Ghada Gharbi < ghada.gharbi@sensinov.com >
 ******************************************************************************/

const express = require ('express');
var subscriptionValidator = require('../models/subscriptionModel'); 
var configPath = require ('../config/config'); 
const mongo = require('../lib/mongo'); 
const db=mongo.getdb(); 


const router = express.Router();

//Subscriptions management 
router.get(configPath.basePath+'/subscriptions', function(req, res) {
	db.collection('subscriptions').find().project({_id:0}).toArray(function (err, result){ 
		if (err) {
			return console.log(err);
		} else {
			res.status(200);
			res.send(result);
		}
  	})
});

router.get(configPath.basePath+'/subscriptions/:subscriptionId',function(req, res) {
	db.collection('subscriptions').find({'id': req.params.subscriptionId}).project({_id:0}).toArray(function (err, result){ 
		if (err) {
			return console.log(err);
		} else {
			res.status(200);
			res.send(result);
		}
	})
});  

function subscriptionExistsInDB (id, req, res) {
    db.collection('subscriptions').find({'id': id}).toArray(function(err, results) {
        if (results.length > 0) {
            res.status(409); 
            res.send('Resource already exists'); 
        } else {
            db.collection('subscriptions').insertOne(req.body, function (err, result) {
                if (err) {
                    return console.log(err);
                } else {
                    res.status(201);
                    res.send(req.body);
                }
            }); 
        }
    }); 
}

router.post(configPath.basePath+'/subscriptions', function (req, res) {
    let verdict = subscriptionValidator.subscriptionValidator(req.body); 
    if (!verdict.correct) {
        res.status(404); 
        res.send('Invalid Request - wrong content: ' + verdict.errorMsg);
    } else {
        let id=req.body.id;  
        subscriptionExistsInDB (id, req, res); 
    }
}); 

//PATCH /subscriptions/{subscriptionId}
//Subscription fragment including id, type and any another subscription filed to be changed 
router.patch(configPath.basePath+'/subscriptions/:subscriptionId/attrs', function (req, res) {
    var updateObject = req.body; 
    db.collection('subscriptions').updateOne({'id' : req.params.entityId}, {$set: updateObject}, function (err, result) {
	if (err) return console.log(err)
	res.status(204)
	res.send({message: '204 No Content'})
    })
});

router.delete(configPath.basePath+'/subscriptions/:subscriptionId', function (req, res) {
  	 db.collection('subscriptions').findOneAndDelete({'id': req.params.subscriptionId}, (err, result) => {
    		if (err) return res.send(500, err)
		res.status(204)
    		res.send({message: '204 No Content'})
  	})
});

module.exports = router; 