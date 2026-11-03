import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../../styles/home.module.css';
import p from '../../styles/praia.module.css';
import PraiaLayout from '../../lib/PraiaLayout';

export default function Obrigado() {
  const { query } = useRouter();
  const lista = query.lista === '1';
  return (
    <PraiaLayout titulo="Cadastro recebido">
      <section className={`${styles.secao} ${styles.clara}`}>
        <div className={styles.contido}>
          <div className={p.card} style={{ maxWidth: 640 }}>
            <div className={styles.emoji}>🌊</div>
            <h1 className={styles.h2} style={{ marginTop: 12 }}>Recebemos o seu cadastro.</h1>
            <p>{lista ? 'No momento não há vaga aberta na sua cidade, então você entrou na lista de espera. Chamamos no WhatsApp quando abrir.' : 'A coordenação vai chamar você no WhatsApp para conversar sobre a parceria e os próximos passos.'}</p>
            <p style={{ marginTop: 10 }}>Enquanto isso, vale começar a se informar sobre o cadastro de ambulante e o curso de manipulação de alimentos na sua prefeitura.</p>
            <div className={styles.acoes} style={{ marginTop: 22 }}>
              <Link href="/praia" className={`${styles.botao} ${styles.principal}`}>Voltar ao Parceiros da Praia</Link>
            </div>
          </div>
        </div>
      </section>
    </PraiaLayout>
  );
}
