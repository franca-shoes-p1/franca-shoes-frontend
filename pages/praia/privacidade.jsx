import React from 'react';
import styles from '../../styles/home.module.css';
import p from '../../styles/praia.module.css';
import PraiaLayout from '../../lib/PraiaLayout';

export default function Privacidade() {
  return (
    <PraiaLayout titulo="Privacidade">
      <section className={`${styles.secao} ${styles.clara}`}>
        <div className={styles.contido + ' ' + p.texto}>
          <p className={styles.sobre}>Privacidade</p>
          <h1 className={styles.h2}>Como cuidamos dos seus dados</h1>
          <h2>O que coletamos</h2>
          <p>Nome, WhatsApp, cidade, bairro, se você tem PIX, disponibilidade e experiência. Só o que você preenche no cadastro.</p>
          <h2>Para que usamos</h2>
          <p>Apenas para falar com você sobre a parceria do Parceiros da Praia, organizar vagas e, se você entrar, registrar a retirada de estoque e os fechamentos do dia.</p>
          <h2>Com quem compartilhamos</h2>
          <p>Não vendemos nem repassamos seus dados. Eles ficam em um banco de dados protegido, com acesso restrito à coordenação.</p>
          <h2>Seus direitos</h2>
          <p>Você pode pedir para ver, corrigir ou apagar os seus dados a qualquer momento, pelo WhatsApp do site. Depois de apagados, você sai da lista de vagas.</p>
          <h2>Importante</h2>
          <p>Este texto é um resumo simples. Antes de abrir o recrutamento, ele deve ser revisado por advogado ou contador.</p>
        </div>
      </section>
    </PraiaLayout>
  );
}
