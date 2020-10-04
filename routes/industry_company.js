const express = require("express");
const router = express.Router();
const db = require("../db.js");
const ExpressError = require("../expressError.js");

/**
 * Add a new industry & company association
 */
router.post('/', async ( req, res, next ) => {
  try {
    const { ind_code, comp_code } = req.body;
    const results = await db.query(`INSERT INTO industry_company (ind_code, comp_code) VALUES ($1, $2) RETURNING *`, [ind_code, comp_code] )
    return res.json({"industry-company": results.rows})
  } catch (error) {
    return next(error)
  }
})


module.exports = router; 