export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  try {
    const { cliente, carrinho, total } = req.body;

    // Simular geração de PIX
    const pedidoId = `PED-${Date.now()}`;
    
    res.status(200).json({
      sucesso: true,
      pedidoId: pedidoId,
      pix: {
        chave: "sua-chave-pix@banco.com",
        valor: parseFloat(total),
        transactionId: `TRX-${Date.now()}`,
      },
      qrCode: "QR_CODE_SIMULADO",
      mensagem: "PIX gerado com sucesso!",
    });
  } catch (erro) {
    console.error("Erro:", erro);
    res.status(500).json({ erro: "Erro ao processar PIX" });
  }
}
