// import pool from "./db.js";
// import express from "express";
// import cors from "cors";  
// const app = express();
// const port = 3000;
// app.use(express.json());
// app.use(cors());


// app.get('/users', async (req, res) => {
//     try {
//       const result = await pool.query('SELECT * FROM users');
//       res.status(200).json(result.rows);
//     } catch (err) {
//       res.status(500).json(err);
//     }
//   });

// app.post('/users', async (req, res) => {
//     const { name, gmail } = req.body;
//     try {
//       const result = await pool.query(
//         'INSERT INTO users (name, gmail) VALUES ($1, $2) RETURNING *',
//         [name, gmail]
//       );
//       res.status(201).send("Data Berhasil Ditambahkan");
//     } catch (err) {
//       res.status(500).json(err);
//     }
//   });

//   app.get('/users/:id', async (req, res) => {
//     const { id } = req.params;
//     try {
//       const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
//       res.status(200).json(result.rows[0]);
//     } 
//     catch (err) {
//       res.status(500).json(err);
//     }
//   });

//   app.put('/users/:id', async (req, res) => {
//     const { id } = req.params;
//     const { name, gmail } = req.body;
//     try {
//       const result = await pool.query(
//         'UPDATE users SET name = $1, gmail = $2 WHERE id = $3 RETURNING *',
//         [name, gmail, id]
//       );
//       res.status(200).json(result.rows[0]);
//     } catch (err) {
//       res.status(500).json(err);
//     }
//   });

//   app.delete('/users/:id', async (req, res) => {
//     const { id } = req.params;
//     try {
//       await pool.query('DELETE FROM users WHERE id = $1', [id]);
//       res.status(200).send(`User with ID ${id} deleted.`);
//     } catch (err) {
//       res.status(500).json(err);
//     }
//   });


// app.listen(process.env.PORT, () => {
//   console.log("Server Berjalan di Port 3000");
// });

import express from "express";
import cors from "cors";
import  pool from "./db.js";
import jwt from "jsonwebtoken";
import argon2 from "argon2";
import cookieParser from "cookie-parser";
import { verifyToken } from "./middleware/auth.js";

const app =  express();
const PORT = process.env.SERVER_PORT || 3000;

// middlewares
app.use(
    cors({
        origin: "http://localhost:5173", // Izinkan akses dari frontend
        credentials: true,
    })
);  

app.use(express.json());
app.use(cookieParser());
// Endpoint POST Register
app.post('/api/register', async (req, res) => {
  const { gmail,name, password} = req.body;
  try {
    const hashedPassword=await argon2.hash(password);
    const result = await pool.query(
      'INSERT INTO users (gmail,name, password) VALUES ($1, $2, $3) RETURNING *',
      [gmail,name,hashedPassword]
    );
    res.status(201).json({message:"Registrasi Berhasil!",user:result.rows[0]  });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint POST Login
app.post("/api/login", async (req, res) => {
  try {

    const { name, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE name = $1",
      [name]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User tidak ditemukan"
      });
    }

    const user = result.rows[0];

    const cekHashing = await argon2.verify(user.password, password);

    if (!cekHashing) {
      return res.status(401).json({
        message: "Password salah"
      });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name },
      process.env.SECRET_KEY
    );

    res.json({
      token,
      message: "Login berhasil"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error"
    });
  }
});

// Endpoint: Protected Route
app.get('/api/profile', verifyToken, async (req, res) => {
    try {
        // Ambil username dari token yang sudah diverifikasi oleh middleware
        const { name } = req.user;

        // Query database untuk mendapatkan gmail dan username
      const result = await pool.query('SELECT gmail, name FROM users WHERE name = $1', [name]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User tidak ditemukan!' });
        }
        // Kirim response dengan data user
        res.json({
            message: 'Access granted!',
            user: result.rows[0], // { gmail, name }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error profile', error });
    }
});



// Endpoint GET all users
app.get('/api/users', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM users');
      res.json(result.rows)
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

app.post("/api/logout", (req, res) => {
  res.json({
    message: "Logout berhasil"
  });
});

app.listen(PORT, () =>{
    console.log("Server berjalan di port 3000");
})

export default app;