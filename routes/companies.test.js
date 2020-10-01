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
      RETURNING id, comp_code, amt, paid, paid_date`);

  testInvoices = invResults.rows[0];

})


afterEach(async () => {
  await db.query('DELETE FROM companies')
  await db.query('DELETE FROM invoices')
})

afterAll(async () => {
  // close db connection
  await db.end(); 
})



/**
 * Test GET a list of companies
 */
describe('GET /companies', () => {
 test ("Gets a list of companies", async () => {
   const response = await request(app).get('/companies');
   expect(response.statusCode).toEqual(200)
   expect(response.body).toEqual({
     companies: [testCompanies]
   });
  });
});


/**
 * Test Get a single company and all of their invoices 
 */
describe('GET /companies/:code', () => {
  test ("Gets a single company and all of their invoices", async () => {
    const companyResponse = await request(app).get(`/companies/${testCompanies.code}`);
    
    expect(companyResponse.statusCode).toEqual(200)

    expect(companyResponse.body).toEqual(
      { company: { 
        'code': testCompanies.code,
        'name': testCompanies.name,
        'description': testCompanies.description,
        'invoices': [testInvoices.id] }
     });
  });
});

/**
 * Test Adding a new company
 */
describe('POST /companies', () => {
  test ("Create a new company", async () => {
    const response = await request(app).post('/companies').send({
      'code': 'google',
      'name': 'Google Inc.',
      'description': 'Leader in web search engines'
    });
    expect(response.statusCode).toEqual(201);
    expect(response.body).toEqual({
      company: {
        'code': 'google',
        'name': 'Google Inc.',
        'description': 'Leader in web search engines'
      }
    });
   });
 });

 /**
 * Editing an existing company's information
 */
describe('PUT /companies/:code', () => {
  test ("Edit and existing company", async () => {
    const response = await request(app).put(`/companies/${testCompanies.code}`).send({
      code : 'apple',
      name: 'Apple Inc.',
      description: 'Charges 500% profit on everything'
    });
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      'company': {
        'code': 'apple',
        'name': 'Apple Inc.',
        'description': 'Charges 500% profit on everything'
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

 describe('Delete /companies/:code', () => {
  test ("Delete a company", async () => {
    const response = await request(app).delete(`/companies/${testCompanies.code}`)
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({ msg: "DELETED!" })
    });

   test ("Company code does not exist (Generate 404 response)", async () => {
    const response = await request(app).delete(`/companies/XYZ`)
    expect(response.statusCode).toEqual(404);
   });

 });