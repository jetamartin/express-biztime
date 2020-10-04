-- Added the next to lines as part of the exercise
DROP DATABASE IF EXISTS biztime;
CREATE DATABASE biztime; 

\c biztime

DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS companies;

CREATE TABLE companies (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text
);

CREATE TABLE invoices (
    id serial PRIMARY KEY,
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    amt float NOT NULL,
    paid boolean DEFAULT false NOT NULL,
    add_date date DEFAULT CURRENT_DATE NOT NULL,
    paid_date date,
    CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
);

CREATE TABLE industries (
    code text PRIMARY KEY,
    industry text NOT NULL UNIQUE
);

CREATE TABLE industry_company (
  ind_code text NOT NULL REFERENCES industries,
  comp_code  text NOT NULL REFERENCES companies, 
  PRIMARY KEY (ind_code, comp_code)
); 

INSERT INTO companies (code, name, description)
  VALUES ('apple-inc', 'Apple Computer', 'Maker of OSX.'),
         ('ibm', 'IBM', 'Big blue.'),
         ('google-inc', 'Google Inc', 'Search Engine Leader.'),
         ('qualcomm', 'Qualcomm Incorporated', 'Chip manufacturer for phones.'),
         ('intel', 'Intel Corporation', '#1 PC chip manufacturer.'),
         ('amd', 'Advanced Micro Devices', 'Leading PC chip manufacturer.'),
         ('nvidia', 'Nvidia Corporation', 'GPU manufacturer'),
         ('msoft', 'Microsoft Corporation', 'OS and Productivity software');


INSERT INTO invoices (comp_Code, amt, paid, paid_date)
  VALUES ('apple-inc', 100, false, null),
         ('apple-inc', 200, false, null),
         ('apple-inc', 300, true, '2018-01-01'),
         ('ibm', 400, false, null),
         ('google-inc', 250, false, null),
         ('qualcomm', 600, false, null),
         ('intel', 360, false, null),
         ('amd', 499, false, null),
         ('nvidia', 630, false, null),
         ('msoft', 750, false, null);

INSERT INTO industries (code, industry )
  VALUES  ('comp', 'Computer Manufacturer'),
          ('chip', 'Chip Manufacturer'),
          ('gpu', 'Graphics Processor '),
          ('phone', 'Phones and Telephony'),
          ('os', 'Operating System Vendor');
--         ('sw', 'Software vendor'),
--         ('hw', 'Hardware vendor'),
--         ('svcs', 'Services'),
--         ('app', 'Application Software'),

INSERT INTO industry_company (ind_code, comp_code)
  VALUES  ('comp', 'apple-inc'),
          ('comp', 'ibm'),
          ('comp', 'msoft'), 
          ('chip', 'apple-inc'), 
          ('chip', 'intel'), 
          ('chip', 'qualcomm'), 
          ('chip', 'amd'),
          ('chip', 'nvidia'),
          ('chip', 'ibm'),
          ('gpu', 'amd'),
          ('gpu', 'nvidia'),
          ('phone', 'apple-inc'),
          ('phone', 'qualcomm'),
          ('phone', 'google-inc'),
          ('phone', 'msoft'), 
          ('os', 'ibm'),
          ('os', 'msoft'),
          ('os', 'google-inc'),
          ('os', 'apple-inc');



-- Query to get industry names given a company code
-- SELECT c.code, c.name, c.description, ind.industry
-- FROM companies AS c 
-- LEFT JOIN industry_company AS ind_comp
-- ON c.code = ind_comp.comp_code
-- EFT JOIN industries AS ind 
-- ON ind_comp.ind_code = ind.code
--WHERE c.code = 'apple-inc';
