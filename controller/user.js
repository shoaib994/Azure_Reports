const path = require("path");
const xlsx = require("xlsx");
const fs = require("fs");
const express = require("express");
const sql = require("mssql");

// Start Database Related Tasks
exports.addRecord = async (req, res, next) => {
  try {
    const search_city = "Alford";
    const cpt = "99600";
    const {
      user_id,
      name,
      email,
      city,
      cpt_code,
      medical_procedure_type,
      medical_procedure,
      zip_code,
    } = req.body;

    ////////////////////////////////////////////////////////////////////////

    /// Find the Locality
    const query = `SELECT TOP 1 * FROM locality WHERE city = '${city}'`;
    const result = await sql.query(query);

    var localityResult = result?.recordset[0];
    // return res.json(result?.recordset[0]);

    ////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////////////////////

    ////  Find the price

    ////////////////////
    // In B Tables
    const sectionQuery = `SELECT TOP 1 * FROM B_Specification_Surgery WHERE cpt_code = '${cpt_code}'`;
    const result1 = await sql.query(sectionQuery);

    var Prices = result1?.recordset[0];

    //
    ///////////////////////
    // In C Table

    if (!Prices) {
      const sectionQuery = `SELECT TOP 1 * FROM C_Specification_Radiology_more WHERE cpt_code = '${cpt_code}'`;
      const result1 = await sql.query(sectionQuery);

      Prices = result1?.recordset[0];
    }
    //
    /// Find Locality
    var locality = 0;
    if (
      localityResult?.locality == "locality 01-02" ||
      localityResult?.locality == "locality_1_facility_MRA"
    ) {
      locality = 1;
    } else if (
      localityResult?.locality == "Locality 03" ||
      localityResult?.locality == "locality_3_facility_MRA"
    ) {
      locality = 3;
    } else if (
      localityResult?.locality == "Locality 04" ||
      localityResult?.locality == "locality_4_facility_MRA"
    ) {
      locality = 4;
    }

    // price calculation according to localities
    var cost = 0;
    if (locality == 0) {
      cost = Prices?.MRA_2003;
    }
    if (locality == 1) {
      cost = Prices?.locality_1_facility_MRA;
    } else if (locality == 3) {
      cost = Prices?.locality_3_facility_MRA;
    } else if (locality == 4) {
      cost = Prices?.locality_4_facility_MRA;
    }

    if (Prices?.MRA_2003 > cost) {
      cost = Prices?.MRA_2003;
    }
    //  return res.json({locality,cost,Prices,localityResult});
    //////////////////////////////////
    console.log(req.body);
    // Define the SQL query with parameter placeholders

    // Add Record into DB
    const addRecordquery =
      "INSERT INTO procedure_cost_estimate (user_id,name, email, medical_procedure, medical_procedure_type, zip_code, city, cpt_code, cost) " +
      "VALUES (@user_id,@name, @email, @medical_procedure, @medical_procedure_type, @zip_code, @city, @cpt_code, @cost)";

    // Prepare the SQL request with parameters
    const request = new sql.Request();
    request.input("user_id", sql.VarChar, user_id);
    request.input("name", sql.VarChar, name);
    request.input("email", sql.VarChar, email);
    request.input("medical_procedure", sql.VarChar, medical_procedure);
    request.input(
      "medical_procedure_type",
      sql.VarChar,
      medical_procedure_type
    );
    request.input("zip_code", sql.VarChar, zip_code);
    request.input("city", sql.VarChar, city);
    request.input("cpt_code", sql.VarChar, cpt_code);
    request.input("cost", sql.VarChar, cost);

    const addRecord = await request.query(addRecordquery);

    ///////////////////////////////////
    return res.json({
      success: true,
      addRecord:addRecord,
      data: result?.recordset,
      data1: result1?.recordset,
      cost
      // count:(result?.recordset)?.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(error?.message);
  }
};

exports.createTable = async (req, res, next) => {
  try {
    const sqlQuery1 = `
    CREATE TABLE procedure_cost_estimate (
      id INT IDENTITY(1,1) PRIMARY KEY,
      user_id VARCHAR(255),
      name VARCHAR(255),
      email VARCHAR(255),
      medical_procedure VARCHAR(255),
      medical_procedure_type VARCHAR(255),
      zip_code VARCHAR(255),
      city VARCHAR(255),
      cpt_code VARCHAR(255),
      cost VARCHAR(255),
      created_at DATETIME DEFAULT DATEADD(DAY, 0, GETDATE())
    );   
  `;
    const result = await sql.query(sqlQuery1);

    return res.json({
      success: true,
      result,
    });
  } catch (err) {
    return res.json({ message: err.message });
  }
};

exports.allRecords = async (req, res, next) => {
  try {
    const { barNumber, user_id } = req.query;
    console.log(req.params);
    var query =
      barNumber == "admin_t4ZvlB8QjvZd7aM0beLT1uuJ1X3tIb"
        ? "SELECT * FROM procedure_cost_estimate"
        : `SELECT * FROM procedure_cost_estimate WHERE user_id ='${user_id}'`;

    const result = await sql.query(query);

    return res.json({
      success: true,
      // addRecord:addRecord,
      data: result?.recordset,

      // count:(result?.recordset)?.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(error?.message);
  }
};

exports.deleteTable = async (req, res, next) => {
  try {
    const query = `DROP TABLE IF EXISTS procedure_cost_estimate;    `;
    const result = await sql.query(query);

    return res.json({
      success: true,
      // addRecord:addRecord,
      data: result?.recordset,

      // count:(result?.recordset)?.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(error?.message);
  }
};
