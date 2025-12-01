const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
require("dotenv").config(); // loads variables from .env

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MySQL
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// Test connection
db.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to Railway MySQL!");
    connection.release();
  }
});

// Example route
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// Start server
// app.listen(3000, () => {
//   console.log("Server running on http://localhost:3000");
// });

const PORT = process.env.PORT || 3000; // use Railway's port or fallback to 3000 locally

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});




//  CRUD FOR OFFICE


// Create a new office
app.post("/offices", (req, res) => {
    const { OfficeName, Address, City, State, ZipCode, Phone, Email, Notes } = req.body;
    db.query(
        "INSERT INTO Office (OfficeName, Address, City, State, ZipCode, Phone, Email, Notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [OfficeName, Address, City, State, ZipCode, Phone, Email, Notes],
        (err, results) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Office created", results });
        }
    );
});

// Get all offices
app.get("/offices", (req, res) => {
    db.query("SELECT * FROM Office", (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// Get a single office by OfficeID
app.get("/offices/:id", (req, res) => {
    const { id } = req.params;
    db.query("SELECT * FROM Office WHERE OfficeID = ?", [id], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results[0]);
    });
});

// Update an existing office
app.put("/offices/:id", (req, res) => {
    const { id } = req.params;
    const { OfficeName, Address, City, State, ZipCode, Phone, Email, Notes } = req.body;
    db.query(
        "UPDATE Office SET OfficeName = ?, Address = ?, City = ?, State = ?, ZipCode = ?, Phone = ?, Email = ?, Notes = ? WHERE OfficeID = ?",
        [OfficeName, Address, City, State, ZipCode, Phone, Email, Notes, id],
        (err, results) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Office updated", results });
        }
    );
});

// Delete an office and any doctors linked to it
app.delete("/offices/:id", (req, res) => {
    const { id } = req.params;
    // First delete doctors linked to this office
    db.query("DELETE FROM Doctor WHERE OFFICE_OfficeID = ?", [id], (err, doctorResults) => {
        if (err) return res.status(500).json(err);

        // Then delete the office
        db.query("DELETE FROM Office WHERE OfficeID = ?", [id], (err, officeResults) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Office and linked doctors deleted", doctorResults, officeResults });
        });
    });
});



//  CRUD FOR ADMIN

// Get all admins
app.get("/admins", (req, res) => {
    db.query("SELECT * FROM Admin", (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// Get a single admin by AdminID
app.get("/admins/:id", (req, res) => {
    const { id } = req.params;
    db.query("SELECT * FROM Admin WHERE AdminID = ?", [id], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results[0]);
    });
});

// Delete an admin by AdminID
app.delete("/admins/:id", (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM Admin WHERE AdminID = ?", [id], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Admin deleted", results });
    });
});



//  CRUD FOR COMMUNICATION

// Get communications for a patient
app.get("/communications/patient/:patientId", (req, res) => {
    const { patientId } = req.params;
    db.query(
        "SELECT * FROM Communication WHERE PATIENTS_PatientID = ?",
        [patientId],
        (err, results) => {
            if (err) return res.status(500).json(err);
            res.json(results);
        }
    );
});

// Create a new communication
app.post("/communications", (req, res) => {
    const { PATIENTS_PatientID, DOCTOR_DoctorID, CommChannel, MessageType, DateSent } = req.body;
    db.query(
        "INSERT INTO Communication (PATIENTS_PatientID, DOCTOR_DoctorID, CommChannel, MessageType, DateSent) VALUES (?, ?, ?, ?, ?)",
        [PATIENTS_PatientID, DOCTOR_DoctorID, CommChannel, MessageType, DateSent],
        (err, results) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Communication created", results });
        }
    );
});



//  CRUD FOR DOCTOR

// Get all doctors
app.get("/doctors", (req, res) => {
    db.query("SELECT * FROM Doctor", (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// Get a single doctor by DoctorID
app.get("/doctors/:id", (req, res) => {
    const { id } = req.params;
    db.query("SELECT * FROM Doctor WHERE DoctorID = ?", [id], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results[0]);
    });
});

// Create a new doctor
app.post("/doctors", (req, res) => {
    const { FirstName, LastName, Specialization, Phone, Email, OFFICE_OfficeID } = req.body;
    db.query(
        "INSERT INTO Doctor (FirstName, LastName, Specialization, Phone, Email, OFFICE_OfficeID) VALUES (?, ?, ?, ?, ?, ?)",
        [FirstName, LastName, Specialization, Phone, Email, OFFICE_OfficeID],
        (err, results) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Doctor created", results });
        }
    );
});

// Update an existing doctor
app.put("/doctors/:id", (req, res) => {
    const { id } = req.params;
    const { FirstName, LastName, Specialization, Phone, Email, OFFICE_OfficeID } = req.body;
    db.query(
        "UPDATE Doctor SET FirstName = ?, LastName = ?, Specialization = ?, Phone = ?, Email = ?, OFFICE_OfficeID = ? WHERE DoctorID = ?",
        [FirstName, LastName, Specialization, Phone, Email, OFFICE_OfficeID, id],
        (err, results) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Doctor updated", results });
        }
    );
});

// Delete a doctor
app.delete("/doctors/:id", (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM Doctor WHERE DoctorID = ?", [id], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Doctor deleted", results });
    });
});



//  CRUD FOR KIT_HAS_PRODUCTS

// Create a new Kit with products
app.post("/kits", (req, res) => {
    const { KitID, PRODUCT_ProductID } = req.body; // You can send multiple entries as an array if needed
    db.query(
        "INSERT INTO Kit_Has_Products (KitID, PRODUCT_ProductID) VALUES (?, ?)",
        [KitID, PRODUCT_ProductID],
        (err, results) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Kit product added", results });
        }
    );
});

// Get all products in a kit
app.get("/kits/:kitId", (req, res) => {
    const { kitId } = req.params;
    db.query(
        "SELECT * FROM Kit_Has_Products WHERE KitID = ?",
        [kitId],
        (err, results) => {
            if (err) return res.status(500).json(err);
            res.json(results);
        }
    );
});

// Update products in a Kit (replace existing products)
app.put("/kits/:kitId", (req, res) => {
    const { kitId } = req.params;
    const { PRODUCT_ProductID } = req.body; // new product to add
    // For simplicity, delete old entries first
    db.query("DELETE FROM Kit_Has_Products WHERE KitID = ?", [kitId], (err) => {
        if (err) return res.status(500).json(err);
        db.query(
            "INSERT INTO Kit_Has_Products (KitID, PRODUCT_ProductID) VALUES (?, ?)",
            [kitId, PRODUCT_ProductID],
            (err, results) => {
                if (err) return res.status(500).json(err);
                res.json({ message: "Kit products updated", results });
            }
        );
    });
});

// Delete a Kit (and all associated products)
app.delete("/kits/:kitId", (req, res) => {
    const { kitId } = req.params;
    db.query(
        "DELETE FROM Kit_Has_Products WHERE KitID = ?",
        [kitId],
        (err, results) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Kit deleted", results });
        }
    );
});



//  CRUD FOR ORDER

// Create a new order
app.post("/orders", (req, res) => {
    const { PATIENTS_PatientID, DOCTOR_DoctorID, OrderDate, Status, TotalAmount } = req.body;
    db.query(
        "INSERT INTO `Order` (PATIENTS_PatientID, DOCTOR_DoctorID, OrderDate, `Status`, TotalAmount) VALUES (?, ?, ?, ?, ?)",
        [PATIENTS_PatientID, DOCTOR_DoctorID, OrderDate, Status, TotalAmount],
        (err, results) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Order created", results });
        }
    );
});

// Get all orders
app.get("/orders", (req, res) => {
    db.query("SELECT * FROM `Order`", (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// Get one order by OrderID
app.get("/orders/:id", (req, res) => {
    const { id } = req.params;
    db.query("SELECT * FROM `Order` WHERE OrderID = ?", [id], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results[0]);
    });
});

// Update an order
app.put("/orders/:id", (req, res) => {
    const { id } = req.params;
    const { PATIENTS_PatientID, DOCTOR_DoctorID, OrderDate, Status, TotalAmount } = req.body;
    db.query(
        "UPDATE `Order` SET PATIENTS_PatientID = ?, DOCTOR_DoctorID = ?, OrderDate = ?, `Status` = ?, TotalAmount = ? WHERE OrderID = ?",
        [PATIENTS_PatientID, DOCTOR_DoctorID, OrderDate, Status, TotalAmount, id],
        (err, results) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Order updated", results });
        }
    );
});

// Delete an order
app.delete("/orders/:id", (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM `Order` WHERE OrderID = ?", [id], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Order deleted", results });
    });
});



//  CRUD FOR ORDER_DETAIL

// Create a new order detail
app.post("/order-details", (req, res) => {
    const { ORDERS_OrderID, PRODUCTS_ProductID, Quantity, LineTotal } = req.body;
    db.query(
        "INSERT INTO Order_Detail (ORDERS_OrderID, PRODUCTS_ProductID, Quantity, LineTotal) VALUES (?, ?, ?, ?)",
        [ORDERS_OrderID, PRODUCTS_ProductID, Quantity, LineTotal],
        (err, results) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Order detail added", results });
        }
    );
});

// Get all order details for a specific order
app.get("/order-details/:orderId", (req, res) => {
    const { orderId } = req.params;
    db.query(
        "SELECT * FROM Order_Detail WHERE ORDERS_OrderID = ?",
        [orderId],
        (err, results) => {
            if (err) return res.status(500).json(err);
            res.json(results);
        }
    );
});



//  CRUD FOR PATIENT

// Create a new patient
app.post("/patients", (req, res) => {
    const { FirstName, LastName, DateOfBirth, Gender, Phone, Email, Address, City, State, ZipCode, OFFICE_OfficeID } = req.body;
    db.query(
        "INSERT INTO Patient (FirstName, LastName, DateOfBirth, Gender, Phone, Email, Address, City, State, ZipCode, OFFICE_OfficeID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [FirstName, LastName, DateOfBirth, Gender, Phone, Email, Address, City, State, ZipCode, OFFICE_OfficeID],
        (err, results) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Patient created", results });
        }
    );
});

// Get all patients
app.get("/patients", (req, res) => {
    db.query("SELECT * FROM Patient", (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// Get a single patient by PatientID
app.get("/patients/:id", (req, res) => {
    const { id } = req.params;
    db.query("SELECT * FROM Patient WHERE PatientID = ?", [id], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results[0]);
    });
});

// Update a patient
app.put("/patients/:id", (req, res) => {
    const { id } = req.params;
    const { FirstName, LastName, DateOfBirth, Gender, Phone, Email, Address, City, State, ZipCode, OFFICE_OfficeID } = req.body;
    db.query(
        "UPDATE Patient SET FirstName = ?, LastName = ?, DateOfBirth = ?, Gender = ?, Phone = ?, Email = ?, Address = ?, City = ?, State = ?, ZipCode = ?, OFFICE_OfficeID = ? WHERE PatientID = ?",
        [FirstName, LastName, DateOfBirth, Gender, Phone, Email, Address, City, State, ZipCode, OFFICE_OfficeID, id],
        (err, results) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Patient updated", results });
        }
    );
});



//  CRUD FOR PRODUCT

// Create a new product
app.post("/products", (req, res) => {
    const { ProductName, Category, Description, UnitPrice, StockQuantity } = req.body;
    db.query(
        "INSERT INTO Product (ProductName, Category, Description, UnitPrice, StockQuantity) VALUES (?, ?, ?, ?, ?)",
        [ProductName, Category, Description, UnitPrice, StockQuantity],
        (err, results) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Product created", results });
        }
    );
});

// Get all products
app.get("/products", (req, res) => {
    db.query("SELECT * FROM Product", (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// Get a single product by ProductID
app.get("/products/:id", (req, res) => {
    const { id } = req.params;
    db.query("SELECT * FROM Product WHERE ProductID = ?", [id], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results[0]);
    });
});

// Update a product
app.put("/products/:id", (req, res) => {
    const { id } = req.params;
    const { ProductName, Category, Description, UnitPrice, StockQuantity } = req.body;
    db.query(
        "UPDATE Product SET ProductName = ?, Category = ?, Description = ?, UnitPrice = ?, StockQuantity = ? WHERE ProductID = ?",
        [ProductName, Category, Description, UnitPrice, StockQuantity, id],
        (err, results) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Product updated", results });
        }
    );
});

// Delete a product
app.delete("/products/:id", (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM Product WHERE ProductID = ?", [id], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Product deleted", results });
    });
});