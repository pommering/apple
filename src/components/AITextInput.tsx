import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface AITextInputProps {
  onProcessText: (text: string) => Promise<void>;
}

export function AITextInput({ onProcessText }: AITextInputProps) {
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isProcessing) return;

    setIsProcessing(true);
    try {
      await onProcessText(text);
      setText('');
    } finally {
      setIsProcessing(false);
    }
  };

  const exampleText = `iPhone 16 • 256GB → R$ 3.500,00
iPhone 16 Pro • 256GB → R$ 6.350,00
Watch 10 • 46mm → R$ 2.100,00
AirPods Pro 2 → R$ 1.200,00`;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-lg">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Atualizar Preços com IA
          </h2>
          <p className="text-sm text-gray-600">
            Cole os preços dos produtos e a IA atualiza automaticamente
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="price-text"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Cole os preços aqui:
          </label>
          <textarea
            id="price-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={exampleText}
            rows={8}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none font-mono text-sm"
            disabled={isProcessing}
          />
          <p className="mt-2 text-xs text-gray-500">
            Formato aceito: Nome do Produto → Preço (ex: iPhone 16 • 256GB → R$ 3.500,00)
          </p>
        </div>

        <button
          type="submit"
          disabled={!text.trim() || isProcessing}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Processar Preços
            </>
          )}
        </button>
      </form>
    </div>
  );
}
