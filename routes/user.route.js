const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const route = express.Router();

const userModel = require('../model/user.model');
const isAuthenticated = require('../middleware/auth');

route.post('/register', async (req, res) => {
    // res.send("Registerion on process");
    try {
        const {name, email, password} = req.body;

        if (!name || !email || !password) {
            return res.json({message: "Please enter all the details"});
        }

        const isUserExist = await userModel.findOne({email: req.body.email});

        if (isUserExist) {
            return res.json({message: 'User already exists with the given email id'});
        }

        // PASSWORD HASHING
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(req.body.password, salt);
        req.body.password = hashPassword;
        const user = userModel(req.body);
        await user.save();
        const token = await jwt.sign({id: user._id}, process.env.SECRET_KEY, {
            expiresIn: process.env.JWT_EXPIRE,
        });

        return res.cookie({'token': token}).json({success: true, message: 'User registered successfully', data: user});
    } catch (error) {
        return res.json({error: error});
    }
});

route.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body;

        if (!email || !password) {
            return res.json({message: 'Please enter all the details'});
        }

        const isUserExist = await userModel.findOne({email: req.body.email});

        if (!isUserExist) {
            return res.json({message: 'Wrong Credentials'});
        }

        const isPasswordMatched = await bcrypt.compare(password, isUserExist.password);

        if (!isPasswordMatched) {
            return res.json({message: 'Wrong Credentials'});
        }

        const token = await jwt.sign({id: isUserExist._id}, process.env.SECRET_KEY, {
            expiresIn: process.env.JWT_EXPIRE,
        });

        return res.cookie("token", token).json({success: true, message: "Login Successful"});
    } catch (error) {
        return res.json({error: error});
    }
});


route.get('/user', isAuthenticated, async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id);

        if (!user) {
            return res.json({message: 'No user found'});
        }

        return res.json({user: user});
    } catch (error) {
        return res.json({error: error});
    }
})

module.exports = route;