import pool from "./db.js";
import express from "express";
import cors from "cors";  
const app = express();
const port = 3000;
app.use(express.json());
app.use(cors());


app.get('/users', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM users');
      res.status(200).json(result.rows);
    } catch (err) {
      res.status(500).json(err);
    }
  });

app.post('/users', async (req, res) => {
    const { name, gmail } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO users (name, gmail) VALUES ($1, $2) RETURNING *',
        [name, gmail]
      );
      res.status(201).send("Data Berhasil Ditambahkan");
    } catch (err) {
      res.status(500).json(err);
    }
  });

  app.get('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      res.status(200).json(result.rows[0]);
    } 
    catch (err) {
      res.status(500).json(err);
    }
  });

  app.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { name, gmail } = req.body;
    try {
      const result = await pool.query(
        'UPDATE users SET name = $1, gmail = $2 WHERE id = $3 RETURNING *',
        [name, gmail, id]
      );
      res.status(200).json(result.rows[0]);
    } catch (err) {
      res.status(500).json(err);
    }
  });

  app.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
      await pool.query('DELETE FROM users WHERE id = $1', [id]);
      res.status(200).send(`User with ID ${id} deleted.`);
    } catch (err) {
      res.status(500).json(err);
    }
  });


app.listen(process.env.PORT, () => {
  console.log("Server Berjalan di Port 3000");
});
