import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  AlertTriangle, 
  TrendingDown, 
  Truck, 
  Search,
  CheckCircle,
  TrendingUp,
  RotateCcw
} from 'lucide-react';
import { AppState } from '../lib/useAppContext';
import { Product } from '../types';

interface InventarioProps {
  state: AppState;
}

export default function Inventario({ state }: InventarioProps) {
  const { products, saveProduct } = state;

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedProductForRefill, setSelectedProductForRefill] = useState<Product | null>(null);
  const [refillQty, setRefillQty] = useState<number>(10);

  // New product form states
  const [newName, setNewName] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('Estilizado');
  const [newStock, setNewStock] = useState<number>(10);
  const [newMinStock, setNewMinStock] = useState<number>(3);
  const [newCost, setNewCost] = useState<number>(100);
  const [newPrice, setNewPrice] = useState<number>(200);
  const [newProvider, setNewProvider] = useState<string>('');

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newProvider) return;

    const newProduct: Product = {
      id: "p_" + Math.random().toString(36).substr(2, 9),
      name: newName,
      category: newCategory,
      stock: Number(newStock),
      minStock: Number(newMinStock),
      cost: Number(newCost),
      price: Number(newPrice),
      provider: newProvider
    };

    await saveProduct(newProduct);
    
    // Clear & close
    setNewName('');
    setNewProvider('');
    setIsModalOpen(false);
  };

  const handleRefillStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForRefill) return;

    const updated: Product = {
      ...selectedProductForRefill,
      stock: selectedProductForRefill.stock + Number(refillQty)
    };

    await saveProduct(updated);
    alert(`📦 Stock actualizado para ${selectedProductForRefill.name}. Se sumaron +${refillQty} unidades.`);
    setSelectedProductForRefill(null);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-gold font-mono tracking-widest uppercase text-xs font-bold">Insumos y Logística</span>
          <h2 className="font-display text-4xl text-white">INVENTARIO DE STOCK</h2>
          <p className="text-gray-400 text-sm">Monitorea niveles de productos, alertas de desabasto, costos operativos y distribuidores.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-gold text-black hover:bg-gold-light font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-2 cursor-pointer gold-glow transition-all"
          >
            <Plus className="w-4 h-4" />
            Agregar Producto Nuevo
          </button>
        </div>
      </div>

      {/* Stats Summary Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface-light p-4 rounded-xl border border-surface-border flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Productos Totales</p>
            <h4 className="font-display text-3xl text-white mt-1">{products.length}</h4>
          </div>
          <span className="p-3 bg-gold/10 text-gold rounded-xl"><Package className="w-5 h-5" /></span>
        </div>

        <div className="bg-surface-light p-4 rounded-xl border border-surface-border flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Líneas en Alerta</p>
            <h4 className={`font-display text-3xl mt-1 ${products.filter(p => p.stock <= p.minStock).length > 0 ? 'text-red-400 animate-pulse' : 'text-green-400'}`}>
              {products.filter(p => p.stock <= p.minStock).length}
            </h4>
          </div>
          <span className="p-3 bg-red-500/10 text-red-400 rounded-xl"><AlertTriangle className="w-5 h-5" /></span>
        </div>

        <div className="bg-surface-light p-4 rounded-xl border border-surface-border flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Inversión Estimada</p>
            <h4 className="font-display text-3xl text-white mt-1">
              ${products.reduce((sum, p) => sum + (p.stock * p.cost), 0).toFixed(2)}
            </h4>
          </div>
          <span className="p-3 bg-green-500/10 text-green-400 rounded-xl"><TrendingUp className="w-5 h-5" /></span>
        </div>
      </div>

      {/* Filter and Table Container */}
      <div className="bg-surface-light rounded-2xl border border-surface-border overflow-hidden">
        <div className="p-4 border-b border-surface-border bg-surface-dark/20 flex flex-col md:flex-row justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Buscar productos por nombre o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface-dark border border-surface-border focus:border-gold rounded-xl py-2 pl-10 pr-4 text-white text-xs placeholder-gray-600 focus:outline-none transition-all"
            />
          </div>
          <div className="text-xs text-gray-400 flex items-center gap-1.5 font-mono">
            <CheckCircle className="w-4 h-4 text-gold" /> Sistema sincronizado con la Ficha del Barbero
          </div>
        </div>

        {/* Inventory List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-border bg-surface-dark text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                <th className="p-4">Producto</th>
                <th className="p-4">Categoría</th>
                <th className="p-4 text-center">Stock Actual</th>
                <th className="p-4 text-center">Stock Mínimo</th>
                <th className="p-4 text-right">Costo</th>
                <th className="p-4 text-right">Precio Venta</th>
                <th className="p-4">Proveedor</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border text-sm text-gray-300">
              {filteredProducts.map(p => {
                const isAlert = p.stock <= p.minStock;
                return (
                  <tr key={p.id} className={`hover:bg-white/[0.01] transition-all ${isAlert ? 'bg-red-500/[0.02]' : ''}`}>
                    <td className="p-4 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        {p.name}
                        {isAlert && <span className="text-[8px] bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded-full font-bold">REPOSICIÓN</span>}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="bg-surface-dark border border-surface-border px-2.5 py-1 rounded text-xs text-gray-400 font-medium">
                        {p.category}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`font-mono font-bold text-base ${isAlert ? 'text-red-400' : 'text-white'}`}>
                        {p.stock} u.
                      </span>
                    </td>
                    <td className="p-4 text-center font-mono text-gray-500">{p.minStock} u.</td>
                    <td className="p-4 text-right font-mono text-gray-400">${p.cost.toFixed(2)}</td>
                    <td className="p-4 text-right font-mono text-gold font-bold">${p.price.toFixed(2)}</td>
                    <td className="p-4 text-xs font-mono text-gray-400 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-gold" /> {p.provider}
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => setSelectedProductForRefill(p)}
                        className="py-1 px-3 bg-gold/10 hover:bg-gold hover:text-black text-gold text-xs font-semibold rounded-lg transition-all cursor-pointer"
                      >
                        Abastecer
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Refill Product */}
      {selectedProductForRefill && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-surface-light rounded-2xl border border-surface-border max-w-sm w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-surface-border bg-surface-dark flex justify-between items-center">
              <div>
                <h3 className="font-display text-2xl text-gold">ABASTECER PRODUCTO</h3>
                <p className="text-xs text-gray-400">Ingreso de stock para {selectedProductForRefill.name}</p>
              </div>
              <button onClick={() => setSelectedProductForRefill(null)} className="text-gray-400 hover:text-white font-bold">✕</button>
            </div>
            <form onSubmit={handleRefillStock} className="p-5 space-y-4">
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Stock Actual: {selectedProductForRefill.stock} u.</p>
                <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Cantidad a Sumar</label>
                <input 
                  type="number" required min={1}
                  value={refillQty} onChange={(e) => setRefillQty(Number(e.target.value))}
                  className="w-full bg-surface-dark border border-surface-border focus:border-gold rounded-xl py-2 px-3 text-white text-sm focus:outline-none"
                />
              </div>
              <button 
                type="submit"
                className="w-full py-2.5 bg-gold hover:bg-gold-light text-black font-bold text-xs rounded-xl uppercase tracking-wider transition-all cursor-pointer shadow-lg"
              >
                Sumar al Stock
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: New Product */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-surface-light rounded-2xl border border-surface-border max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-surface-border bg-surface-dark flex justify-between items-center">
              <div>
                <h3 className="font-display text-2xl text-gold">REGISTRAR NUEVO PRODUCTO</h3>
                <p className="text-xs text-gray-400">Alta de insumos o catálogo de ventas</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white font-bold">✕</button>
            </div>
            <form onSubmit={handleCreateProduct} className="p-5 space-y-4">
              <div>
                <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Nombre del Producto</label>
                <input 
                  type="text" required placeholder="Ej. Cera Premium Mate"
                  value={newName} onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-surface-dark border border-surface-border focus:border-gold rounded-xl py-2 px-3 text-white placeholder-gray-600 focus:outline-none text-sm transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Categoría</label>
                  <select 
                    value={newCategory} onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-surface-dark border border-surface-border text-white text-sm rounded-xl py-2 px-3 focus:outline-none focus:border-gold"
                  >
                    <option value="Estilizado">Estilizado</option>
                    <option value="Hidratación">Hidratación</option>
                    <option value="Cuidado">Cuidado Capilar</option>
                    <option value="Acabado">Acabado / Aftershave</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Proveedor / Distribuidor</label>
                  <input 
                    type="text" required placeholder="Ej. BarberPro CDMX"
                    value={newProvider} onChange={(e) => setNewProvider(e.target.value)}
                    className="w-full bg-surface-dark border border-surface-border focus:border-gold rounded-xl py-2 px-3 text-white placeholder-gray-600 focus:outline-none text-sm transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Stock Inicial</label>
                  <input 
                    type="number" required min={0}
                    value={newStock} onChange={(e) => setNewStock(Number(e.target.value))}
                    className="w-full bg-surface-dark border border-surface-border focus:border-gold rounded-xl py-2 px-3 text-white text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Mínimo de Alerta</label>
                  <input 
                    type="number" required min={0}
                    value={newMinStock} onChange={(e) => setNewMinStock(Number(e.target.value))}
                    className="w-full bg-surface-dark border border-surface-border focus:border-gold rounded-xl py-2 px-3 text-white text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Costo Adquisición ($)</label>
                  <input 
                    type="number" required min={0}
                    value={newCost} onChange={(e) => setNewCost(Number(e.target.value))}
                    className="w-full bg-surface-dark border border-surface-border focus:border-gold rounded-xl py-2 px-3 text-white text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Precio de Venta ($)</label>
                  <input 
                    type="number" required min={0}
                    value={newPrice} onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full bg-surface-dark border border-surface-border focus:border-gold rounded-xl py-2 px-3 text-white text-sm focus:outline-none"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 bg-gold hover:bg-gold-light text-black font-bold text-xs rounded-xl uppercase tracking-wider transition-all cursor-pointer shadow-lg"
              >
                Crear Registro
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export type InventarioPropsType = InventarioProps;
export type InventarioType = React.ComponentType<InventarioProps>;
export const InventarioComponent = Inventario;
