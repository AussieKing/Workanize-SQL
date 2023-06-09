const inquirer = require('inquirer');
const mysql2 = require('mysql2');
const express = require('express');
require('dotenv').config();
const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to database
const db = mysql2.createConnection({
  host: 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'employee_tracker',
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to the employee_tracker database.');
  start(); // start the application
});

// function start
function start() {
  inquirer
    .prompt([
      {
        name: 'action',
        type: 'list',
        message: 'What would you like to do?',
        choices: [
          'View all employees',
          'View all employees by department',
        //   'View all employees by manager',
          'Add employee',
          'Remove employee',
          'Update employee role',
          'Update employee manager',
          'View all roles',
          'Add role',
          'Delete role',
          'View all departments',
          'Add department',
          'Delete department',
          'Quit',
        ],
      },
    ])
    .then((answer) => {
      switch (answer.action) {
        case 'View all employees':
          viewAllEmployees();
          break;
        case 'View all employees by department':
          viewEmployeesByDepartment();
          break;
        // case 'View all employees by manager':
        //   viewEmployeesByManager();
        //   break;
        case 'Add employee':
          addEmployee();
          break;
        case 'Remove employee':
          removeEmployee();
          break;
        case 'Update employee role':
          updateEmployeeRole();
          break;
        case 'Update employee manager':
          updateEmployeeManager();
          break;
        case 'View all roles':
          viewAllRoles();
          break;
        case 'Add role':
          addRole();
          break;
        case 'Delete role':
          deleteRole();
          break;
        case 'View all departments':
          viewAllDepartments();
          break;
        case 'Add department':
          addDepartment();
          break;
        case 'Delete department':
          deleteDepartment();
          break;
        case 'Quit':
          console.log('Goodbye!');
          db.end();
          break;
        default:
          console.log('Invalid action');
          start();
          break;
      }
    });
}

//! function to view all Employees
function viewAllEmployees() {
  const query = `SELECT employee.id,
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
}

//! function to view all employees by department
function viewEmployeesByDepartment() {
    const query = `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee manager ON manager.id = employee.manager_id ORDER BY employee.id ASC;`;
  
    db.query(query, (err, res) => {
      if (err) throw err;
      console.log('Employees by Department');
      console.table(res);
      start();
    });
}  

//! function to add an employee
function addEmployee() {
  db.query('SELECT id, title FROM role', (err, res) => {
    if (err) throw err;
    const roles = res.map((role) => ({
      name: role.title,
      value: role.id,
    }));

    inquirer
      .prompt([
        {
          name: 'first_name',
          type: 'input',
          message: "Enter the employee's first name:",
        },
        {
          name: 'last_name',
          type: 'input',
          message: "Enter the employee's last name:",
        },
        {
          name: 'role_id',
          type: 'list',
          message: "Select the employee's role:",
          choices: roles,
        },
      ])
      .then((answer) => {
        const query = 'INSERT INTO employee SET ?';
        db.query(query, answer, (err, res) => {
          if (err) throw err;
          console.log('Employee added successfully!');
          start();
        });
      });
  });
}

//! function to remove an employee
function removeEmployee() {
  db.query('SELECT id, CONCAT(first_name, " ", last_name) AS employee FROM employee', (err, res) => {
    if (err) throw err;
    const employees = res.map((employee) => ({
      name: employee.employee,
      value: employee.id,
    }));

    inquirer
      .prompt([
        {
          name: 'employee_id',
          type: 'list',
          message: 'Select the employee to remove:',
          choices: employees,
        },
      ])
      .then((answer) => {
        const query = 'DELETE FROM employee WHERE ?';
        db.query(query, { id: answer.employee_id }, (err, res) => {
          if (err) throw err;
          console.log('Employee removed successfully!');
          start();
        });
      });
  });
}

//! function to update employee role
function updateEmployeeRole() {
  db.query('SELECT id, CONCAT(first_name, " ", last_name) AS employee FROM employee', (err, res) => {
    if (err) throw err;
    const employees = res.map((employee) => ({
      name: employee.employee,
      value: employee.id,
    }));

    db.query('SELECT id, title FROM role', (err, res) => {
      if (err) throw err;
      const roles = res.map((role) => ({
        name: role.title,
        value: role.id,
      }));

      inquirer
        .prompt([
          {
            name: 'employee_id',
            type: 'list',
            message: 'Select the employee to update:',
            choices: employees,
          },
          {
            name: 'role_id',
            type: 'list',
            message: 'Select the new role:',
            choices: roles,
          },
        ])
        .then((answer) => {
          const query = 'UPDATE employee SET role_id = ? WHERE id = ?';
          db.query(query, [answer.role_id, answer.employee_id], (err, res) => {
            if (err) throw err;
            console.log('Employee role updated successfully!');
            start();
          });
        });
    });
  });
}

//! function to update employee manager
function updateEmployeeManager() {
  db.query('SELECT id, CONCAT(first_name, " ", last_name) AS employee FROM employee', (err, res) => {
    if (err) throw err;
    const employees = res.map((employee) => ({
      name: employee.employee,
      value: employee.id,
    }));

    inquirer
      .prompt([
        {
          name: 'employee_id',
          type: 'list',
          message: 'Select the employee to update:',
          choices: employees,
        },
        {
          name: 'manager_id',
          type: 'list',
          message: 'Select the new manager:',
          choices: employees,
        },
      ])
      .then((answer) => {
        const query = 'UPDATE employee SET manager_id = ? WHERE id = ?';
        db.query(query, [answer.manager_id, answer.employee_id], (err, res) => {
          if (err) throw err;
          console.log('Employee manager updated successfully!');
          start();
        });
      });
  });
}

//! function to view all roles
function viewAllRoles() {
  const query = `SELECT role.id,
    role.title,
    department.name AS department,
    role.salary
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
    const departments = res.map((department) => ({
      name: department.name,
      value: department.id,
    }));

    inquirer
      .prompt([
        {
          name: 'title',
          type: 'input',
          message: 'Enter the title of the new role:',
        },
        {
          name: 'salary',
          type: 'number',
          message: 'Enter the salary for the new role:',
        },
        {
          name: 'department_id',
          type: 'list',
          message: 'Select the department for the new role:',
          choices: departments,
        },
      ])
      .then((answer) => {
        const query = 'INSERT INTO role SET ?';
        db.query(query, answer, (err, res) => {
          if (err) throw err;
          console.log('Role added successfully!');
          start();
        });
      });
  });
}

//! function to delete a role
function deleteRole() {
  db.query('SELECT id, title FROM role', (err, res) => {
    if (err) throw err;
    const roles = res.map((role) => ({
      name: role.title,
      value: role.id,
    }));

    inquirer
      .prompt([
        {
          name: 'role_id',
          type: 'list',
          message: 'Select the role to delete:',
          choices: roles,
        },
      ])
      .then((answer) => {
        const query = 'DELETE FROM role WHERE ?';
        db.query(query, { id: answer.role_id }, (err, res) => {
          if (err) throw err;
          console.log('Role deleted successfully!');
          start();
        });
      });
  });
}

//! function to view all departments
function viewAllDepartments() {
  const query = 'SELECT * FROM department ORDER BY id ASC';
  db.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    start();
  });
}

//! function to add a department
function addDepartment() {
  inquirer
    .prompt([
      {
        name: 'name',
        type: 'input',
        message: 'Enter the name of the new department:',
      },
    ])
    .then((answer) => {
      const query = 'INSERT INTO department SET ?';
      db.query(query, answer, (err, res) => {
        if (err) throw err;
        console.log('Department added successfully!');
        start();
      });
    });
}

//! function to delete a department
function deleteDepartment() {
  db.query('SELECT id, name FROM department', (err, res) => {
    if (err) throw err;
    const departments = res.map((department) => ({
      name: department.name,
      value: department.id,
    }));

    inquirer
      .prompt([
        {
          name: 'department_id',
          type: 'list',
          message: 'Select the department to delete:',
          choices: departments,
        },
      ])
      .then((answer) => {
        const query = 'DELETE FROM department WHERE ?';
        db.query(query, { id: answer.department_id }, (err, res) => {
          if (err) throw err;
          console.log('Department deleted successfully!');
          start();
        });
      });
  });
}

// Start the application
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
