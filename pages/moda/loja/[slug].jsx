import React from 'react';
import { useRouter } from 'next/router';
import ModaLayout from '../../../lib/ModaLayout';
import VitrineLive from '../../../lib/VitrineLive';

export default function LojaDoMembro() {
  const { query, isReady } = useRouter();
  return (
    <ModaLayout titulo="Loja do membro" descricao="Loja de membro da Loja de Moda e Lembranças.">
      <VitrineLive slug={isReady ? String(query.slug) : undefined} />
    </ModaLayout>
  );
}
