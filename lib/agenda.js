/* Próximos eventos mostrados na página inicial.
   Cada item: { data: '2026-12-12', hora: '09:00', tipo: 'Live' ou 'Compra', local: 'cidade ou polo', link: 'https://...' }
   Coloque o evento aqui quando sair o primeiro aviso ao grupo (15 dias antes). Nunca informe barraca nem endereço. */
export const EVENTOS = [];

/* Devolve até 3 eventos de hoje em diante, no horário de Brasília. */
export function proximos(lista = EVENTOS, agora = new Date()) {
  const hoje = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(agora);
  return lista
    .filter((e) => e.data >= hoje)
    .sort((a, b) => `${a.data} ${a.hora}`.localeCompare(`${b.data} ${b.hora}`))
    .slice(0, 3);
}
