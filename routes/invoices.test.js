process.env.NODE_ENV ='test';
const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testCompanies; 
let testInvoices; 

beforeEach(async () => {
  const compResults = await db.query(`
    INSERT INTO
      companies (code, name, description)
      VALUES ('apple', 'Apple Inc.', 'Maker of iOS')
      RETURNING code, name, description`);
    testCompanies = compResults.rows[0];

  const invResults = await db.query(`
    INSERT INTO 
      invoices (comp_code, amt, paid, paid_date)
      VALUES ('apple', 100, true, '2018-01-01')
      RETURNING id, comp_code`);
 
    testInvoices = invResults.rows[0];
 
})


// testOneInvoice = testInvoices.map(i => 
//   {  
//     console.log(i)
//     return {id : i.id, comp_code : i.comp_code}
//   } );

afterEach(async () => {
  await db.query("SELECT setval('invoices_id_seq', 1, false)");
  await db.query('TRUNCATE companies, invoices RESTART IDENTITY CASCADE;')

  // await db.query('DELETE FROM companies;')
  // await db.query('DELETE FROM invoices;')
})

afterAll(async () => {
   // close db connection
  await db.end(); 
})


/**
 * Test GET a list of companies
 */
describe('GET /invoices', () => {
 test ("Gets a list of invoices", async () => {
   const response = await request(app).get('/invoices');
   debugger;
   expect(response.statusCode).toEqual(200)
   expect(response.body).toEqual({
     invoices: [{
       id: testInvoices.id,
       comp_code: testInvoices.comp_code}]
   });

  });
});


/**
 * Test Get a single invoice based on id
 */
describe('GET /invoices/:id', () => {
  test ("Gets a single invoice", async () => {
    const invResponse = await request(app).get(`/invoices/${testInvoices.id}`);
    // debugger; 
    
    expect(invResponse.statusCode).toEqual(200)


    expect(invResponse.body).toEqual(
      { invoice: { 
        'id': testInvoices.id,
        'comp_code': testInvoices.comp_code,
        'amt': 100,
        'paid': true,
        'add_date': expect.any(String), 
        'paid_date': expect.any(String),
        'company': testCompanies
      }

      });

  });
});

/**
 * Attempt to Get a single invoice based with an invalid id (return 404)
 */
describe('GET /invoices/:id', () => {
  test ("Test that invalid id returns a 404", async () => {
    const invResponse = await request(app).get(`/invoices/99`);
    // debugger; 
    expect(invResponse.statusCode).toEqual(404);

  });
});


/**
 * Test Adding a new invoice
 */
describe('POST /invoices', () => {
  test ("Create a new invoice", async () => {
    const response = await request(app).post('/invoices').send({
      'comp_code': 'apple',
      'amt': 200,
      'paid': false
     });

    // debugger;

    expect(response.statusCode).toEqual(201);
    expect(response.body).toEqual({
      invoice : {
        id : expect.any(Number),
        comp_code : testInvoices.comp_code,
        amt : 200,
        paid: false, 
        add_date: expect.any(String), 
        paid_date: null 
      }
    })
   });
 });

 /**
 * Editing an existing invoices information
 */
describe('PUT /invoices/:code', () => {
  test ("Edit and existing invoice", async () => {

    const response = await request(app).put(`/invoices/${testInvoices.id}`).send({
      amt : 800
    });

    // debugger;
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      'invoice': {
        'id': testInvoices.id,
        'comp_code': testInvoices.comp_code,
        'amt': 800,
        'paid': true,
        'add_date': expect.any(String), 
        'paid_date': expect.any(String) 
      }
    });
   });

   test ("Company code does not exist (Generate 404 response)", async () => {
    const response = await request(app).put(`/companies/XYZ`)
    .send({
      'code': 'apple',
      'name': 'Apple Inc.',
      'description': 'Charges 500% profit on everything'
    });
    expect(response.statusCode).toEqual(404);
   });
 });


 describe('Delete /invoices/:code', () => {
  test ("Delete an invoice", async () => {
    const response = await request(app).delete(`/invoices/${testInvoices.id}`)
    // debugger;
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({ msg: "DELETED!" })
    });

   test ("Invoice does not exist (Generate 404 response)", async () => {
    const response = await request(app).delete(`/invoices/99`);
    // debugger;
    expect(response.statusCode).toEqual(404);
   });

 })