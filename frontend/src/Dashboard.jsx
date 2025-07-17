import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ChartPage from './ChartPage';
import {
  AlertTriangle,
  FileText,
  Warehouse,
  MonitorSmartphone
} from 'lucide-react';

function Dashboard({ token, role }) {
  const [products, setProducts] = useState([]);
  const [machines, setMachines] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [storageLocations, setStorageLocations] = useState([]); // Novo

  const fetchProducts = () => {
    axios.get('http://localhost:3001/products', {
      headers: { Authorization: token }
    }).then(res => setProducts(res.data));
  };

  const fetchMachines = () => {
    axios.get('http://localhost:3001/inventory', {
      headers: { Authorization: token }
    }).then(res => setMachines(res.data));
  };

  const fetchDocuments = () => {
    axios.get('http://localhost:3001/documents', {
      headers: { Authorization: token }
    }).then(res => setDocuments(res.data));
  };

  const fetchStorageLocations = () => {
    axios.get('http://localhost:3001/storage-locations', {
      headers: { Authorization: token }
    }).then(res => setStorageLocations(res.data));
  };

  useEffect(() => {
    fetchProducts();
    fetchMachines();
    fetchDocuments();
    fetchStorageLocations(); // Chamada adicionada
  }, []);

  const totalStock = products.reduce((sum, p) => sum + p.quantity, 0);
  const equipmentInUse = machines.filter(m => m.observation).length;

  const inactiveMachines = machines.filter(m => {
    if (!m.observation && m.lastUsedAt) {
      const dias = Math.floor((new Date() - new Date(m.lastUsedAt)) / (1000 * 60 * 60 * 24));
      return dias > 30;
    }
    return false;
  });

  const machinesWithoutLocation = machines.filter(m => !m.observation);
  const lowStock = products.filter(p => p.quantity < 10);
  const highStock = products.filter(p => p.quantity > 100);

  const equipmentNamesByLocation = {};
  machines.forEach(m => {
    const loc = m.observation?.trim();
    if (loc) {
      if (!equipmentNamesByLocation[loc]) equipmentNamesByLocation[loc] = [];
      equipmentNamesByLocation[loc].push(m.name);
    }
  });

  return (
    <div className="mx-auto space-y-10 text-white max-w-10xl">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-5 flex items-center gap-4">
          <Warehouse className="w-8 h-8 text-red-400" />
          <div>
            <p className="text-sm text-gray-400">Produtos</p>
            <h4 className="text-xl font-bold">
              {totalStock} <span className="text-sm text-gray-400">({[...new Set(products.map(p => p.type))].length} tipos)</span>
            </h4>
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-5 flex items-center gap-4">
          <MonitorSmartphone className="w-8 h-8 text-green-400" />
          <div>
            <p className="text-sm text-gray-400">Equipamentos</p>
            <h4 className="text-xl font-bold">
              {machines.length} <span className="text-sm text-gray-400">({equipmentInUse} em uso)</span>
            </h4>
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-5 flex items-center gap-4">
          <FileText className="w-8 h-8 text-yellow-400" />
          <div>
            <p className="text-sm text-gray-400">Documentos</p>
            <h4 className="text-xl font-bold">{documents.length}</h4>
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-5 flex items-center gap-4">
          <Warehouse className="w-8 h-8 text-blue-400" />
          <div>
            <p className="text-sm text-gray-400">Armazéns ativos</p>
            <h4 className="text-xl font-bold">{storageLocations.length}</h4>
          </div>
        </div>
      </div>

      {/* Alertas */}
      {lowStock.length > 0 && (
        <section className="bg-yellow-800/20 border border-yellow-600 p-6 rounded-lg">
          <h3 className="text-yellow-400 text-xl font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6" /> Produtos com Stock Baixo
          </h3>
          <ul className="text-yellow-300 space-y-1 text-sm">
            {lowStock.map(p => (
              <li key={p.id}>• {p.name} — {p.quantity} unidades ({p.type}, {p.storage_location})</li>
            ))}
          </ul>
        </section>
      )}

      

      {inactiveMachines.length > 0 && (
        <section className="bg-orange-800/20 border border-orange-600 p-6 rounded-lg">
          <h3 className="text-orange-400 text-xl font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6" /> Equipamentos Inativos (+30 dias)
          </h3>
          <ul className="text-orange-300 space-y-1 text-sm">
            {inactiveMachines.map(m => (
              <li key={m.id}>• {m.name} — {Math.floor((new Date() - new Date(m.lastUsedAt)) / (1000 * 60 * 60 * 24))} dias sem uso</li>
            ))}
          </ul>
        </section>
      )}

      {/* Gráficos */}
      <ChartPage products={products} machines={machines} />
    </div>
  );
}

export default Dashboard;
