import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { AITextInput } from './components/AITextInput';
import { ProductsTable } from './components/ProductsTable';
import { Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { Product } from './lib/supabase';

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [freight, setFreight] = useState<number>(window.localStorage.getItem("frete") ? Number(window.localStorage.getItem("frete")) : 0);
  const [marginPercentage, setMarginPercentage] = useState<number>(window.localStorage.getItem("margem") ? Number(window.localStorage.getItem("margem")) : 20);
  const [apiKeyGemini, setApiKeyGemini] = useState<string>("");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);

      const storedProducts = window.localStorage.getItem("apple");
      const initialProducts = storedProducts ? JSON.parse(storedProducts) : [] as Product[];
      setProducts(initialProducts);

    } catch (err) {
      console.error('Error loading products:', err);
      setError('Erro ao carregar produtos');
    } finally {
      setIsLoading(false);
    }
  };

  async function extractJsonFromMessage(message: string): Promise<{ name: string; price: number }[]> {
    const API_KEY = apiKeyGemini;
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `Extraia os produtos e preços da seguinte mensagem e responda somente em JSON, no formato:
                [
                  { "name": "iPhone 15 Pro Max", "price": 8999 },
                  { "name": "iPhone 15", "price": 6499 }
                ]

                Mensagem:
                "${message}"`
                }
              ]
            }
          ]
        },
        { headers: { "Content-Type": "application/json" } }
      );

      let text = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";

      // remove ```json e ```
      text = text.replace(/```json/gi, "").replace(/```/g, "").trim();

      return JSON.parse(text);
    } catch (err) {
      console.error("Erro ao chamar Gemini:", err);
      return [];
    }
  }

  function gerarMensagem(produtos: Product[]): string {
    // Separa por categorias (iPhone, Watch, AirPods)
    const iphones = produtos.filter(p => p.name.toLowerCase().includes("iphone"));
    const watches = produtos.filter(p => p.name.toLowerCase().includes("watch"));
    const airpods = produtos.filter(p => p.name.toLowerCase().includes("airpods"));

    // Função auxiliar para formatar lista
    const formatar = (produtos: Product[]) => produtos.map(p => `• ${p.name} → R$ ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format((p.cost_price * (1 + p.margin_percentage / 100)) + p.freight)}`).join("\n");

    return `📢 Lista Oficial – Outubro/2025 ⚡

💳 Pagamento Fácil em até 10x com acréscimo

━━━━━━━━━━━━━━━━━━━━━━
📱 iPhones – Mais vendidos
${formatar(iphones)}

⌚ Apple Watch – Performance e estilo
${formatar(watches)}

🎧 AirPods – Som de última geração
${formatar(airpods)}

━━━━━━━━━━━━━━━━━━━━━━
📌 Condições Especiais  
⚡ Entrega rápida  
📦 Produtos 100% lacrados  

📲 Me chama no WhatsApp: 14 99873-2377
`;
  }

  const handleProcessText = async (text: string) => {
    try {
      setError(null);
      setSuccessMessage(null);

      extractJsonFromMessage(text).then(async (items) => {
        if (items.length === 0) {
          setError('Nenhum produto encontrado no texto fornecido.');
          return;
        }

        const newProducts: Product[] = items.map(item => ({
          id: crypto.randomUUID(),
          name: item.name,
          cost_price: item.price,
          margin_percentage: marginPercentage,
          freight: freight,
          category: 'Desconhecida',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));




        setSuccessMessage(`${newProducts.length} produtos adicionados com sucesso!`);
        setProducts(newProducts);
        window.localStorage.setItem("apple", JSON.stringify(newProducts));

      });

      /*const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-prices-ai`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao processar texto');
      }

      setSuccessMessage(result.message);*/
      await loadProducts();

      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Error processing text:', err);
      setError(err instanceof Error ? err.message : 'Erro ao processar texto');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este produto?')) {
      return;
    }

    try {


      setProducts(products.filter(p => p.id !== id));
      setSuccessMessage('Produto deletado com sucesso');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('Erro ao deletar produto');
    }
  };

  const handleUpdateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(products.map(p =>
      p.id === id ? { ...p, ...updates } : p
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />

      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-red-800">Erro</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-green-800">Sucesso</h3>
              <p className="text-sm text-green-700 mt-1">{successMessage}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6" style={{ marginBottom: '20px' }}>
              <h3 className="text-lg font-semibold mb-4">Chave API Gemini</h3>
              <p className="text-sm text-gray-600 mb-4">
                Insira sua chave de API do Google Gemini para habilitar a extração automática de produtos.
              </p>
              <input
                type="text"
                value={apiKeyGemini}
                onChange={(e) => setApiKeyGemini(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Insira sua chave de API aqui"
              />
              <p className="mt-2 text-xs text-gray-500">
                Sua chave é armazenada localmente no navegador e não é enviada a nenhum servidor.
              </p>
            </div>
            <AITextInput onProcessText={handleProcessText}  />

            <div className="bg-white rounded-lg shadow-lg p-6" style={{ marginTop: '20px' }}>
              <h3 className="text-lg font-semibold mb-4">Valor Frete</h3>
              <p className="text-sm text-gray-600">
                O valor do frete é adicionado ao custo do produto para calcular o preço de venda.
              </p>

              <input value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(freight)} onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setFreight(Number(val) / 100);

                window.localStorage.setItem("frete", String(Number(val) / 100));

              }} className="mt-3 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
              <p className="mt-2 text-xs text-gray-500">
                (Por enquanto, o valor do frete é fixo em R$ 0,00)
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6" style={{ marginTop: '20px' }}>
              <h3 className="text-lg font-semibold mb-4">Margem</h3>
              <p className="text-sm text-gray-600">
                A margem de lucro é aplicada sobre o custo para calcular o preço de venda.
              </p>

              <input value={marginPercentage.toFixed(2)} onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setMarginPercentage(Number(val) / 100);
                window.localStorage.setItem("margem", String(Number(val) / 100));
              }} className="mt-3 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />

            </div>


            <div className="bg-white rounded-lg shadow-lg p-6" style={{ marginTop: '20px' }}>

              <h3 className="text-lg font-semibold mb-4">Gerar Mensagem</h3>
              <p className="text-sm text-gray-600 mb-4">
                Gere uma mensagem formatada para divulgar seus produtos.
              </p>

              <textarea
                readOnly
                value={gerarMensagem(products)}
                className="w-full h-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              />
              <p className="mt-2 text-xs text-gray-500">
                Copie e cole a mensagem no WhatsApp ou onde desejar.
              </p>

            </div>


          </div>


          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="bg-white rounded-lg shadow-lg p-12 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Carregando produtos...</p>
                </div>
              </div>
            ) : (
              <ProductsTable
                products={products}
                onDeleteProduct={handleDeleteProduct}
                onUpdateProduct={handleUpdateProduct}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
