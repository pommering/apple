import { Apple } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-gradient-to-r from-slate-900 to-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-4">
          <div className="bg-white p-3 rounded-xl shadow-lg">
            <Apple className="w-8 h-8 text-slate-900" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">
              Gerenciador de Preços Apple
            </h1>
            <p className="text-slate-300 mt-1">
              Sistema inteligente de gestão de produtos e margens
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
