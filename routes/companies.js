const express = require("express");
const router = express.Router();
const db = require("../db.js");
const ExpressError = require("../expressError.js");

/**
 * Return list of all companies
 * 
 */
router.get('/', async (req, res, next ) => {
  try {
    const results = await db.query('SELECT code, name, description FROM companies ')
    return res.json({"companies": results.rows})
  } catch (error) {
    return next(error)
  }
})

/**
 * Return a specific company
 */
router.get('/:code', async (req, res, next ) => {
  try {
    const { code } = req.params;
    const results = await db.query(`SELECT * FROM companies WHERE code = $1`, [code] );
    if (results.rows.length === 0) throw new ExpressError(`Company: '${code}' could not be found`, 404)
    return res.json({"company": results.rows[0]})
  } catch (error) {
    return next(error)
  }
})

/**
 * Add a company
 * 
 */
router.post('/', async (req, res, next ) => {
  try {
    const {code, name, description} = req.body;
    const results = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING *`, [code, name, description] )
    return res.status(201).json({"company": results.rows[0]})
  } catch (error) {
    return next(error)
  }
})

/**
 * Edit an existing company
 * 
 */
router.put('/:code', async (req, res, next ) => {
  try {
    const oldCode = req.params.code;
    const { code, name, description} = req.body;
    const results = await db.query(`UPDATE companies SET code=$1, name=$2, description=$3 WHERE code=$4 RETURNING code, name, description`, [code, name, description, oldCode] )
    if (results.rowsCount === 0) throw new ExpressError(`Company with code of:'${code}' cannot be found`, 404)
    return res.json({"company": results.rows[0]})
  } catch (error) {
    return next(error)
  }
})

/**
 * Delete a company
 * 
 */
router.delete('/:code', async (req, res, next ) => {
  try {
    const { code } = req.params;
    const results = await db.query(`DELETE FROM companies WHERE code = $1`, [code] )
    if (results.rowCount === 0) throw new ExpressError(`Company with code of: '${code}' cannot be found`, 404)
    return res.send({msg: "DELETED!"})
  } catch (error) {
    return next(error)
  }
})

module.exports = router; 