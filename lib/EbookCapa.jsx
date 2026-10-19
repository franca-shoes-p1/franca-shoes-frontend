// Capa gerada automaticamente (sem precisar de arquivo de imagem).
// Se o e-book tiver "Endereço da capa" preenchido no painel, a imagem enviada tem prioridade.
const httpsOk = (u) => typeof u === 'string' && u.startsWith('https://');

const CORES = [
  { bg: '#F2B632', fg: '#14201A', fg2: '#3A4A1C' },
  { bg: '#1F4D3A', fg: '#FFFFFF', fg2: '#F2B632' },
  { bg: '#E6EDDF', fg: '#14201A', fg2: '#2E6B50' },
  { bg: '#14201A', fg: '#FFFFFF', fg2: '#F2B632' },
];

const soma = (s) => String(s || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
const ehAves = (t) => /galinh|\bave|aves|caipira|poedeir|frango/i.test(t || '');

function Galinha() {
  return (
    <svg viewBox="0 0 300 250" aria-hidden="true">
      <path d="M56 128 C22 104 16 70 36 46 C46 74 64 90 88 104 Z" fill="#1F4D3A" />
      <path d="M50 146 C14 138 6 108 14 86 C34 104 54 114 78 122 Z" fill="#2E6B50" />
      <ellipse cx="142" cy="152" rx="92" ry="66" fill="#FFFFFF" />
      <path d="M98 146 C112 116 172 114 188 150 C178 184 120 188 98 146 Z" fill="#F2D6A0" />
      <circle cx="214" cy="98" r="34" fill="#FFFFFF" />
      <path d="M198 68 C192 50 206 44 212 58 C214 42 230 44 230 60 C240 52 250 64 238 74 Z" fill="#D8432F" />
      <path d="M246 96 L274 106 L246 116 Z" fill="#F2B632" />
      <path d="M238 118 C250 126 248 144 237 141 C230 133 231 125 238 118 Z" fill="#D8432F" />
      <circle cx="224" cy="92" r="4.5" fill="#14201A" />
      <path
        d="M130 214 L127 244 M127 244 L111 247 M127 244 L136 249 M168 214 L170 244 M170 244 L154 247 M170 244 L179 249"
        stroke="#F2B632"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function Folhas() {
  return (
    <svg viewBox="0 0 300 250" aria-hidden="true">
      <circle cx="220" cy="70" r="44" fill="#F2B632" />
      <path d="M40 250 C30 190 60 140 110 120 C120 170 100 220 40 250 Z" fill="#2E6B50" />
      <path d="M120 250 C110 180 150 130 205 118 C212 176 180 226 120 250 Z" fill="#FFFFFF" opacity="0.92" />
      <path d="M200 250 C196 200 226 160 268 150 C272 196 248 232 200 250 Z" fill="#F2B632" />
    </svg>
  );
}

export default function EbookCapa({ titulo, nicho, capaUrl, slug }) {
  if (httpsOk(capaUrl)) {
    return (
      <div className="ebc ebc-img">
        <img src={capaUrl} alt={titulo || 'Capa do e-book'} loading="lazy" />
      </div>
    );
  }
  const aves = ehAves(`${titulo} ${nicho}`);
  const c = aves ? CORES[0] : CORES[soma(slug || titulo) % CORES.length];
  return (
    <div className="ebc" role="img" aria-label={`Capa: ${titulo || ''}`} style={{ background: c.bg }}>
      <div className="ebc-top">
        {nicho && (
          <div className="ebc-nicho" style={{ color: c.fg2 }}>
            {nicho}
          </div>
        )}
        <div className="ebc-tit" style={{ color: c.fg }}>
          {titulo}
        </div>
      </div>
      <div className="ebc-bot">{aves ? <Galinha /> : <Folhas />}</div>
    </div>
  );
}
