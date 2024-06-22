import { Connection, RowDataPacket } from "mysql2/promise";
import {
  mysql_connection_data,
  mysql_connection_data_with_database,
  sql_pool,
} from "../../../../config/mysql/config";
import { mysql_tables } from "./schemas/tables";

export async function checkAndCreateMySQLDatabase(): Promise<boolean> {
  // Create a connection to the MySQL server
  let connection: Connection | undefined;

  try {
    if (sql_pool) {
      connection = await sql_pool(mysql_connection_data);
      if (typeof connection === "undefined")
        throw { msg: "MySQL Connection missing." };

      const databaseName: string = process.env.MYSQL_DB; // Replace with your desired database name

      // Check if the database exists
      const [databases]: [RowDataPacket[], any] = await connection.query<
        RowDataPacket[]
      >("SHOW DATABASES LIKE ?", [databaseName]);

      if (databases.length === 0) {
        // Create the database if it does not exist
        await connection.query(`CREATE DATABASE ${databaseName}`);
        console.log(`Database ${databaseName} created successfully.`);
        return true;
      } else {
        console.log(`Database ${databaseName} already exists.`);
      }
    } else {
      throw { msg: "Server Not initiated." };
    }
  } catch (error) {
    console.error("Error:", error);
    throw error;
  } finally {
    // Ensure the connection is closed
    if (connection) {
      await connection.end();
    }
  }
  return false;
}

export async function createMySQLTables(connection: Connection): Promise<{
  created: number;
  table_error: string[];
}> {
  // Create a connection to the MySQL server
  //   let connection: Connection | undefined;
  let created: number = 0;
  let table_error: string[] = [];
  try {
    // if (sql_pool) {
    //   connection = await sql_pool(mysql_connection_data_with_database);

    if (typeof connection === "undefined")
      throw { msg: "MySQL Connection missing." };

    // const table_names: string[] = [];
    // mysql_tables.forEach(t => table_names.push(t().table_name))

    for (const table of mysql_tables) {
      const table_data = table();
      try {
        if (connection) {
          const [tables]: [RowDataPacket[], any] = await connection.query<
            RowDataPacket[]
          >("SHOW TABLES LIKE ?", [table_data.table_name]);

          console.log({ tables });

          if (tables.length === 0) {
            // Execute the SQL statement
            await connection.execute(table_data.script);
            created++;
            console.log(`Table ${table_data.table_name} created successfully.`);
          } else {
            console.log(`Table ${table_data.table_name} already exists.`);
          }
        } else {
          throw false;
        }
      } catch (error) {
        console.log("createMySQLTables", { error });
        table_error.push(table_data.table_name);
      }
    }

    return { created, table_error };
    // } else {
    //   throw { msg: "Server Not initiated." };
    // }
  } catch (error) {
    console.error("Error:", error);
    throw error;
  } finally {
    // Ensure the connection is closed
    if (connection) {
      await connection.end();
    }
  }
}
