import { Trash2, TrendingUp } from 'lucide-react';
import { Product } from '../lib/supabase';
import { EditableCell } from './EditableCell';

interface ProductsTableProps {
  products: Product[];
  onDeleteProduct: (id: string) => void;
  onUpdateProduct: (id: string, updates: Partial<Product>) => void;
}

export function ProductsTable({ products, onDeleteProduct, onUpdateProduct }: ProductsTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  /*const groupedProducts = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);*/

  const totalMargin = products.reduce((sum, p) => sum + (p.cost_price * (p.margin_percentage / 100)), 0);

  const handleUpdateCost = async (product: Product, newCost: number) => {
    const salePrice = newCost * (1 + product.margin_percentage / 100);
    const marginValue = salePrice - newCost;

    const updates = {
      cost_price: newCost,
      sale_price: Math.round(salePrice * 100) / 100,
      margin_value: Math.round(marginValue * 100) / 100,
    };

    await updateProduct(product.id, updates);
  };

  const handleUpdateMarginPercentage = async (product: Product, newPercentage: number) => {
    const salePrice = product.cost_price * (1 + newPercentage / 100);
    const marginValue = salePrice - product.cost_price;

    const updates = {
      margin_percentage: newPercentage,
      sale_price: Math.round(salePrice * 100) / 100,
      margin_value: Math.round(marginValue * 100) / 100,
    };

    await updateProduct(product.id, updates);
  };

  const handleUpdateSalePrice = async (product: Product, newSalePrice: number) => {
    const marginValue = newSalePrice - product.cost_price;
    const marginPercentage = (marginValue / product.cost_price) * 100;

    console.log({ newSalePrice, marginValue, marginPercentage });

    const updates = {
      sale_price: newSalePrice,
      margin_percentage: marginPercentage,
      margin_value: marginValue,
    };

    await updateProduct(product.id, updates);
  };

  const handleUpdateMarginPrice = async (product: Product, newMarginPrice: number) => {
    const marginValue = newMarginPrice;
    const marginPercentage = (marginValue / product.cost_price) * 100;


    const updates = {
      margin_price: newMarginPrice,
      margin_percentage: Math.round(marginPercentage * 100) / 100,
      margin_value: Math.round(marginValue * 100) / 100,
    };

    await updateProduct(product.id, updates);
  };

  const handleUpdateFreight = async (product: Product, newFreight: number) => {
    const updates = {
      freight: newFreight,
    };

    await updateProduct(product.id, updates);
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {


    onUpdateProduct(id, updates);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Produtos Apple</h2>
          <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
            <TrendingUp className="w-5 h-5 text-green-300" />
            <span className="text-white font-semibold">
              Margem Total: {formatCurrency(totalMargin)}
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">

        <div className="border-b border-gray-200 last:border-b-0">
          {/*<div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">{category}</h3>
            </div>*/}

          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Produto
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Custo
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Frete
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Margem %
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Valor de Venda
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Margem R$
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-gray-700">
                    <EditableCell
                      value={product.cost_price}
                      onSave={(value) => handleUpdateCost(product, value)}
                      type="currency"
                      className="font-medium"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-gray-700">
                    <EditableCell
                      value={product.freight}
                      onSave={(value) => handleUpdateFreight(product, value)}
                      type="currency"
                      className="font-medium"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-center">
                    <EditableCell
                      value={product.margin_percentage}
                      onSave={(value) => handleUpdateMarginPercentage(product, value)}
                      type="percentage"
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">
                    <EditableCell
                      value={product.cost_price * (1 + (product.margin_percentage / 100)) + product.freight}
                      onSave={(value) => handleUpdateSalePrice(product, value)}
                      type="currency"
                      className="font-semibold"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-semibold text-green-600">
                    <EditableCell
                      value={product.cost_price * (product.margin_percentage / 100)}
                      onSave={(value) => handleUpdateMarginPrice(product, value)}
                      type="currency"
                      className="font-semibold"
                    />

                  </td>
                  <td className="px-6 py-4 text-sm text-center">
                    <button
                      onClick={() => onDeleteProduct(product.id)}
                      className="text-red-600 hover:text-red-800 transition-colors p-2 hover:bg-red-50 rounded-lg"
                      title="Deletar produto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {products.length === 0 && (
        <div className="px-6 py-12 text-center text-gray-500">
          <p className="text-lg">Nenhum produto cadastrado</p>
          <p className="text-sm mt-2">Use o campo de texto acima para adicionar produtos</p>
        </div>
      )}
    </div>
  );
}
