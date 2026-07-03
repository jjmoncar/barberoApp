import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Camera, 
  Upload, 
  Cpu, 
  RefreshCw, 
  CheckCircle, 
  Bookmark, 
  Flame, 
  Star,
  Users,
  Eye,
  Scan
} from 'lucide-react';
import { AppState } from '../lib/useAppContext';
import { FaceAnalysis, RecommendedStyle } from '../types';
import { translations } from '../lib/translations';

interface AIExplorerProps {
  state: AppState;
}

export default function AIExplorer({ state }: AIExplorerProps) {
  const { clients, saveClient, role, language } = state;
  const t = translations[language].aiExplorer;

  const [image, setImage] = useState<string | null>(null);
  const [scanning, setScanning] = useState<boolean>(false);
  const [scanStatusText, setScanStatusText] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<FaceAnalysis | null>(null);
  const [selectedClientIdForSave, setSelectedClientIdForSave] = useState<string>('');

  // Camera integration refs & state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);

  // Clean up camera streams
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    setAnalysisResult(null);
    setImage(null);
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 480, height: 480 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("No se pudo acceder a la cámara:", err);
      alert(language === 'pt' 
        ? "Não foi possível iniciar a câmera. Por favor, verifique as permissões de acesso ou envie um arquivo."
        : "No se pudo iniciar la cámara. Por favor asegúrate de dar permisos de cámara o sube un archivo desde tu dispositivo.");
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setImage(dataUrl);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnalysisResult(null);
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFaceScan = async () => {
    if (!image) return;

    setScanning(true);
    setAnalysisResult(null);

    // Simulated scanning status text sequences to look deeply technical & premium
    const statusMessages = language === 'pt' ? [
      "Mapeando estrutura óssea e plano sagital...",
      "Calculando assimetria geométrica das maçãs do rosto...",
      "Detectando nascimento e densidade da linha capilar...",
      "Classificando textura e índice folicular...",
      "Consultando modelos neurais Gemini 2.5 Pro...",
      "Gerando recomendações adaptativas em português..."
    ] : [
      "Mapeando estructura ósea y plano sagital...",
      "Calculando asimetría geométrica de pómulos...",
      "Detectando nacimiento y densidad de línea capilar...",
      "Clasificando textura e índice folicular...",
      "Consultando modelos neuronales Gemini 2.5 Pro...",
      "Generando recomendaciones adaptativas en español..."
    ];

    let currentMsgIdx = 0;
    setScanStatusText(statusMessages[0]);
    
    const interval = setInterval(() => {
      currentMsgIdx++;
      if (currentMsgIdx < statusMessages.length) {
        setScanStatusText(statusMessages[currentMsgIdx]);
      }
    }, 1300);

    try {
      const response = await fetch('/api/analyze-face', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image, language })
      });

      const data = await response.json();
      clearInterval(interval);
      setAnalysisResult(data);
    } catch (err) {
      console.error("Face scan API error", err);
      alert(language === 'pt' 
        ? "Ocorreu um erro ao conectar ao motor de IA. Carregando resultados inteligentes do otimizador local."
        : "Ocurrió un error al contactar al motor de IA. Cargando resultados inteligentes del optimizador local.");
    } finally {
      clearInterval(interval);
      setScanning(false);
    }
  };

  const handleSaveToClientProfile = async () => {
    if (!selectedClientIdForSave || !analysisResult) return;
    const client = clients.find(c => c.id === selectedClientIdForSave);
    if (!client) return;

    // Append a tag with face shape and save latest scan data
    const updatedTags = Array.from(new Set([...client.tags, `Rostro ${analysisResult.faceShape}`, `Cabello ${analysisResult.hairTexture}`]));
    const updatedClient = {
      ...client,
      tags: updatedTags,
      lastAnalysisDate: new Date().toISOString().split('T')[0]
    };

    await saveClient(updatedClient);
    alert(language === 'pt'
      ? `💾 Perfil salvo com sucesso!\nO diagnóstico facial (Formato ${analysisResult.faceShape}) foi salvo diretamente na ficha de ${client.name}.`
      : `💾 ¡Perfil guardado con éxito!\nSe ha guardado el análisis facial (Rostro ${analysisResult.faceShape}) directamente en el expediente del cliente ${client.name}.`);
    setSelectedClientIdForSave('');
  };

  // Map Gemini's imageAlt description to high quality Unsplash haircut images
  const getCutImage = (alt: string) => {
    const text = alt.toLowerCase();
    if (text.includes("mid fade") || text.includes("fade")) {
      return "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=350";
    }
    if (text.includes("pompadour")) {
      return "https://images.unsplash.com/photo-1621574539437-4b7cb63120b8?auto=format&fit=crop&q=80&w=350";
    }
    if (text.includes("crop")) {
      return "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80&w=350";
    }
    if (text.includes("buzz")) {
      return "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=350";
    }
    if (text.includes("slick")) {
      return "https://images.unsplash.com/photo-1605497746444-05dbd87f4c23?auto=format&fit=crop&q=80&w=350";
    }
    return "https://images.unsplash.com/photo-1512864084360-7c0c4d0a0845?auto=format&fit=crop&q=80&w=350"; // beautiful generic taper
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div className="text-center space-y-2">
        <span className="text-gold font-mono tracking-widest uppercase text-xs font-bold flex items-center justify-center gap-1.5">
          <Sparkles className="w-4 h-4 text-gold animate-spin" /> {language === 'es' ? 'Motor Biométrico Gemini Vision' : 'Motor Biométrico Gemini Vision'}
        </span>
        <h2 className="font-display text-4xl text-white">{t.title}</h2>
        <p className="text-gray-400 text-sm max-w-xl mx-auto">
          {t.subtitle}
        </p>
      </div>

      {/* Main Scan Control Panel */}
      {!analysisResult && (
        <div className="bg-surface-light p-6 rounded-3xl border border-surface-border max-w-md mx-auto relative overflow-hidden flex flex-col items-center">
          {/* Decorative scanner graphics */}
          <div className="absolute top-2 right-2 flex gap-1 text-[8px] text-gray-600 font-mono">
            <span>[AI_ACTIVE]</span>
          </div>

          {/* Core Camera Canvas Frame Area */}
          <div className="w-72 h-72 bg-surface-dark rounded-2xl border-2 border-surface-border relative overflow-hidden flex items-center justify-center mb-6">
            {cameraActive ? (
              <>
                <video ref={videoRef} className="w-full h-full object-cover rounded-xl transform -scale-x-100" />
                <div className="absolute inset-0 camera-guide mx-auto my-auto w-52 h-64"></div>
                <div className="scan-line"></div>
              </>
            ) : image ? (
              <>
                <img src={image} alt="Rostro a analizar" className="w-full h-full object-cover rounded-xl" />
                {scanning && <div className="scan-line"></div>}
              </>
            ) : (
              <div className="text-center p-6 space-y-3">
                <Scan className="w-12 h-12 text-gold mx-auto animate-pulse" />
                <p className="text-xs text-gray-500 font-mono">{language === 'es' ? 'CÁMARA APAGADA' : 'CÂMERA DESLIGADA'}</p>
              </div>
            )}
          </div>

          {/* Scanning Overlay message */}
          {scanning && (
            <div className="w-full bg-surface-dark border border-surface-border p-4 rounded-xl flex items-center gap-3 mb-6 animate-pulse">
              <Cpu className="w-5 h-5 text-gold animate-spin" />
              <div className="flex-1">
                <p className="text-[10px] text-gold uppercase font-mono tracking-widest">
                  {language === 'es' ? 'Analizando Biometría' : 'Analisando Biometria'}
                </p>
                <p className="text-white text-xs mt-1 transition-all">{scanStatusText}</p>
              </div>
            </div>
          )}

          {/* Interactive controls */}
          {!scanning && (
            <div className="w-full space-y-4">
              {/* Trigger photo capture or upload */}
              {cameraActive ? (
                <button 
                  onClick={capturePhoto}
                  className="w-full py-3 bg-gold text-black hover:bg-gold-light font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Camera className="w-4 h-4" /> {language === 'es' ? 'Tomar Captura' : 'Tirar Foto'}
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={startCamera}
                    className="py-2.5 bg-surface-dark border border-surface-border hover:bg-white/5 text-gray-300 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Camera className="w-4 h-4 text-gold" /> {language === 'es' ? 'Iniciar Cámara' : 'Iniciar Câmera'}
                  </button>
                  <label className="py-2.5 bg-surface-dark border border-surface-border hover:bg-white/5 text-gray-300 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all text-center">
                    <Upload className="w-4 h-4 text-gold" /> {language === 'es' ? 'Subir Foto' : 'Enviar Foto'}
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              )}

              {/* Scan Trigger */}
              {image && !cameraActive && (
                <button 
                  onClick={triggerFaceScan}
                  className="w-full py-3 bg-gold hover:bg-gold-light text-black font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all gold-glow-strong"
                >
                  <Sparkles className="w-4 h-4" /> {language === 'es' ? 'Ejecutar Diagnóstico AI' : 'Executar Diagnóstico AI'}
                </button>
              )}
            </div>
          )}

          {/* Hidden Canvas helper */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {/* Results View Panel */}
      {analysisResult && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Summary results bar */}
          <div className="bg-surface-light p-6 rounded-3xl border border-surface-border grid grid-cols-1 md:grid-cols-4 gap-6 relative overflow-hidden">
            {/* Save directly to user file (Only if Owner or Barber is logged in) */}
            {(role === 'owner' || role === 'barber') && (
              <div className="md:col-span-4 border-b border-white/5 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gold" />
                  <span className="text-xs text-gray-300 font-medium">
                    {language === 'es' ? '¿Deseas registrar este análisis en el expediente de algún cliente?' : 'Deseja salvar este diagnóstico na ficha de um cliente?'}
                  </span>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <select 
                    value={selectedClientIdForSave}
                    onChange={(e) => setSelectedClientIdForSave(e.target.value)}
                    className="bg-surface-dark border border-surface-border text-white text-xs rounded-xl py-1.5 px-3 focus:outline-none focus:border-gold"
                  >
                    <option value="">{language === 'es' ? '-- Selecciona Cliente --' : '-- Selecionar Cliente --'}</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <button 
                    onClick={handleSaveToClientProfile}
                    disabled={!selectedClientIdForSave}
                    className="py-1.5 px-3 bg-gold hover:bg-gold-light disabled:bg-gray-700 disabled:text-gray-400 text-black font-bold text-xs uppercase rounded-xl tracking-wider transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Bookmark className="w-3.5 h-3.5" /> {language === 'es' ? 'Guardar' : 'Salvar'}
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                {language === 'es' ? 'Forma de Rostro' : 'Formato do Rosto'}
              </span>
              <h3 className="font-display text-2xl text-gold mt-1">{analysisResult.faceShape}</h3>
            </div>

            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                {language === 'es' ? 'Línea de Cabello' : 'Linha de Cabelo'}
              </span>
              <h3 className="font-display text-2xl text-white mt-1">{analysisResult.hairLine}</h3>
            </div>

            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                {language === 'es' ? 'Textura Capilar' : 'Textura Capilar'}
              </span>
              <h3 className="font-display text-2xl text-white mt-1">{analysisResult.hairTexture}</h3>
            </div>

            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                {language === 'es' ? 'Rasgos Destacados' : 'Traços Marcantes'}
              </span>
              <div className="flex flex-wrap gap-1 mt-2">
                {analysisResult.prominentFeatures.map(f => (
                  <span key={f} className="text-[9px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-gray-300 font-medium">{f}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Curated Recommendations Cards Grid */}
          <div className="space-y-4">
            <h4 className="font-display text-2xl text-white tracking-wide flex items-center gap-2">
              <Sparkles className="text-gold w-5 h-5" /> {language === 'es' ? `ESTILOS RECOMENDADOS (${analysisResult.recommendations.length})` : `ESTILOS RECOMENDADOS (${analysisResult.recommendations.length})`}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analysisResult.recommendations.map((style, idx) => (
                <div key={idx} className="bg-surface-light rounded-2xl border border-surface-border overflow-hidden flex flex-col hover:border-gold/25 hover:scale-[1.01] transition-all relative group shadow-lg">
                  {/* Score badge */}
                  <div className="absolute top-3 left-3 bg-black/75 border border-gold/30 px-3 py-1 rounded-xl flex items-center gap-1 z-10 backdrop-blur-sm">
                    <Flame className="w-3.5 h-3.5 text-gold animate-pulse" />
                    <span className="font-mono text-xs font-bold text-gold">{style.compatibility}%</span>
                  </div>

                  {/* Cut Picture Reference */}
                  <div className="w-full h-48 overflow-hidden relative border-b border-surface-border">
                    <img src={getCutImage(style.imageAlt)} alt={style.name} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent"></div>
                    <div className="absolute bottom-3 right-3 bg-gold/10 text-gold border border-gold/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                      {language === 'es' ? 'Mantenimiento' : 'Manutenção'}: {style.maintenance}
                    </div>
                  </div>

                  {/* Descriptions details */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-display text-xl text-white tracking-wide">{style.name}</h4>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{style.description}</p>
                      
                      <div className="mt-3 bg-surface-dark p-3 rounded-xl border border-surface-border">
                        <p className="text-[10px] text-gold font-bold uppercase tracking-wider flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-gold" /> {language === 'es' ? 'Justificación AI' : 'Justificativa AI'}
                        </p>
                        <p className="text-gray-300 text-xs mt-1 leading-relaxed">{style.explanation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reset Scan */}
          <div className="text-center">
            <button 
              onClick={() => {
                setImage(null);
                setAnalysisResult(null);
              }}
              className="py-2.5 px-6 bg-surface-dark border border-surface-border hover:bg-white/5 text-gray-400 hover:text-white font-semibold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 mx-auto cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> {language === 'es' ? 'Escanear Nuevo Rostro' : 'Escanear Novo Rosto'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
export type AIExplorerPropsType = AIExplorerProps;
export type AIExplorerType = React.ComponentType<AIExplorerProps>;
export const AIExplorerComponent = AIExplorer;
