
CREATE DATABASE IF NOT EXISTS stock_management;
USE stock_management;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('boss', 'staff') NOT NULL
);

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL
);

-- Demo users
INSERT INTO users (username, password, role) VALUES
('boss', '$2b$10$Pi6U3hWTvUMx9E2SSxMZ0e6kUO3.vQUkhgIcQAg6thwDqQr7YI3ta', 'boss'),
('staff', '$2b$10$PK4Mf3FzT1flFDGkYt4MYe0ptvqmyCiNGmtx7kYAMgYw2ElMyVKCG', 'staff');
