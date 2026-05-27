import { useState } from "react";
import "./App.css";

function App() {
  const pixCopiaCola = "00020101021126400014br.gov.bcb.pix0118lu289997@gmail.com520400005303986540510.005802BR5925LUCAS MENEZES CONSULTORIA6009SAO PAULO622905251KSJPAQS6Y1152DJ2N9G77ECG630408BB";
  const qrCodePix = "/qr_code.png";

  const copiarPix = async () => {
    await navigator.clipboard.writeText(pixCopiaCola);
    alert("PIX copiado!");
  };
  const [form, setForm] = useState({
    quantidade_cotas: "1",
    nome: "",
    whatsapp: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm({
      ...form,
      [name]: value,
    });
  };
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

  const salvarRifa = async (formaPagamento) => {
    if (!form.quantidade_cotas || !form.nome || !form.whatsapp) {
      alert("Preencha quantidade de cotas, nome e WhatsApp.");
      return false;
    }

    const response = await fetch(`${API_URL}/rifas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quantidade_cotas: Number(form.quantidade_cotas),
        nome: form.nome,
        telefone: form.whatsapp,
        status: formaPagamento,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Erro ao salvar rifa.");
      return false;
    }

    return true;
  };

  return (
    <main className="page">
      <section className="hero">
        <div className="tag">Rifa Nordestão 💙</div>

        <h1>
          Rifa Nordestão
          <span>Aracaju-SE</span>
        </h1>

        <p>
          Ajude nossos atletas a participarem do
          <strong> Campeonato Nordestino de Vôlei!</strong>
        </p>
      </section>
      <section className="ctaScroll">
        <a href="#formulario">
          Garantir participação
        </a>
      </section>
      <section className="title">
        <h2>Concorra a <span>prêmios</span> incríveis!</h2>
      </section>

      <section className="prizes">
        <div className="prizeCard">
          <img src="/premio-iphone.jpg" alt="iPhone 17" />
          <h3>📱 iPhone 12</h3>
        </div>
        <div className="prizeCard">
          <img src="/premio-tv.jpg" alt="TV" />
          <h3>📺 TV 32"</h3>
        </div>
        <div className="prizeCard">
          <img src="/premio-camisa.jpg" alt="Camisa da Seleção Brasileira" />
          <h3>👕 Camisa da Seleção Brasileira</h3>
        </div>        
        <div id="formulario" className="ctaBox">
          <div className="price">R$ 10,00</div>
          <div className="buyerForm">
            <p>Preencha seus dados e escolha a forma de pagamento.</p>

            <div className="formGrid">
              <div className="formGroup">
                <label>Quantidade de cotas</label>
                <input
                  type="number"
                  name="quantidade_cotas"
                  min="1"
                  placeholder="Ex: 1"
                  value={form.quantidade_cotas}
                  onChange={handleChange}
                />
              </div>

              <div className="formGroup">
                <label>Nome</label>
                <input
                  name="nome"
                  placeholder="Seu nome"
                  value={form.nome}
                  onChange={handleChange}
                />
              </div>

              <div className="formGroup">
                <label>WhatsApp</label>
                <input
                  name="whatsapp"
                  placeholder="(79) 99999-9999"
                  value={form.whatsapp}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          <a href="#pagamento">Participar agora! ➜</a>
        </div>
      </section>

      <section id="pagamento" className="payment">
        <h2>Pagamento</h2>
        <p>Escolha PIX ou cartão de crédito para comprar sua rifa.</p>

        <div className="paymentGrid">
          <div className="pixCard">
            <h3>PIX</h3>

            <img src={qrCodePix} alt="QR Code PIX" className="qrCode" />

            <small>Escaneie o QR Code ou copie o código PIX</small>

            <div className="copyBox">
              <input value={pixCopiaCola} readOnly />
              <button onClick={copiarPix}>📋</button>
            </div>

            <button
              className="pixButton"
              onClick={async () => {
                const salvou = await salvarRifa("pix_pendente");

                if (salvou) {
                  await copiarPix();
                }
              }}
            >
              Pague no PIX
            </button>
          </div>

          <div className="creditCard">
            <div className="cardFlags">
              <img src="/card.png" alt="Visa" />
            </div>

            <h3>Cartão de crédito</h3>
            <p>Ambiente seguro e confiável</p>

            <a
              href="#"
              onClick={async (event) => {
                event.preventDefault();

                const salvou = await salvarRifa("cartao_pendente");

                if (!salvou) return;

                const response = await fetch(
                  `${API_URL}/criar-pagamento`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      quantidade_cotas: Number(form.quantidade_cotas),
                      nome: form.nome,
                      telefone: form.whatsapp,
                    }),
                  }
                );

                const data = await response.json();

                if (!response.ok) {
                  alert(data.error || "Erro ao gerar pagamento");
                  return;
                }

                window.location.href = data.url;
              }}
            >
              🔒 Pagar agora
            </a>
          </div>
        </div>
      </section>

      <footer>
        <div className="school">
          <strong>Atleta Bernardo</strong>
          <span>Aracaju-SE</span>
        </div>

        <p>
          💛 Sua contribuição transforma sonhos e
          <strong> fortalece o esporte!</strong>
        </p>
      </footer>
    </main>
  );
}

export default App;