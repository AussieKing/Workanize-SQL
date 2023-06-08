INSERT INTO department (id, name)
VALUES
(1, 'Sales'),
(2, 'Marketing'),
(3, 'IT'),
(4, 'HR'),
(5, 'Finance'),
(6, 'Operations'),
(7, 'Legal'),
(8, 'Purchasing'),
(9, 'Customer Service'),
(10, 'Production');

INSERT INTO roles (id, title, salary, department_id)
VALUES
(1, 'Sales Lead', 100000, 1),
(2, 'Marketing Manager', 80000, 2),
(3, 'Software Engineer', 150000, 3),
(4, 'HR Manager', 120000, 4),
(5, 'Accountant', 130000, 5),
(6, 'Logistics Manager', 125000, 6),
(7, 'Legal Team Lead', 250000, 7),
(8, 'Category Manager', 100000, 8),
(9, 'Customer Assistant', 75000, 9),
(10, 'Product Manager', 150000, 10);

INSERT INTO employee (id, first_name, last_name, role_id, manager_id)
VALUES
(1, 'John', 'Doe', 1, NULL),
(2, 'Jane', 'Moe', NULL),
(3, 'Jack', 'Toe', NULL),
(4, 'Jill', 'Joe', NULL),
(5, 'James', 'Noe', NULL),
(6, 'Jenny', 'Poe', NULL),
(7, 'Jared', 'Roe', NULL),
(8, 'Jasmine', 'Coe',NULL),
(9, 'Jared', 'Woe', NULL),
(10, 'Jenna', 'Foe', NULL);