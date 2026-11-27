import React from 'react';
import ModaLayout from '../../lib/ModaLayout';
import s from '../../styles/moda.module.css';

export default function Participar() {
  return (
    <ModaLayout titulo="Quero participar" descricao="Como falar com a gente sobre a Loja de Moda e Lembranças.">
      <div className={s.texto}>
        <h1>Quero participar</h1>
        <p>Fale com a gente para marcar uma conversa online. Isso ainda não é um contrato nem uma compra.</p>
        <h2>Já tem o meu número?</h2>
        <p>Envie uma mensagem no WhatsApp dizendo o seu nome, a cidade e o plano de interesse.</p>
        <h2>Pelo Telegram: em breve</h2>
        <p>Estamos preparando um atendimento automático para tirar dúvidas e anotar o seu interesse.</p>
        <h2>Acompanhe as lives</h2>
        <p><a href="https://www.youtube.com/@RicardoBello-o6v/streams" target="_blank" rel="noopener noreferrer">Abrir o canal no YouTube</a></p>
      </div>
    </ModaLayout>
  );
}
