const express = require("express");
const router = express.Router();
const db = require("../db.js");
const ExpressError = require("../expressError.js");

/**
 * Return list of all industries
 * 
 */
router.get('/', async (req, res, next ) => {
  try {
    const results = await db.query('SELECT code, industry FROM industries')
    return res.json({"industries": results.rows})
  } catch (error) {
    return next(error)
  }
})

/**
 * Add a new industry to industries table
 */
router.post('/', async ( req, res, next ) => {
  try {
    const { code, industry } = req.body;
    const results = await db.query(`INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING *`, [code, industry] )
    return res.json({"industry": results.rows})

  } catch (error) {
    return next(error)
  }
})

module.exports = router; 