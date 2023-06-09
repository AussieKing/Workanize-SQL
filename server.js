const inquirer = require('inquirer');
const mysql = require('mysql');
const express = require('express');
require('dotenv').config();
const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to database
const db = mysql.createConnection({
    host: 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'employee_tracker'
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to the employee_tracker database.')
    start(); // start the application
});

// function start
function start() {
    inquirer.prompt({
        name: 'action',
        type: 'list',
        message: 'What would you like to do?',
        choices: [
            'View All Employees',
            'Add Employee',
            'Update Employee Role',
            'View All Roles',
            'Add Role',
            'View All Departments',
            'Add Department',
            'Quit'
        ]
    })
    .then(answer => {
        switch (answer.action) {
            case 'View All Employees':  //! CREATED
                viewAllEmployees();
                break;
            case 'Add Employee':    //! CREATED
                addEmployee();
                break;
            case 'Update Employee Role': //! CREATED
                updateEmployeeRole();
                break;
            case 'View All Roles':
                viewAllRoles();
                break;
            case 'Add Role':
                addRole();
                break;
            case 'View All Departments':
                viewAllDepartments();
                break;
            case 'Add Department':
                addDepartment();
                break;
            case 'Update Employee Manager':
                updateEmployeeManager();
                break;
            case 'View Employee By Manager':
                viewEmployeeByManager();
                break;
            case 'View Employee By Department':
                viewEmployeeByDepartment();
                break;
            case 'Delete Employee / Role / Department':
                deleteEmployeeRoleDepartment();
                break;
            case 'Quit':
                db.end();
                break;
            default:
                console.log(`Invalid action`);
                start(); 
        }
    }
)};

//! function to view all Employees
function viewAllEmployees() {
    const query =
    `SELECT employee.id, 
    employee.first_name, 
    employee.last_name, 
    role.title, 
    department.name AS department, 
    role.salary, 
    CONCAT(manager.first_name, ' ', manager.last_name) AS manager,
    FROM employee,
    LEFT JOIN role ON employee.role_id = role.id,
    LEFT JOIN department ON role.department_id = department.id,
    LEFT JOIN employee manager ON manager.id = employee.manager_id
    ORDER BY employee.id ASC;`;

    db.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        start();
    });
};

//! function to add an employee
function addEmployee() {
    db.query('SELECT id, title FROM role', (err, res) => {
        if (err) throw err;
    
        const roles = res.map(({ id, title }) => ({
            name: title,
            value: id
        }));

        db.query('SELECT id, first_name, last_name FROM employee', (err, res) => {
            if (err) throw err;

            const managers = res.map(({ id, first_name, last_name }) => ({
                name: `${first_name} ${last_name}`,
                value: id
            }));

            inquirer.prompt([
                {
                    name: 'first_name',
                    type: 'input',
                    message: "What is the employee's first name?"
                },
                {
                    name: 'last_name',
                    type: 'input',
                    message: "What is the employee's last name?"
                },
                {
                    name: 'role_id',
                    type: 'list',
                    message: "What is the employee's role?",
                    choices: roles
                },
                {
                    name: 'manager_id',
                    type: 'list',
                    message: "Who is the employee's manager?",
                    choices: managers
                }
            ])
            .then(answer => {
                db.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)', 
                [answer.first_name, answer.last_name, answer.role_id, answer.manager_id], (err, res) => {
                    if (err) throw err;
                    console.log('Employee added to database successfully.');
                    start();
                });
            });
        });
    });
};

//! function to update an employee's role
function updateEmployeeRole() {
    db.query('SELECT id, title FROM role', (err, res) => {
        if (err) throw err;

        const roles = res.map(({ id, title }) => ({
            name: title,
            value: id
        }));

        db.query('SELECT id, first_name, last_name FROM employee', (err, res) => {
            if (err) throw err;

            const employees = res.map(({ id, first_name, last_name }) => ({
                name: `${first_name} ${last_name}`,
                value: id
            }));

            inquirer.prompt([
                {
                    name: 'employee_id',
                    type: 'list',
                    message: "Which employee's role would you like to update?",
                    choices: employees.map(employee => ({
                            name: `${employee.first_name} ${employee.last_name}`,
                            value: employee.id
                        })
                    )
                },
                {
                    name: 'role_id',
                    type: 'list',
                    message: "What is the employee's new role?",
                    choices: roles
                }
            ])
            .then(answer => {
                db.query('UPDATE employee SET role_id = ? WHERE id = ?', 
                [answer.role_id, answer.employee_id], 
                (err, res) => {
                    if (err) throw err;
                    console.log('Employee role updated successfully.');
                    start();
                });
            });
        });
    });
}



