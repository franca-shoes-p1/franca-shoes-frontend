import React from 'react';
import ModaLayout from '../../lib/ModaLayout';
import VitrineLive from '../../lib/VitrineLive';

export default function Vitrine() {
  return (
    <ModaLayout titulo="Vitrine ao vivo" descricao="Produtos mostrados nas lives, com preços.">
      <VitrineLive slug={null} />
    </ModaLayout>
  );
}
