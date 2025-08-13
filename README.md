Proyecto Base Datos 
📌 Description: 
This system organizes and manages financial transaction data from Fintech platforms like Nequi and Daviplata.
It is built to normalize disorganized Excel data into a structured PostgreSQL database, providing:
 - Data normalization (1NF, 2NF, 3NF)
 - Relational model design
 - Bulk CSV import
 - CRUD operations for Customers
 - Advanced SQL queries required by the client

---

Developer Information
 - Name: Juan Manuel Arango Arana
 - Clan: Van Rossum
 - Email: jumarana1007@gmail.con
 - Link repo github: https://github.com/BioHazard23/Proyecto-Base-Datos.git
---

🛠️ Technologies Used
 - PostgreSQL – Database
 - Node.js + Express – Backend API
 - Bootstrap – Frontend UI
 - JavaScript – Logic implementation
 - Postman – API testing
 - draw.io – ER diagram design

---

📊 Database Normalization
The provided Excel data was normalized manually according to:
First Normal Form (1NF) – Removed repeating groups and ensured atomic values.
Second Normal Form (2NF) – Removed partial dependencies on a composite key.
Third Normal Form (3NF) – Removed transitive dependencies.

The final tables:
 - customers – Client personal information
 - invoices – Invoice data
 - transactions – Payment transactions linked to invoices and customers

---

🗄️ Relational Model
 - (der_diagram.png)

---

📝 Bulk CSV Import
The original Excel file was converted into multiple CSV files:
 - customers.csv
 - invoices.csv
 - transactions.csv
