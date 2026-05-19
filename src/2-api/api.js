require('dotenv').config(); 
const express = require('express');
const sql = require('mssql');

const app = express();
app.use(express.json());

// Enable CORS so your frontend can communicate with this API
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Authorization, Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
});

// Database Connection String configuration setup
const connectionString = process.env.DB_CONNECTION_STRING;

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true,
        enableArithAbort: true
    }
};

const getDbConfig = () => {
    return connectionString ? connectionString : config;
};

// ── GET ALL EMPLOYEES (B2C Authentication gate completely bypassed) ──
app.get('/employees', async (req, res) => {
    try {
        let pool = await sql.connect(getDbConfig());
        let result = await pool.request().query('SELECT * FROM Employees');
        res.json(result.recordset);
    } catch (err) {
        console.error("Database connection error:", err);
        res.status(500).send(err.message);
    }
});

// ── CREATE NEW EMPLOYEE ──
app.post('/employees', async (req, res) => {
    const { EmployeeId, FirstName, LastName, DateOfBirth, DateOfJoining, DepartmentName } = req.body;
    try {
        let pool = await sql.connect(getDbConfig());
        await pool.request()
            .input('EmployeeId', sql.NVarChar, EmployeeId)
            .input('FirstName', sql.NVarChar, FirstName)
            .input('LastName', sql.NVarChar, LastName)
            .input('DateOfBirth', sql.Date, DateOfBirth)
            .input('DateOfJoining', sql.Date, DateOfJoining)
            .input('DepartmentName', sql.NVarChar, DepartmentName)
            .query('INSERT INTO Employees (EmployeeId, FirstName, LastName, DateOfBirth, DateOfJoining, DepartmentName) VALUES (@EmployeeId, @FirstName, @LastName, @DateOfBirth, @DateOfJoining, @DepartmentName)');
        res.status(201).send('Employee added successfully');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Root check to verify the API status directly in a browser window
app.get('/', (req, res) => {
    res.send('Backend API Server is successfully running and healthy!');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});