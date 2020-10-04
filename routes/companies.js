const express = require("express");
const slugify = require("slugify");
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
  
    const compResult = await db.query(
      `SELECT code, name, description
       FROM companies
       WHERE code = $1`,
    [code]
    );
    const invResult = await db.query(
      `SELECT id
       FROM invoices
       WHERE comp_code = $1`,
    [code]
    );

    const industryResult = await db.query(
      `SELECT c.code, c.name, c.description, ind.industry
        FROM companies AS c 
        LEFT JOIN industry_company AS ind_comp
       ON c.code = ind_comp.comp_code
        LEFT JOIN industries AS ind 
        ON ind_comp.ind_code = ind.code
        WHERE c.code = $1`,
        [code]
    )

    if (compResult.rows.length === 0) throw new ExpressError(`Company: '${code}' could not be found`, 404)

    const company = compResult.rows[0];
    const invoices = invResult.rows;
    const industries = industryResult.rows;

    // company.invoices = invoices;
    company.invoices = invoices.map(inv => inv.id);
    company.industries = industries.map(ind => ind.industry)

    return res.json({"company": company});
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
    const {name, description} = req.body;
    let code = slugify(name, {lower: true});
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
    const code = req.params.code;
    const { name, description} = req.body;

    const results = await db.query(`UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description`, [name, description, code] )
    if (results.rowCount === 0) throw new ExpressError(`Company with code of:'${code}' cannot be found`, 404)
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