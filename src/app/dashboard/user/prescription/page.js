"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ClipboardList, Upload, Loader, CheckCircle, FileText, Copy, Check } from "lucide-react";
import Tesseract from "tesseract.js";

export default function PrescriptionReader() {
  const { user, loading } = useAuth();
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [ocrText, setOcrText] = useState("");
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const handleCopy = () => {
    if (ocrText) {
      navigator.clipboard.writeText(ocrText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file (PNG, JPG).");
        return;
      }
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setOcrText("");
      setError("");
    }
  };

  const runOCR = async () => {
    if (!image) return;
    setIsProcessing(true);
    setError("");
    
    try {
      const result = await Tesseract.recognize(
        image,
        'eng',
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              setProgress(parseInt(m.progress * 100));
            }
          }
        }
      );
      setOcrText(result.data.text);
    } catch (err) {
      console.error(err);
      setError("OCR text extraction failed. Please try again with a clearer image.");
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  if (loading || !user) return <div className="text-slate-400 p-10">Loading profile...</div>;

  return (
    <div className="animate-[fadeIn_0.5s_ease-out] w-full max-w-4xl mx-auto">
      <header className="mb-8">
        <h2 className="text-4xl font-extrabold bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent mb-1">
          Prescription Reader
        </h2>
        <p className="text-slate-400 text-sm">Upload medical notes or prescriptions for offline locally parsed text nodes.</p>
      </header>

      {error && (
        <div className="text-rose-400 mb-6 bg-rose-500/10 p-4 rounded-xl border border-rose-500/20 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Upload Zone */}
        <div className="glass-panel p-6 flex flex-col gap-4">
          <h3 className="text-lg font-bold flex items-center gap-2 text-indigo-400">
            <Upload size={20} /> Upload Image
          </h3>

          <div className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-500/50 transition-colors relative h-64">
            <input 
              type="file" 
              accept="image/*" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={handleFileChange}
              disabled={isProcessing}
            />
            {previewUrl ? (
              <img src={previewUrl} alt="Prescription preview" className="max-h-full max-w-full rounded-lg object-contain shadow-md" />
            ) : (
              <div className="flex flex-col items-center gap-3 text-slate-500 my-auto">
                <FileText size={48} className="text-slate-600" />
                <p className="text-sm font-medium">Click or Drag & Drop prescription notes</p>
                <p className="text-xs text-slate-600">Supports JPG, PNG</p>
              </div>
            )}
          </div>

          <button 
            className="btn btn-primary w-full justify-center gap-2 mt-2 disabled:opacity-50"
            disabled={!image || isProcessing}
            onClick={runOCR}
          >
            {isProcessing ? (
              <>
                <Loader size={18} className="animate-spin" /> Processing ({progress}%)
              </>
            ) : (
              <>Scan Prescription</>
            )}
          </button>
        </div>

        {/* Results Pane */}
        <div className="glass-panel p-6 flex flex-col gap-4 h-full relative">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold flex items-center gap-2 text-emerald-400">
              <CheckCircle size={20} /> Extracted Text Output
            </h3>
            {ocrText && (
              <button 
                onClick={handleCopy} 
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border ${
                  copied 
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" 
                    : "bg-white/5 hover:bg-white/10 text-slate-300 border-white/10"
                }`}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied!" : "Copy"}
              </button>
            )}
          </div>

          {ocrText ? (
            <div className="bg-slate-950/50 border border-white/5 rounded-xl p-4 flex-1 overflow-auto max-h-[350px]">
              <pre className="text-slate-300 text-sm font-['Outfit'] whitespace-pre-wrap">
                {ocrText}
              </pre>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-600 text-sm gap-2 bg-slate-950/20 rounded-xl border border-dashed border-white/5 p-10 h-64">
              <ClipboardList size={32} className="opacity-40" />
              <p>Extracted raw prescription contents appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
