const inquirer = require('inquirer');
const mysql = require('mysql');
const express = require('express');
require('dotenv').config();
const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// //! TESTING : to seed database
// const seedDatabase = fs.readFileSync('./db/schema.sql', 'utf8');
// connection.query(seedDatabase, (err, res) => {
//     if (err) throw err;
//     console.log('Database seeded successfully.');
// });

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
            case 'View All Employees':  
                viewAllEmployees();
                break;
            case 'Add Employee':    
                addEmployee();
                break;
            case 'Update Employee Role': 
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
            case 'Update Employee Manager': //! NOT WORKING
                updateEmployeeManager();
                break;
            case 'View Employee By Manager': //! NOT WORKING
                viewEmployeeByManager();
                break;
            case 'View Employee By Department': //! NOT WORKING
                viewEmployeeByDepartment();
                break;
            case 'Delete Employee / Role / Department': //! NOT WORKING
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

//! ******* Start of all the CRUD functions ********

//! function to view all Employees
//! function to view all Employees
function viewAllEmployees() {
    const query =
    `SELECT employee.id, 
    employee.first_name, 
    employee.last_name, 
    role.title, 
    department.name AS department, 
    role.salary, 
    CONCAT(manager.first_name, ' ', manager.last_name) AS manager
    FROM employee
    LEFT JOIN role ON employee.role_id = role.id
    LEFT JOIN department ON role.department_id = department.id
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

//! function to view all roles
//! function to view all roles
function viewAllRoles() {
    const query =
    `SELECT role.id AS Id,
    role.title AS Title, 
    department.name AS Department, 
    role.salary AS Salary
    FROM role
    LEFT JOIN department ON role.department_id = department.id
    ORDER BY role.id ASC;`;

    db.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        start();
    });
}

//! function to add a role
function addRole() {
    db.query('SELECT id, name FROM department', (err, res) => {
        if (err) throw err;

        const departments = res.map(({ id, name }) => ({
            name: name,
            value: id
        }));

        inquirer.prompt([
            {
                name: 'title',
                type: 'input',
                message: "What is the role's title?"
            },
            {
                name: 'salary',
                type: 'input',
                message: "What is the role's salary?"
            },
            {
                name: 'department_id',
                type: 'list',
                message: "What is the role's department?",
                choices: departments
            }
        ])
        .then(answer => {
            db.query('INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)', 
            [answer.title, answer.salary, answer.department_id], 
            (err, res) => {
                if (err) throw err;
                console.log('Role added to database successfully.');
                start();
            });
        });
    });
}

//! function to view all departments
function viewAllDepartments() {
    const query =
    `SELECT department.id AS Id,
    department.name AS Department
    FROM department
    ORDER BY department.id ASC;`;

    db.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        start();
    });
}

//! function to add a department
function addDepartment() {
    inquirer.prompt([
        {
            name: 'name',
            type: 'input',
            message: "What is the department's name?"
        }
    ])
    .then(answer => {
        db.query('INSERT INTO department (name) VALUES (?)', 
        [answer.name], 
        (err, res) => {
            if (err) throw err;
            console.log('Department added to database successfully.');
            start();
        });
    });
}

//! function to view all employees by department
function viewEmployeeByDepartment() {
    const query =
    `SELECT employee.id AS Id,
    employee.first_name AS 'First Name',
    employee.last_name AS 'Last Name',
    department.name AS Department
    FROM employee
    LEFT JOIN role ON employee.role_id = role.id
    LEFT JOIN department ON role.department_id = department.id
    ORDER BY employee.id ASC;`;

    db.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        start();
    });
}

//! function to view all employees by manager
function viewEmployeeByManager() {
    const query =
    `SELECT employee.id AS Id,
    employee.first_name AS 'First Name',
    employee.last_name AS 'Last Name',
    CONCAT(manager.first_name, ' ', manager.last_name) AS Manager
    FROM employee
    LEFT JOIN employee manager ON manager.id = employee.manager_id
    ORDER BY employee.id ASC;`;

    db.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        start();
    });
}

//! function to delete an employee
function deleteEmployee() {
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
                message: "Which employee would you like to delete?",
                choices: employees
            }
        ])
        .then(answer => {
            db.query('DELETE FROM employee WHERE id = ?', 
            [answer.employee_id], 
            (err, res) => {
                if (err) throw err;
                console.log('Employee deleted from database successfully.');
                start();
            });
        });
    });
}

//! function to delete a role
function deleteRole() {
    db.query('SELECT id, title FROM role', (err, res) => {
        if (err) throw err;

        const roles = res.map(({ id, title }) => ({
            name: title,
            value: id
        }));

        inquirer.prompt([
            {
                name: 'role_id',
                type: 'list',
                message: "Which role would you like to delete?",
                choices: roles
            }
        ])
        .then(answer => {
            db.query('DELETE FROM role WHERE id = ?', 
            [answer.role_id], 
            (err, res) => {
                if (err) throw err;
                console.log('Role deleted from database successfully.');
                start();
            });
        });
    });
}

//! function to delete a department
function deleteDepartment() {
    db.query('SELECT id, name FROM department', (err, res) => {
        if (err) throw err;

        const departments = res.map(({ id, name }) => ({
            name: name,
            value: id
        }));

        inquirer.prompt([
            {
                name: 'department_id',
                type: 'list',
                message: "Which department would you like to delete?",
                choices: departments
            }
        ])
        .then(answer => {
            db.query('DELETE FROM department WHERE id = ?', 
            [answer.department_id], 
            (err, res) => {
                if (err) throw err;
                console.log('Department deleted from database successfully.');
                start();
            });
        });
    });
}

//! close connection to database
process.on('exit', () => {
    db.end();
});