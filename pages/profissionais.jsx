import React, { useState } from 'react';
import RuralLayout from '../components/RuralLayout';
import styles from '../styles/rural.module.css';

const AREAS = [
  ['agronomo', 'Engenheiro agrônomo'],
  ['eng_civil', 'Engenheiro civil'],
  ['topografo', 'Topógrafo / agrimensor'],
  ['eng_ambiental', 'Engenheiro ambiental ou florestal'],
  ['advogado', 'Advogado (agrário / imobiliário)'],
  ['contador', 'Contador rural'],
  ['outro', 'Outra área técnica'],
];
const CONSELHOS = ['CREA', 'CFT', 'OAB', 'CRC', 'outro'];
const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

const VANTAGENS = [
  ['🤝', 'Contrato por serviço', 'Você atua como profissional independente: sem horário definido por nós e sem exclusividade.'],
  ['✍️', 'Quem assina, executa', 'Você assina somente o que realmente executou ou supervisionou, dentro das regras do seu conselho.'],
  ['📍', 'Projetos da sua região', 'Quando um cliente precisar da sua área, apresentamos o projeto e você decide se aceita.'],
  ['💬', 'Você combina o seu preço', 'O orçamento do seu serviço é seu. Nós coordenamos o atendimento ao cliente.'],
];

const INICIAL = {
  nome: '', email: '', whatsapp: '', area: '', conselho: '', registro: '', uf_registro: '',
  cidade: '', estado: '', raio_km: '', atende_remoto: 'nao', servicos: '', faixa_preco: '',
  aceite_termos: false, site: '',
};

export default function Profissionais() {
  const [f, setF] = useState(INICIAL);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState(null); // { ok, msg }

  const mudar = (campo) => (e) => {
    const valor = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setF((anterior) => ({ ...anterior, [campo]: valor }));
  };

  async function enviar(e) {
    e.preventDefault();
    setEnviando(true);
    setResultado(null);
    try {
      const r = await fetch('/api/profissional', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(f),
      });
      const dados = await r.json().catch(() => ({}));
      if (r.ok && dados.ok) {
        setResultado({ ok: true, msg: 'Cadastro recebido! Vamos conferir o seu registro no conselho e responder pelo e-mail informado.' });
        setF(INICIAL);
      } else {
        setResultado({ ok: false, msg: dados.erro || 'Não foi possível enviar agora. Tente novamente.' });
      }
    } catch {
      setResultado({ ok: false, msg: 'Sem conexão. Verifique a internet e tente novamente.' });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <RuralLayout
      titulo="Seja um profissional parceiro | Igreja Eco"
      descricao="Cadastro de profissionais habilitados (agrônomos, engenheiros, topógrafos, advogados e contadores) para projetos de propriedades rurais."
    >
      <section className={styles.hero}>
        <div className={styles.contido}>
          <p className={styles.sobretitulo}>Rede de profissionais parceiros</p>
          <h1 className={styles.heroTitulo}>Receba projetos de propriedades rurais na sua área</h1>
          <p className={styles.heroTexto}>
            Agrônomos, engenheiros, topógrafos, advogados e contadores: cadastre-se para ser indicado aos
            clientes que precisam de um profissional habilitado.
          </p>
          <div className={styles.acoes}>
            <a href="#cadastro" className={styles.botao}>Fazer o meu cadastro</a>
          </div>
        </div>
      </section>

      <section className={styles.secao}>
        <div className={styles.contido}>
          <p className={styles.sobretituloEscuro}>Como funciona a parceria</p>
          <h2 className={styles.titulo}>Simples, transparente e dentro da regra</h2>
          <div className={styles.grade} style={{ marginTop: 24 }}>
            {VANTAGENS.map(([i, t, d]) => (
              <div key={t} className={styles.cartao}>
                <span className={styles.cartaoIcone} aria-hidden="true">{i}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="cadastro" className={`${styles.secao} ${styles.secaoClara}`}>
        <div className={`${styles.contido} ${styles.duas}`}>
          <div className={styles.caixa}>
            <h2 className={styles.titulo} style={{ fontSize: '1.5rem' }}>Cadastro de profissional</h2>
            <p className={styles.subtitulo} style={{ marginBottom: 20 }}>
              Todo cadastro é conferido no conselho antes de ser aprovado.
            </p>

            <form className={styles.form} onSubmit={enviar} noValidate={false}>
              <div className={styles.campo}>
                <label htmlFor="nome">Nome completo *</label>
                <input id="nome" required minLength={3} value={f.nome} onChange={mudar('nome')} autoComplete="name" />
              </div>

              <div className={styles.linha2}>
                <div className={styles.campo}>
                  <label htmlFor="email">E-mail *</label>
                  <input id="email" type="email" required value={f.email} onChange={mudar('email')} autoComplete="email" />
                </div>
                <div className={styles.campo}>
                  <label htmlFor="whatsapp">WhatsApp (com DDD)</label>
                  <input id="whatsapp" type="tel" value={f.whatsapp} onChange={mudar('whatsapp')} autoComplete="tel" />
                </div>
              </div>

              <div className={styles.linha2}>
                <div className={styles.campo}>
                  <label htmlFor="area">Área de atuação *</label>
                  <select id="area" required value={f.area} onChange={mudar('area')}>
                    <option value="">Selecione</option>
                    {AREAS.map(([v, r]) => <option key={v} value={v}>{r}</option>)}
                  </select>
                </div>
                <div className={styles.campo}>
                  <label htmlFor="conselho">Conselho profissional *</label>
                  <select id="conselho" required value={f.conselho} onChange={mudar('conselho')}>
                    <option value="">Selecione</option>
                    {CONSELHOS.map((c) => <option key={c} value={c}>{c === 'outro' ? 'Outro' : c}</option>)}
                  </select>
                </div>
              </div>

              {f.area === 'advogado' && (
                <p className={styles.aviso} style={{ margin: 0 }}>
                  Para advogados, o cadastro é apenas informativo. Não há captação de clientela nem divisão de
                  honorários, conforme as regras de ética da OAB.
                </p>
              )}

              <div className={styles.linha2}>
                <div className={styles.campo}>
                  <label htmlFor="registro">Número do registro no conselho *</label>
                  <input id="registro" required value={f.registro} onChange={mudar('registro')} />
                </div>
                <div className={styles.campo}>
                  <label htmlFor="uf_registro">UF do registro</label>
                  <select id="uf_registro" value={f.uf_registro} onChange={mudar('uf_registro')}>
                    <option value="">Selecione</option>
                    {UFS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              <div className={styles.linha2}>
                <div className={styles.campo}>
                  <label htmlFor="cidade">Cidade onde atende</label>
                  <input id="cidade" value={f.cidade} onChange={mudar('cidade')} />
                </div>
                <div className={styles.campo}>
                  <label htmlFor="estado">Estado</label>
                  <select id="estado" value={f.estado} onChange={mudar('estado')}>
                    <option value="">Selecione</option>
                    {UFS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              <div className={styles.linha2}>
                <div className={styles.campo}>
                  <label htmlFor="raio_km">Raio de atendimento (km)</label>
                  <input id="raio_km" type="number" min="0" max="5000" value={f.raio_km} onChange={mudar('raio_km')} />
                </div>
                <div className={styles.campo}>
                  <label htmlFor="atende_remoto">Atende de forma remota?</label>
                  <select id="atende_remoto" value={f.atende_remoto} onChange={mudar('atende_remoto')}>
                    <option value="nao">Não</option>
                    <option value="sim">Sim</option>
                  </select>
                </div>
              </div>

              <div className={styles.campo}>
                <label htmlFor="servicos">Serviços que você oferece</label>
                <textarea id="servicos" maxLength={800} value={f.servicos} onChange={mudar('servicos')}
                  placeholder="Ex.: projeto de fossa e poço, laudos, CAR e PRA, georreferenciamento..." />
              </div>

              <div className={styles.campo}>
                <label htmlFor="faixa_preco">Forma de cobrança ou faixa de preço</label>
                <input id="faixa_preco" maxLength={120} value={f.faixa_preco} onChange={mudar('faixa_preco')}
                  placeholder="Ex.: por projeto, por hora, orçamento sob consulta" />
              </div>

              {/* campo-armadilha para robôs: pessoas não veem nem preenchem */}
              <div className={styles.armadilha} aria-hidden="true">
                <label htmlFor="site">Não preencha este campo</label>
                <input id="site" tabIndex={-1} autoComplete="off" value={f.site} onChange={mudar('site')} />
              </div>

              <label className={styles.marcar}>
                <input type="checkbox" required checked={f.aceite_termos} onChange={mudar('aceite_termos')} />
                <span>
                  Declaro que os dados são verdadeiros e que sou habilitado no conselho informado. Concordo que meus dados
                  sejam usados para analisar o cadastro e entrar em contato sobre serviços, e posso pedir a exclusão a
                  qualquer momento por e-mail ou WhatsApp. *
                </span>
              </label>

              {resultado && (
                <div className={resultado.ok ? styles.ok : styles.erro} role="status">{resultado.msg}</div>
              )}

              <div>
                <button type="submit" className={styles.botaoVerde} disabled={enviando}>
                  {enviando ? 'Enviando...' : 'Enviar cadastro'}
                </button>
              </div>
            </form>
          </div>

          <div>
            <p className={styles.sobretituloEscuro}>Antes de se cadastrar</p>
            <h2 className={styles.titulo}>O que acontece depois</h2>
            <ol style={{ paddingLeft: 20, display: 'grid', gap: 10, margin: '0 0 20px' }}>
              <li>Recebemos o cadastro e conferimos o seu registro na consulta pública do conselho.</li>
              <li>Você recebe a resposta por e-mail: aprovado ou com pedido de correção.</li>
              <li>Quando surgir um cliente na sua área e região, entramos em contato com o projeto.</li>
              <li>Você decide se aceita, combina o orçamento e executa o serviço.</li>
            </ol>
            <p className={styles.avisoVerde}>
              O cadastro não gera vínculo de emprego nem obrigação de aceitar projetos. Cada serviço é fechado por
              contrato próprio.
            </p>
          </div>
        </div>
      </section>
    </RuralLayout>
  );
}
