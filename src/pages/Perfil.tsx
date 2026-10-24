import { SupportForm } from "../components/SupportForm";
import { ProfileOverview } from "../components/ProfileOverview";
import { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../store/useUserStore";

export function Perfil() {
  const navigate = useNavigate();
  const dados = useUserStore((state) => state.dados);
  const setDados = useUserStore((state) => state.setDados);

  const temaEscuro = dados.temaEscuro ?? true;

  const [mostrarModalSair, setMostrarModalSair] = useState(false);
  const [modalSuporte, setModalSuporte] = useState(false);
  const [modalIdeia, setModalIdeia] = useState(false);
  const [modalFeedback, setModalFeedback] = useState(false);
  const [modalTermos, setModalTermos] = useState(false);

  const [estrelas, setEstrelas] = useState(0);
  const [enviouFeedback, setEnviouFeedback] = useState(false);
  const fecharFeedback = () => {
    setModalFeedback(false);
    setEstrelas(0);
    setEnviouFeedback(false);
  };

  const confirmarSaida = () => {
    setDados({ nome: "" });
    setMostrarModalSair(false);
    navigate("/");
  };

  return (
    <div className="app-page app-profile custom-scrollbar">
      <ProfileOverview
        openIdea={() => setModalIdeia(true)}
        openSupport={() => setModalSuporte(true)}
        openFeedback={() => setModalFeedback(true)}
        openTerms={() => setModalTermos(true)}
        onSignOut={() => setMostrarModalSair(true)}
      />

      {/* --- MODAIS --- */}

      {modalIdeia && (
        <SupportForm kind="idea" onClose={() => setModalIdeia(false)} />
      )}
      {modalSuporte && (
        <SupportForm kind="support" onClose={() => setModalSuporte(false)} />
      )}

      {/* MODAL TERMOS */}
      {modalTermos &&
        createPortal(
          <div
            className={`app-themed app-legacy-dialog ${
              temaEscuro ? "" : "app-light"
            } fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4 py-10 animate-in fade-in overscroll-none`}
          >
            <div
              className={`border rounded-3xl w-full max-w-md h-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden ${
                temaEscuro
                  ? "bg-zinc-900 border-zinc-800 text-white"
                  : "bg-white border-zinc-200 text-zinc-900"
              }`}
            >
              <div
                className={`px-6 py-4 border-b flex items-center justify-between ${
                  temaEscuro
                    ? "border-zinc-800 bg-zinc-900/90"
                    : "border-zinc-200 bg-white/90"
                }`}
              >
                <h3 className="text-base font-bold flex items-center gap-2">
                  <span className="text-xl">📄</span> Termos e Privacidade
                </h3>
                <button
                  onClick={() => setModalTermos(false)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    temaEscuro
                      ? "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900"
                  }`}
                >
                  ✕
                </button>
              </div>
              <div
                className={`flex-1 overflow-y-auto px-6 py-5 text-left custom-scrollbar ${
                  temaEscuro ? "text-zinc-300" : "text-zinc-700"
                } text-[13px] leading-relaxed space-y-5`}
              >
                <div>
                  <p className="font-bold text-sm mb-1 text-green-500">
                    Bem-vindo(a) ao Louri Fit
                  </p>
                  <p>
                    Estes Termos de Uso e Política de Privacidade regulam a
                    utilização da aplicação Louri Fit ("App").
                  </p>
                </div>
                <div>
                  <p className="font-bold text-sm mb-1 text-green-500">
                    Seus dados nesta versão
                  </p>
                  <p>
                    O perfil, os alimentos e o histórico ficam salvos no
                    dispositivo. Esta versão não usa conta nem sincronização
                    online.
                  </p>
                  <p>
                    Os lembretes usam os horários e registros locais para
                    decidir quando avisar. Você pode desativá-los no Perfil ou
                    nas configurações do aparelho.
                  </p>
                  <p>
                    Ao enviar suporte ou sugestões, sua mensagem vai para o
                    Discord da equipe do Louri. No suporte, também é enviado o
                    contato que você informar. Nome do perfil, peso, altura,
                    objetivo e histórico não são anexados. Você confirma o envio
                    no próprio formulário.
                  </p>
                  <p>
                    Limpar os dados do aplicativo ou remover o app pode apagar
                    seus registros. Os rascunhos de suporte são descartados ao
                    fechar.
                  </p>
                </div>
                <div>
                  <p
                    className={`font-bold mb-1 ${
                      temaEscuro ? "text-white" : "text-zinc-900"
                    }`}
                  >
                    1. Isenção de Responsabilidade Médica
                  </p>
                  <ul className="list-disc pl-4 space-y-1 opacity-90">
                    <li>O Louri Fit é uma ferramenta informativa.</li>
                    <li>
                      <strong>A App não fornece aconselhamento médico.</strong>
                    </li>
                  </ul>
                </div>
              </div>
              <div
                className={`p-4 border-t ${
                  temaEscuro
                    ? "border-zinc-800 bg-zinc-900"
                    : "border-zinc-200 bg-white"
                }`}
              >
                <button
                  onClick={() => setModalTermos(false)}
                  className="w-full bg-green-500 hover:bg-green-400 text-zinc-950 font-black uppercase tracking-widest py-4 rounded-2xl text-sm transition-all active:scale-95 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* MODAL FEEDBACK */}
      {modalFeedback &&
        createPortal(
          <div
            className={`app-themed app-legacy-dialog ${
              temaEscuro ? "" : "app-light"
            } fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-6 animate-in fade-in overscroll-none`}
          >
            <div
              className={`border rounded-3xl p-6 w-full max-w-xs flex flex-col gap-4 text-center shadow-2xl ${
                temaEscuro
                  ? "bg-zinc-900 border-zinc-800 text-white"
                  : "bg-white border-zinc-200 text-zinc-900"
              }`}
            >
              {enviouFeedback ? (
                <>
                  <div className="text-4xl animate-bounce">💖</div>
                  <h3 className="text-lg font-bold">Muito Obrigado!</h3>
                  <p
                    className={`text-xs leading-relaxed ${
                      temaEscuro ? "text-zinc-400" : "text-zinc-600"
                    }`}
                  >
                    O teu feedback foi registado.
                  </p>
                  <button
                    onClick={fecharFeedback}
                    className="bg-green-500 hover:bg-green-400 text-zinc-950 font-bold py-3 rounded-xl text-xs mt-2 transition-colors"
                  >
                    Fechar
                  </button>
                </>
              ) : (
                <>
                  <div className="text-3xl">⭐</div>
                  <h3 className="text-lg font-bold">Avalie o Louri Fit</h3>
                  <div className="flex justify-center gap-2 my-2">
                    {[1, 2, 3, 4, 5].map((estrela) => (
                      <button
                        key={estrela}
                        onClick={() => setEstrelas(estrela)}
                        className={`text-2xl transition-transform active:scale-125 ${
                          estrela <= estrelas
                            ? "text-yellow-400"
                            : temaEscuro
                            ? "text-zinc-700"
                            : "text-zinc-300"
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={fecharFeedback}
                      className={`flex-1 py-3 rounded-xl text-xs font-semibold transition-colors ${
                        temaEscuro
                          ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                          : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                      }`}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        if (estrelas > 0) setEnviouFeedback(true);
                      }}
                      disabled={estrelas === 0}
                      className={`flex-1 font-bold py-3 rounded-xl text-xs transition-all ${
                        estrelas > 0
                          ? "bg-green-500 text-zinc-950 shadow-md"
                          : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                      }`}
                    >
                      Enviar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>,
          document.body
        )}

      {/* MODAL SAIR */}
      {mostrarModalSair &&
        createPortal(
          <div
            className={`app-themed app-legacy-dialog ${
              temaEscuro ? "" : "app-light"
            } fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-6 animate-in fade-in overscroll-none`}
          >
            <div
              className={`border rounded-3xl p-6 w-full max-w-xs flex flex-col gap-5 text-center shadow-2xl ${
                temaEscuro
                  ? "bg-zinc-900 border-zinc-800 text-white"
                  : "bg-white border-zinc-200 text-zinc-900"
              }`}
            >
              <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center text-2xl mx-auto text-red-500">
                🚪
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-bold">Terminar Sessão?</h3>
                <p
                  className={`text-xs leading-relaxed ${
                    temaEscuro ? "text-zinc-400" : "text-zinc-600"
                  }`}
                >
                  Você voltará para a tela inicial. Seu histórico continuará
                  salvo neste dispositivo.
                </p>
              </div>
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => setMostrarModalSair(false)}
                  className={`flex-1 py-3.5 rounded-2xl font-semibold text-xs border ${
                    temaEscuro
                      ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700"
                      : "bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-200"
                  }`}
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarSaida}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-zinc-950 font-bold py-3.5 rounded-2xl text-xs shadow-lg shadow-red-500/25"
                >
                  Sim, Sair
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
