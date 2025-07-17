import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Trash2, Minus } from 'lucide-react';
import DropdownGeneral from './DropdownGeneral';

function Produtos({ token, role }) {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', quantity: '', type: '', storage_location: '' });
  const [errors, setErrors] = useState({});
  const [adjustment, setAdjustment] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterLocal, setFilterLocal] = useState('');
  const [productTypes, setProductTypes] = useState([]);
  const [storageLocations, setStorageLocations] = useState([]);

  const fetchProducts = () => {
    axios.get('http://localhost:3001/products', { headers: { Authorization: token } })
      .then(res => setProducts(res.data));
  };

  const fetchProductTypes = () => {
    axios.get('http://localhost:3001/product-types', { headers: { Authorization: token } })
      .then(res => setProductTypes(res.data));
  };

  const fetchStorageLocations = () => {
    axios.get('http://localhost:3001/storage-locations', { headers: { Authorization: token } })
      .then(res => setStorageLocations(res.data));
  };

  useEffect(() => {
    fetchProducts();
    fetchProductTypes();
    fetchStorageLocations();
  }, []);

  const validateFields = () => {
    const newErrors = {};
    if (!newProduct.name.trim()) newErrors.name = 'Nome é obrigatório.';
    if (!newProduct.quantity || newProduct.quantity <= 0) newErrors.quantity = 'Quantidade tem de ser maior que 0.';
    if (!newProduct.type) newErrors.type = 'Tipo é obrigatório.';
    if (!newProduct.storage_location) newErrors.storage_location = 'Local é obrigatório.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addProduct = () => {
    if (!validateFields()) return;
    axios.post('http://localhost:3001/products', {
      ...newProduct,
      quantity: parseInt(newProduct.quantity)
    }, { headers: { Authorization: token } })
      .then(() => {
        setNewProduct({ name: '', quantity: '', type: '', storage_location: '' });
        setErrors({});
        fetchProducts();
      });
  };

  const deleteProduct = (id) => {
    axios.delete(`http://localhost:3001/products/${id}`, { headers: { Authorization: token } })
      .then(fetchProducts);
  };

  const updateQuantity = (id, newQty) => {
    axios.put(`http://localhost:3001/products/${id}`, { quantity: newQty }, { headers: { Authorization: token } })
      .then(fetchProducts);
  };

  return (
    <div className="max-w-10xl mx-auto space-y-10 text-white">
      {role === 'boss' && (
        <section className="bg-[#1a1a1a] border border-[#2c2c2c] p-6 rounded-lg">
          <h3 className="text-lg font-bold text-red-500 mb-4 flex items-center gap-2">🆕 Adicionar Novo Produto</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[{ key: 'name', type: 'text', placeholder: 'Nome' }, { key: 'quantity', type: 'number', placeholder: 'Quantidade' }].map(({ key, type, placeholder }) => (
              <div key={key} className="pb-2">
                <input
                  type={type}
                  className="bg-[#2a2a2a] text-white p-3 rounded w-full"
                  placeholder={placeholder}
                  value={newProduct[key]}
                  onChange={e => setNewProduct({ ...newProduct, [key]: e.target.value })}
                />
                {errors[key] && <span className="text-sm text-red-500 block mt-1">{errors[key]}</span>}
              </div>
            ))}

            <div className="pb-2">
              <DropdownGeneral
                options={productTypes}
                value={newProduct.type}
                onChange={val => setNewProduct({ ...newProduct, type: val })}
                placeholder="Seleciona o tipo"
              />
              {errors.type && <span className="text-sm text-red-500 block mt-1">{errors.type}</span>}
            </div>

            <div className="pb-2">
              <DropdownGeneral
                options={storageLocations}
                value={newProduct.storage_location}
                onChange={val => setNewProduct({ ...newProduct, storage_location: val })}
                placeholder="Seleciona armazém"
              />
              {errors.storage_location && <span className="text-sm text-red-500 block mt-1">{errors.storage_location}</span>}
            </div>
          </div>
          <button onClick={addProduct} className="mt-6 bg-red-600 hover:bg-red-700 px-6 py-2 rounded text-white font-semibold">
            Adicionar Produto
          </button>
        </section>
      )}

      <section className="bg-[#1a1a1a] border border-[#2c2c2c] p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold text-red-500 mb-4 flex items-center gap-2">📦 Gestão de Stock</h2>
       <div className="flex flex-wrap gap-4 mb-6">
  <div className="flex-grow min-w-[200px]">
    <input
      type="text"
      placeholder="Pesquisar por nome..."
      className="w-full bg-[#2a2a2a] text-white p-3 rounded h-12"
      value={searchTerm}
      onChange={e => setSearchTerm(e.target.value.toLowerCase())}
    />
  </div>

  <div className="w-full sm:w-64">
    <DropdownGeneral
      options={[...new Set(products.map(p => p.type).filter(Boolean))]}
      value={filterTipo}
      onChange={setFilterTipo}
      placeholder="Filtrar por tipo"
      allowEmpty
    />
  </div>

  <div className="w-full sm:w-64">
    <DropdownGeneral
      options={[...new Set(products.map(p => p.storage_location).filter(Boolean))]}
      value={filterLocal}
      onChange={setFilterLocal}
      placeholder="Filtrar por armazém"
      allowEmpty
    />
  </div>
</div>



        <div className="space-y-6">
          {products
            .filter(p =>
              p.name.toLowerCase().includes(searchTerm) &&
              (filterTipo === '' || p.type === filterTipo) &&
              (filterLocal === '' || p.storage_location === filterLocal)
            )
            .map(p => (
              <div key={p.id} className="border border-[#2e2e2e] rounded-lg p-4 bg-[#1a1a1a] shadow-sm">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white">{p.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Tipo: {p.type} | Armazém: {p.storage_location}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
                    <span className="text-base font-medium text-blue-400">
                      {p.quantity} unidades
                    </span>

                    {role === 'boss' && (
                      <div className="flex flex-col sm:flex-row items-stretch gap-2 w-full sm:w-auto">
                        <input
                          type="number"
                          min="1"
                          className="bg-[#2a2a2a] text-white px-3 py-2 rounded w-full sm:w-20"
                          placeholder="Qtd"
                          value={adjustment[p.id] || ''}
                          onChange={e =>
                            setAdjustment({
                              ...adjustment,
                              [p.id]: parseInt(e.target.value) || 0
                            })
                          }
                        />
                        <div className="flex gap-2 justify-start">
                          <button
                            onClick={() =>
                              updateQuantity(p.id, p.quantity - (adjustment[p.id] || 0))
                            }
                            className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded flex items-center justify-center"
                          >
                            <Minus className="w-4 h-4 text-white" />
                          </button>
                          <button
                            onClick={() =>
                              updateQuantity(p.id, p.quantity + (adjustment[p.id] || 0))
                            }
                            className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded flex items-center justify-center"
                          >
                            <Plus className="w-4 h-4 text-white" />
                          </button>
                        </div>
                        <button
                          onClick={() => deleteProduct(p.id)}
                          className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded flex items-center justify-center gap-2 w-full md:w-auto"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                          <span className="text-white text-sm font-medium block md:hidden">Remover</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}

export default Produtos;