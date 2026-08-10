import { useState } from "react";
import Link from "next/link";
import styles from "../styles/index.module.css";

export default function Home() {
  const [mensagem, setMensagem] = useState("");

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <div className={styles.conteudo}>
          <h1>🚀 Franca Shoes - v5.1</h1>
          <p className={styles.subtitulo}>Bem-vindo ao Franca Shoes Empire!</p>
          <p className={styles.descricao}>7 Nichos, 1 Plataforma, Infinitas Possibilidades</p>
          
          <Link href="/loja">
            <button className={styles.botao}>
              Entrar na Loja →
            </button>
          </Link>
        </div>

        <div className={styles.imagem}>
          <img src="https://via.placeholder.com/300x300?text=Tênis" alt="Tênis" />
        </div>
      </div>

      {/* Resto do conteúdo da home */}
      <div className={styles.nichos}>
        <h2>7 Nichos Disponíveis:</h2>
        <div className={styles.gridNichos}>
          <div className={styles.nicho}>
            <h3>👟 Calçados</h3>
            <p>Sapatos e tênis para todos</p>
          </div>
          <div className={styles.nicho}>
            <h3>👗 Moda Feminina</h3>
            <p>Roupas elegantes e confortáveis</p>
          </div>
          <div className={styles.nicho}>
            <h3>👕 Moda Masculina</h3>
            <p>Estilo clássico e moderno</p>
          </div>
          <div className={styles.nicho}>
            <h3>⚽ Esporte/Fitness</h3>
            <p>Equipamento esportivo completo</p>
          </div>
          <div className={styles.nicho}>
            <h3>👶 Infantil</h3>
            <p>Tudo para os pequenos</p>
          </div>
          <div className={styles.nicho}>
            <h3>🌱 Sustentável/Eco</h3>
            <p>Produtos amigos do meio ambiente</p>
          </div>
          <div className={styles.nicho}>
            <h3>✝️ Religião + Agroecologia</h3>
            <p>Comunidade cristã + Alimentação natural</p>
          </div>
        </div>
      </div>

      <div className={styles.cta}>
        <Link href="/loja">
          <button className={styles.botaoPrincipal}>
            Começar Agora →
          </button>
        </Link>
      </div>
    </div>
  );
}
