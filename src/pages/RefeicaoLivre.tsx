import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';
import { motion, AnimatePresence } from 'framer-motion';

// Dicionário mantido exatamente como o teu
const DICIONARIO_ALIMENTOS = {
  cafeManha: [
    { id: 'pao', nome: 'Pão Francês', emoji: '🥖', kcal100g: 280, prot: 9, carbo: 58, gord: 3 }, 
    { id: 'tapioca', nome: 'Tapioca', emoji: '🌮', kcal100g: 340, prot: 0, carbo: 85, gord: 0 },
    { id: 'ovo', nome: 'Ovo', emoji: '🍳', kcal100g: 155, prot: 13, carbo: 1, gord: 11 }, 
    { id: 'queijo', nome: 'Queijo', emoji: '🧀', kcal100g: 350, prot: 25, carbo: 2, gord: 30 },
    { id: 'cuscuz', nome: 'Cuscuz', emoji: '🌽', kcal100g: 110, prot: 3, carbo: 23, gord: 1 }, 
    { id: 'aveia', nome: 'Aveia', emoji: '🥣', kcal100g: 380, prot: 16, carbo: 66, gord: 7 },
    { id: 'banana', nome: 'Banana', emoji: '🍌', kcal100g: 90, prot: 1, carbo: 23, gord: 0 }, 
    { id: 'maca', nome: 'Maçã', emoji: '🍎', kcal100g: 52, prot: 0, carbo: 14, gord: 0 },
    { id: 'mamao', nome: 'Mamão', emoji: '🍈', kcal100g: 43, prot: 0, carbo: 11, gord: 0 }, 
    { id: 'leite', nome: 'Leite / Iogurte', emoji: '🥛', kcal100g: 60, prot: 3, carbo: 5, gord: 3 },
    { id: 'cafe', nome: 'Café', emoji: '☕', kcal100g: 2, prot: 0, carbo: 0, gord: 0 }, 
    { id: 'bolo', nome: 'Bolo Caseiro', emoji: '🥮', kcal100g: 350, prot: 5, carbo: 50, gord: 15 },
  ],
  almoco: [
    { id: 'arroz', nome: 'Arroz', emoji: '🍚', kcal100g: 130, prot: 2, carbo: 28, gord: 0 }, 
    { id: 'feijao', nome: 'Feijão', emoji: '🍲', kcal100g: 75, prot: 5, carbo: 14, gord: 0 },
    { id: 'frango', nome: 'Frango', emoji: '🍗', kcal100g: 165, prot: 31, carbo: 0, gord: 3 }, 
    { id: 'carne', nome: 'Carne', emoji: '🥩', kcal100g: 250, prot: 26, carbo: 0, gord: 15 },
    { id: 'peixe', nome: 'Peixe', emoji: '🐟', kcal100g: 105, prot: 20, carbo: 0, gord: 2 }, 
    { id: 'batatadoce', nome: 'Batata / Mandioca', emoji: '🍠', kcal100g: 86, prot: 1, carbo: 20, gord: 0 },
    { id: 'pure', nome: 'Purê', emoji: '🥔', kcal100g: 110, prot: 2, carbo: 15, gord: 4 }, 
    { id: 'macarrao', nome: 'Macarrão', emoji: '🍝', kcal100g: 158, prot: 5, carbo: 30, gord: 1 },
    { id: 'salada', nome: 'Salada', emoji: '🥗', kcal100g: 15, prot: 1, carbo: 3, gord: 0 }, 
    { id: 'legumes', nome: 'Legumes', emoji: '🥦', kcal100g: 35, prot: 2, carbo: 7, gord: 0 },
    { id: 'ovo_almoco', nome: 'Ovo Cozido', emoji: '🥚', kcal100g: 155, prot: 13, carbo: 1, gord: 11 }, 
    { id: 'farofa', nome: 'Farofa', emoji: '🌾', kcal100g: 400, prot: 2, carbo: 80, gord: 8 },
  ],
  lancheTarde: [
    { id: 'paodequeijo', nome: 'Pão de Queijo', emoji: '🧀', kcal100g: 330, prot: 5, carbo: 40, gord: 15 }, 
    { id: 'fruta_tarde', nome: 'Frutas', emoji: '🍌', kcal100g: 80, prot: 1, carbo: 20, gord: 0 },
    { id: 'vitamina', nome: 'Vitamina', emoji: '🥤', kcal100g: 85, prot: 3, carbo: 12, gord: 2 }, 
    { id: 'tapioca_tarde', nome: 'Tapioca', emoji: '🌮', kcal100g: 340, prot: 0, carbo: 85, gord: 0 },
    { id: 'castanhas', nome: 'Castanhas', emoji: '🥜', kcal100g: 600, prot: 15, carbo: 20, gord: 55 }, 
    { id: 'iogurte', nome: 'Iogurte', emoji: '🍶', kcal100g: 60, prot: 3, carbo: 5, gord: 3 },
    { id: 'cafe_tarde', nome: 'Café / Chá', emoji: '☕', kcal100g: 2, prot: 0, carbo: 0, gord: 0 }, 
    { id: 'biscoito', nome: 'Biscoito', emoji: '🍪', kcal100g: 450, prot: 6, carbo: 70, gord: 15 },
    { id: 'crepioca', nome: 'Crepioca', emoji: '🍳', kcal100g: 200, prot: 8, carbo: 25, gord: 7 }, 
    { id: 'sanduiche', nome: 'Sanduíche', emoji: '🥪', kcal100g: 250, prot: 12, carbo: 30, gord: 8 },
  ],
  cafeTarde: [
    { id: 'cuscuz_tarde', nome: 'Cuscuz', emoji: '🌽', kcal100g: 110, prot: 3, carbo: 23, gord: 1 },
    { id: 'pao_chapa', nome: 'Pão na Chapa', emoji: '🍞', kcal100g: 300, prot: 7, carbo: 50, gord: 8 },
    { id: 'bolo_tarde', nome: 'Bolo Simples', emoji: '🥮', kcal100g: 350, prot: 5, carbo: 50, gord: 15 },
    { id: 'fruta_l', nome: 'Fruta', emoji: '🍎', kcal100g: 52, prot: 0, carbo: 14, gord: 0 },
    { id: 'cha', nome: 'Chá', emoji: '🍵', kcal100g: 2, prot: 0, carbo: 0, gord: 0 },
  ],
  janta: [
    { id: 'frango_janta', nome: 'Frango', emoji: '🍗', kcal100g: 165, prot: 31, carbo: 0, gord: 3 }, 
    { id: 'sopa', nome: 'Sopa', emoji: '🍲', kcal100g: 50, prot: 2, carbo: 8, gord: 1 },
    { id: 'omelete', nome: 'Omelete', emoji: '🍳', kcal100g: 155, prot: 13, carbo: 1, gord: 11 }, 
    { id: 'salada_janta', nome: 'Salada', emoji: '🥗', kcal100g: 15, prot: 1, carbo: 3, gord: 0 },
    { id: 'arroz_janta', nome: 'Arroz', emoji: '🍚', kcal100g: 130, prot: 2, carbo: 28, gord: 0 }, 
    { id: 'pure_janta', nome: 'Purê', emoji: '🥔', kcal100g: 110, prot: 2, carbo: 15, gord: 4 },
    { id: 'wrap', nome: 'Wrap Fit', emoji: '🌯', kcal100g: 220, prot: 10, carbo: 25, gord: 8 }, 
    { id: 'legumes_assados', nome: 'Legumes', emoji: '🥕', kcal100g: 65, prot: 2, carbo: 10, gord: 2 },
    { id: 'carne_janta', nome: 'Carne Magra', emoji: '🥩', kcal100g: 180, prot: 26, carbo: 0, gord: 7 }, 
    { id: 'peixe_janta', nome: 'Peixe', emoji: '🐟', kcal100g: 105, prot: 20, carbo: 0, gord: 2 },
  ],
  lancheNoite: [
    { id: 'chapa_noite', nome: 'Chá Relaxante', emoji: '🍵', kcal100g: 2, prot: 0, carbo: 0, gord: 0 },
    { id: 'ceia_fruta', nome: 'Fruta Leve', emoji: '🍌', kcal100g: 90, prot: 1, carbo: 23, gord: 0 },
    { id: 'iogurte_noite', nome: 'Iogurte Proteico', emoji: '🥛', kcal100g: 65, prot: 8, carbo: 6, gord: 1 },
    { id: 'barra_cereal', nome: 'Barra de Cereal', emoji: '🥜', kcal100g: 400, prot: 6, carbo: 65, gord: 10 },
  ],
};

export function RefeicaoLivre() {
  const navigate = useNavigate();
  const dados = useUserStore((state: any) => state.dados);
  const registrarRefeicao = useUserStore((state: any) => state.registrarRefeicao);
  const temaEscuro = dados?.temaEscuro ?? true;

  const todosOsAlimentos = useMemo(() => {
    const listaCompleta: any[] = [];
    const idsVistos = new Set();
    Object.values(DICIONARIO_ALIMENTOS).flat().forEach((alimento) => {
      const nomeBase = alimento.nome.toLowerCase();
      if (!idsVistos.has(nomeBase)) {
        listaCompleta.push(alimento);
        idsVistos.add(nomeBase);
      }
    });
    return listaCompleta.sort((a, b) => a.nome.localeCompare(b.nome));
  }, []);

  const [busca, setBusca] = useState('');
  const [porcoes, setPorcoes] = useState<Record<string, number>>({});
  const [toastMsg, setToastMsg] = useState('');

  const alimentosFiltrados = todosOsAlimentos.filter(alimento => 
    alimento.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const toggleAlimento = (idAlimento: string) => {
    setPorcoes(prev => {
      const novo = { ...prev };
      if (novo[idAlimento] !== undefined) {
        delete novo[idAlimento]; 
      } else {
        novo[idAlimento] = 100; 
      }
      return novo;
    });
  };

  const atualizarGramas = (idAlimento: string, gramas: string) => {
    if (gramas.length > 4) return; 
    setPorcoes(prev => ({ ...prev, [idAlimento]: Number(gramas) || 0 }));
  };

  const caloriasTotais = Object.entries(porcoes).reduce((acc, [id, gramas]) => {
    const alimento = todosOsAlimentos.find(a => a.id === id);
    if (!alimento) return acc;
    return acc + Math.round((alimento.kcal100g / 100) * gramas);
  }, 0);

  const confirmarRefeicao = () => {
    if (caloriasTotais > 0) {
      const macrosTotais = Object.entries(porcoes).reduce((acc, [id, gramas]) => {
        const alimento = todosOsAlimentos.find(a => a.id === id);
        if (!alimento) return acc;
        acc.proteina += Math.round((alimento.prot / 100) * gramas);
        acc.carbo += Math.round((alimento.carbo / 100) * gramas);
        acc.gordura += Math.round((alimento.gord / 100) * gramas);
        return acc;
      }, { proteina: 0, carbo: 0, gordura: 0 });

      const idRefeicaoUnico = `refeicaoLivre_${Date.now()}`;
      
      // ✅ CORREÇÃO: Passar os 6 argumentos corretos para registrarRefeicao
      registrarRefeicao(
        idRefeicaoUnico,              // refeicaoKey
        "Refeição Livre",             // tituloRef
        "🍔",                         // iconeRef
        caloriasTotais,               // calorias
        Object.keys(porcoes),         // alimentosConsumidos
        macrosTotais                  // macros
      );
      
      setToastMsg('🍔 Refeição guardada!');
      setTimeout(() => navigate('/'), 1500);
    }
  };

  return (
    <div className={`flex flex-col h-[100dvh] overflow-hidden ${temaEscuro ? 'bg-zinc-950 text-white' : 'bg-zinc-50 text-zinc-900'}`}>
      
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }}
            className="fixed top-12 left-1/2 -translate-x-1/2 z-[70] bg-green-500 text-zinc-950 px-6 py-3 rounded-full shadow-xl font-bold flex items-center gap-2 whitespace-nowrap"
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`p-6 pb-4 shadow-sm z-20 flex-shrink-0 ${temaEscuro ? 'bg-zinc-950/80 backdrop-blur-md' : 'bg-white/80 backdrop-blur-md border-b border-zinc-200'}`}>
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors ${temaEscuro ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-white border-zinc-200 text-zinc-700 shadow-sm'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          </button>
          <h1 className="text-xl font-bold">Refeição Livre</h1>
          <div className="w-10" />
        </div>

        <div className={`flex items-center px-4 py-3 rounded-2xl border transition-colors ${temaEscuro ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-100 border-zinc-200'}`}>
          <span className="text-xl mr-2 opacity-50">🔍</span>
          <input 
            type="text" 
            placeholder="Procurar alimento..." 
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="bg-transparent w-full outline-none font-medium text-lg placeholder-zinc-500"
          />
          {busca && (
            <button onClick={() => setBusca('')} className="text-zinc-500 font-bold ml-2">×</button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-2 custom-scrollbar">
        {alimentosFiltrados.length === 0 ? (
          <p className="text-center text-zinc-500 mt-10">Nenhum alimento encontrado.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pb-32">
            {alimentosFiltrados.map((alimento) => {
              const gramas = porcoes[alimento.id];
              const estaSelecionado = gramas !== undefined;
              const kcalCalculada = estaSelecionado ? Math.round((alimento.kcal100g / 100) * gramas) : 0;

              return (
                <div
                  key={alimento.id}
                  onClick={() => !estaSelecionado && toggleAlimento(alimento.id)}
                  className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200 gap-2 ${
                    estaSelecionado
                      ? 'bg-orange-500/10 border-orange-500 text-orange-500 shadow-md'
                      : temaEscuro 
                        ? 'bg-zinc-900 border-zinc-800 text-zinc-300 cursor-pointer' 
                        : 'bg-white border-zinc-200 text-zinc-700 cursor-pointer shadow-sm'
                  }`}
                >
                  {estaSelecionado && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleAlimento(alimento.id); }}
                      className={`absolute -top-2 -right-2 rounded-full w-7 h-7 flex items-center justify-center font-bold text-sm hover:bg-red-500 hover:text-white shadow-lg z-10 transition-colors ${
                        temaEscuro ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-200 text-zinc-600'
                      }`}
                    >
                      ×
                    </button>
                  )}

                  <span className="text-4xl">{alimento.emoji}</span>
                  <span className="text-[12px] font-bold text-center leading-tight truncate w-full">{alimento.nome}</span>
                  
                  {estaSelecionado ? (
                    <div className="flex flex-col items-center w-full mt-1" onClick={(e) => e.stopPropagation()}>
                      <div className={`flex items-center rounded-xl px-2 py-2 border border-orange-500/40 w-full justify-center ${
                        temaEscuro ? 'bg-zinc-950 text-white' : 'bg-white text-zinc-900 shadow-inner'
                      }`}>
                        <input 
                          type="number" 
                          maxLength={4}
                          value={gramas === 0 ? '' : gramas}
                          onChange={(e) => atualizarGramas(alimento.id, e.target.value)}
                          className="w-12 bg-transparent text-center text-sm outline-none font-black"
                          placeholder="0"
                        />
                        <span className={`text-[10px] font-bold ${temaEscuro ? 'text-zinc-500' : 'text-zinc-400'}`}>g</span>
                      </div>
                      <span className="text-[11px] text-orange-500 font-black mt-2">{kcalCalculada} kcal</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-zinc-500 mt-2 font-medium">{alimento.kcal100g} kcal / 100g</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {caloriasTotais > 0 && (
          <motion.div 
            initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
            className={`fixed bottom-0 left-0 right-0 p-6 z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] border-t transition-colors ${
              temaEscuro ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
            }`}
          >
            <div className="max-w-md mx-auto flex items-center justify-between gap-4">
              <div className="flex flex-col">
                <span className={`text-xs font-bold uppercase tracking-wider ${temaEscuro ? 'text-zinc-400' : 'text-zinc-500'}`}>Total Livre</span>
                <span className="text-2xl font-black text-orange-500">{caloriasTotais} kcal</span>
              </div>
              <button 
                onClick={confirmarRefeicao}
                className="flex-1 bg-green-500 hover:bg-green-400 text-zinc-950 font-black py-4 rounded-xl shadow-lg shadow-green-500/30 transition-all active:scale-95 text-lg"
              >
                Registar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}