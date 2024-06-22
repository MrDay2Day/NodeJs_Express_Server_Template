const createDemoTableSQL = () => {
  const table_name = "Demo";
  const script = `
  CREATE TABLE ${table_name}(
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    age INT,
    dob DATE NOT NULL,
    userType ENUM('Admin', 'User', 'Visitor') NOT NULL
  )
`;
  return { table_name, script };
};

const createDemo1TableSQL = () => {
  const table_name = "Demo1";
  const script = `
  CREATE TABLE ${table_name} (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    demo_id INT,
    FOREIGN KEY (demo_id) REFERENCES Demo(id)
  )
`;
  return { table_name, script };
};

export const mysql_tables = [createDemoTableSQL, createDemo1TableSQL];
