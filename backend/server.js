const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./rifas.db");

// cria tabela
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS rifas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quantidade_cotas INTEGER NOT NULL,
      nome TEXT NOT NULL,
      telefone TEXT NOT NULL,
      status TEXT DEFAULT 'pendente',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

// salvar rifa
app.post("/rifas", (req, res) => {
  const { quantidade_cotas, nome, telefone, status } = req.body;

  if (!quantidade_cotas || !nome || !telefone) {
    return res.status(400).json({
      error: "Preencha quantidade de cotas, nome e telefone",
    });
  }

  const sql = `
    INSERT INTO rifas (quantidade_cotas, nome, telefone, status)
    VALUES (?, ?, ?, ?)
  `;

  db.run(
    sql,
    [quantidade_cotas, nome, telefone, status || "pendente"],
    function (err) {
      if (err) {
        return res.status(400).json({
          error: "Erro ao salvar rifa",
        });
      }

      res.json({
        success: true,
        id: this.lastID,
      });
    }
  );
});

// listar rifas
app.get("/rifas", (req, res) => {
  db.all("SELECT * FROM rifas ORDER BY id DESC", [], (err, rows) => {
    if (err) {
      return res.status(500).json({
        error: err.message,
      });
    }

    res.json(rows);
  });
});
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});