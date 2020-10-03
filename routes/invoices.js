//const { json } = require("body-parser");
const express = require("express");
const router = express.Router();
const db = require("../db.js");
const ExpressError = require("../expressError.js");

/**
 * Return list of all invoices
 * 
 */
router.get('/', async (req, res, next ) => {
  try {
    const results = await db.query('SELECT id, comp_code FROM invoices')
    return res.json({"invoices": results.rows})
  } catch (error) {
    return next(error)
  }
})

/**
 * Return a specific invoice based on id
 */
router.get('/:id', async (req, res, next ) => {
  try {
    const { id } = req.params;
    const invResults = await db.query(`SELECT * FROM invoices WHERE id = $1`, [parseInt(id)] );
    if (invResults.rows.length === 0) throw new ExpressError(`Invoices with id of '${id}' could not be found`, 404)

    // debugger;
    const comp_code = invResults.rows[0].comp_code;
    const compResults = await db.query(`SELECT code, name, description FROM companies WHERE code = $1`, [comp_code])


    const invoice = invResults.rows[0];
    const company = compResults.rows[0];
    invoice.company = company;
    return res.json({"invoice": invoice})

    // return res.json({"invoice": results.rows[0]})
  } catch (error) {
    return next(error)
  }
})

/**
 * Add a new invoice
 * 
 */
router.post('/', async (req, res, next ) => {
  try {
    const {comp_code, amt} = req.body;
    const results = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING *`, [comp_code, amt] )
    return res.status(201).json({"invoice": results.rows[0]})
  } catch (error) {
    return next(error)
  }
})

/**
 * Updates an existing invoice
 * If paying unpaid invoice: sets paid_date to today
 * If un-paying: sets paid_date to null
 *  Else: keep current paid_date
 * 
 */
router.put('/:id', async (req, res, next ) => {
  try {

    const { id } = req.params;
    const { amt, paid } = req.body;
    let paidDate = null;
    // debugger;
    const currResults = await db.query(
      `SELECT paid, paid_date
       FROM invoices
       WHERE id = $1`,
    [id]);

    if (currResults.rowsCount === 0) {
      throw new ExpressError(`Invoice with id of:'${id}' cannot be found`, 404)
    }

    const currPaidDate = currResults.rows[0].paid_date;

    
    if (!currPaidDate && paid) { // User wants to pay invoice (paid = true) and current record has no paid date then set records paid_date to current date
      paidDate = new Date(); 
    } else if (!paid) {  // User does not want to pay invoice (Paid = false) so set current paid date to null
      paidDate = null
    } else {  // User wants to pay invoice and paid date already exist.
      paidDate = currPaidDate;
    }    

    const results = await db.query(
      `UPDATE invoices 
       SET amt=$1, paid=$2, paid_date=$3 
       WHERE id=$4 
       RETURNING id, comp_code, amt, paid, add_date, paid_date`, 
       [amt, paid, paidDate, id])

    return res.json({"invoice": results.rows[0]})

  } catch (error) {
    return next(error)
  }
})

/**
 * Delete a company
 * 
 */
router.delete('/:id', async (req, res, next ) => {
  try {
    const { id } = req.params;
    const results = await db.query(`DELETE FROM invoices WHERE id = $1`, [parseInt(id)] )
    if (results.rowCount === 0) throw new ExpressError(`Invoice with id of: '${id}' cannot be found`, 404)
    return res.send({msg: "DELETED!"})
  } catch (error) {
    return next(error)
  }
})

module.exports = router; 