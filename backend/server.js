require("dotenv").config();

const { MercadoPagoConfig, Preference } = require("mercadopago");

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});

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

app.post("/criar-pagamento", async (req, res) => {
  try {
    const { quantidade_cotas, nome, telefone } = req.body;

    const valorTotal = Number(quantidade_cotas) * 10;

    const preference = new Preference(client);

    const response = await preference.create({
      body: {
        items: [
          {
            id: "rifa-salesiano",
            title: "Rifa Nordestão",
            description: `${quantidade_cotas} cota(s) da rifa`,
            quantity: 1,
            currency_id: "BRL",
            unit_price: valorTotal,
          },
        ],

        payer: {
          name: nome,
          phone: {
            number: telefone,
          },
        },

        payment_methods: {
          excluded_payment_types: [],
          installments: 2,
        },

        statement_descriptor: "RIFA",

        external_reference: `${Date.now()}`,

        back_urls: {
          success: "https://rifa-sal-front.onrender.com",
          failure: "https://rifa-sal-front.onrender.com",
          pending: "https://rifa-sal-front.onrender.com",
        },

        auto_return: "approved",
      },
    });

    res.json({
      url: response.init_point,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Erro ao criar pagamento",
    });
  }
});