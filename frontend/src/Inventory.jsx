import axios from 'axios';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import DropdownGeneral from './DropdownGeneral';

function Inventario({ token, role }) {
  const [machines, setMachines] = useState([]);
  const [newMachine, setNewMachine] = useState({ name: '', type: '', local: '', quantity: '' });
  const [errors, setErrors] = useState({});
  const [obsInputs, setObsInputs] = useState({});
  const [tiposMaquina, setTiposMaquina] = useState([]);
  const [locais, setLocais] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterLocal, setFilterLocal] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({});
  const [addToGroup, setAddToGroup] = useState({});
  const [loading, setLoading] = useState(false);
  const groupRefs = useRef({});

  useEffect(() => {
    fetchMachines();
    fetchTiposMaquina();
    fetchLocais();
  }, []);

  const fetchMachines = () => {
    axios.get('http://localhost:3001/inventory', { headers: { Authorization: token } })
      .then(res => setMachines(res.data));
  };

  const fetchTiposMaquina = () => {
    axios.get('http://localhost:3001/product-types', { headers: { Authorization: token } })
      .then(res => setTiposMaquina(res.data));
  };

  const fetchLocais = () => {
    axios.get('http://localhost:3001/storage-locations', { headers: { Authorization: token } })
      .then(res => setLocais(res.data));
  };

  const validateFields = (machine) => {
    const newErrors = {};
    if (!machine.name.trim()) newErrors.name = 'Nome é obrigatório.';
    if (!machine.type) newErrors.type = 'Tipo é obrigatório.';
    if (!machine.local) newErrors.local = 'Local é obrigatório.';
    if (!machine.quantity || machine.quantity <= 0) newErrors.quantity = 'Quantidade deve ser maior que 0.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addMachine = async (machine = newMachine, reset = true) => {
    if (!validateFields(machine)) return;
    setLoading(true);
    const payload = { name: machine.name, type: machine.type, local: machine.local };

    try {
      const requests = Array.from({ length: machine.quantity }, () =>
        axios.post('http://localhost:3001/inventory', payload, { headers: { Authorization: token } })
      );
      await Promise.all(requests);
      toast.success('Equipamento(s) adicionado(s)');
      if (reset) setNewMachine({ name: '', type: '', local: '', quantity: '' });
      setSearchTerm('');
      setFilterTipo('');
      setFilterLocal('');
      fetchMachines();
      setTimeout(() => {
        const key = `${payload.name}|${payload.type}`;
        if (groupRefs.current[key]) {
          groupRefs.current[key].scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    } catch {
      toast.error('Erro ao adicionar equipamento');
    } finally {
      setLoading(false);
    }
  };

  const updateMachine = async (id, data) => {
    try {
      await axios.put(`http://localhost:3001/inventory/${id}`, data, { headers: { Authorization: token } });
      fetchMachines();
    } catch {
      toast.error('Erro ao atualizar equipamento');
    }
  };

  const deleteMachine = async (id) => {
    if (!window.confirm('Tens a certeza que queres remover este equipamento?')) return;
    try {
      await axios.delete(`http://localhost:3001/inventory/${id}`, { headers: { Authorization: token } });
      fetchMachines();
      toast.success('Equipamento removido');
    } catch {
      toast.error('Erro ao remover equipamento');
    }
  };

  const filteredMachines = machines.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterTipo === '' || m.type === filterTipo) &&
    (filterLocal === '' || m.local === filterLocal)
  );

  const groupedMachines = filteredMachines.reduce((acc, machine) => {
    const key = `${machine.name}|${machine.type}`;
    acc[key] = acc[key] || [];
    acc[key].push(machine);
    return acc;
  }, {});

  return (
    <div className="max-w-10xl mx-auto space-y-10 text-white">
      {role === 'boss' && (
        <section className="bg-[#1a1a1a] border border-[#2c2c2c] p-6 rounded-lg">
          <h3 className="text-lg font-bold text-red-500 mb-4 flex items-center gap-2">🛠️ Adicionar Novo Equipamento</h3>
          <div className="flex flex-wrap gap-4 items-center mb-4">
            <input
              className="flex-grow min-w-[200px] h-12 px-3 text-sm bg-[#2a2a2a] text-white rounded"
              placeholder="Nome do Equipamento"
              value={newMachine.name}
              onChange={e => setNewMachine({ ...newMachine, name: e.target.value })}
            />
            <DropdownGeneral
              options={tiposMaquina}
              value={newMachine.type}
              onChange={val => setNewMachine({ ...newMachine, type: val })}
              placeholder="Seleciona o tipo"
              className="min-w-[200px] h-12 text-sm"
            />
            <DropdownGeneral
              options={locais}
              value={newMachine.local}
              onChange={val => setNewMachine({ ...newMachine, local: val })}
              placeholder="Seleciona o local"
              className="min-w-[200px] h-12 text-sm"
            />
            <input
              type="number"
              min="1"
              className="w-24 h-12 px-3 text-sm bg-[#2a2a2a] text-white rounded"
              placeholder="Qtd."
              value={newMachine.quantity || ''}
              onChange={e => setNewMachine({ ...newMachine, quantity: parseInt(e.target.value) || '' })}
            />
          </div>
          <button
            onClick={() => addMachine()}
            className="h-12 mt-2 px-6 text-sm bg-red-600 hover:bg-red-700 text-white rounded font-semibold"
            disabled={loading}
          >
            {loading ? 'A adicionar...' : 'Adicionar Equipamento'}
          </button>
        </section>
      )}

      <section className="bg-[#1a1a1a] border border-[#2c2c2c] p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold text-red-500 mb-4">🧰 Equipamento em Inventário</h2>
        <div className="flex flex-wrap gap-4 items-center mb-6">
          <input
            type="text"
            placeholder="Pesquisar por nome..."
            className="flex-grow min-w-[200px] h-12 px-3 text-sm bg-[#2a2a2a] text-white rounded"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <DropdownGeneral
            options={[...new Set(machines.map(m => m.type).filter(Boolean))]}
            value={filterTipo}
            onChange={setFilterTipo}
            placeholder="Filtrar por tipo"
            allowEmpty
            className="min-w-[200px] h-12 text-sm"
          />
          <DropdownGeneral
            options={[...new Set(machines.map(m => m.local).filter(Boolean))]}
            value={filterLocal}
            onChange={setFilterLocal}
            placeholder="Filtrar por local"
            allowEmpty
            className="min-w-[200px] h-12 text-sm"
          />
        </div>

        <div className="space-y-6">
          {Object.entries(groupedMachines).sort(([a], [b]) => a.localeCompare(b)).map(([key, group]) => {
            const [name, type] = key.split('|');
            const isExpanded = expandedGroups[key] || false;
            const newQty = addToGroup[key]?.quantity || 1;

            return (
              <div key={key} ref={el => (groupRefs.current[key] = el)} className="border border-[#2e2e2e] rounded-lg p-4 bg-[#1a1a1a] shadow-sm">
                <div className="flex justify-between items-start sm:items-center gap-2 flex-wrap">
                  <div>
                    <h3 className="text-lg font-bold">{name} ({group.length}) - {type}</h3>
                    <p className="text-blue-400 text-sm mt-1">Qtd: {group.length}</p>
                  </div>
                  <button
                    onClick={() => setExpandedGroups(prev => ({ ...prev, [key]: !isExpanded }))}
                    title="Expandir/recolher grupo"
                    className="text-gray-300 hover:text-white"
                  >
                    {isExpanded ? <ChevronUp /> : <ChevronDown />}
                  </button>
                </div>

                {role === 'boss' && (
                  <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:items-center">
                    <input
                      type="number"
                      placeholder="Qtd."
                      min="1"
                      value={addToGroup[key]?.inputValue || ''}
                      onChange={e => {
                        const val = parseInt(e.target.value);
                        setAddToGroup(prev => ({
                          ...prev,
                          [key]: {
                            ...prev[key],
                            inputValue: e.target.value,
                            quantity: isNaN(val) ? 1 : val
                          }
                        }));
                      }}
                      className="w-full sm:w-24 h-12 px-3 text-sm bg-[#2a2a2a] text-white rounded"
                    />
                    <DropdownGeneral
                      options={locais}
                      value={addToGroup[key]?.local || locais[0]}
                      onChange={val => setAddToGroup(prev => ({ ...prev, [key]: { ...prev[key], local: val } }))}
                      className="w-full sm:w-[160px] h-12 text-sm"
                    />
                    <button
                      onClick={() =>
                        addMachine({ name, type, local: addToGroup[key]?.local || locais[0], quantity: newQty }, false)
                      }
                      className="w-full sm:w-auto h-12 px-4 bg-green-600 hover:bg-green-700 rounded text-white text-sm font-semibold"
                    >
                      + Adicionar
                    </button>
                  </div>
                )}

                {isExpanded && (
                  <div className="mt-4 space-y-4">
                    {group.map(machine => {
                      const obsValue = obsInputs[machine.id] || '';
                      const isInUse = !!machine.observation;
                      const borderColor = isInUse ? 'border-yellow-500' : 'border-green-500';

                      return (
                        <div key={machine.id} className={`flex flex-col sm:flex-row justify-between gap-4 border-l-4 ${borderColor} bg-[#1e1e1e] px-4 py-3 rounded`}>
                          <div className="text-sm">
                            {isInUse ? (
                              <p className="text-yellow-400 italic">Em uso: {machine.observation}</p>
                            ) : (
                              <p className="text-green-400">Armazém: {machine.local || 'Indefinido'}</p>
                            )}
                            <p className="text-xs text-gray-400">ID: {machine.id}</p>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-end w-full sm:w-auto">
                            {!isInUse && (
                              <>
                                <DropdownGeneral
                                  options={locais}
                                  value={machine.local || ''}
                                  onChange={val => updateMachine(machine.id, { local: val, observation: null })}
                                  className="w-full sm:w-auto h-12 text-sm"
                                />
                                <input
                                  type="text"
                                  placeholder="Destino (ex: Obra A)"
                                  className="bg-[#1a1a1a] border px-3 h-12 text-sm rounded text-white w-full sm:w-auto"
                                  value={obsValue}
                                  onChange={e => setObsInputs(prev => ({ ...prev, [machine.id]: e.target.value }))}
                                />
                                <button
                                  onClick={() => {
                                    if (obsValue.trim()) {
                                      updateMachine(machine.id, { observation: obsValue.trim(), local: null });
                                      setObsInputs(prev => ({ ...prev, [machine.id]: '' }));
                                    }
                                  }}
                                  disabled={!obsValue.trim()}
                                  className={`w-full sm:w-auto h-12 px-4 text-sm rounded ${obsValue.trim() ? 'bg-yellow-600 hover:bg-yellow-700 text-black' : 'bg-gray-600 text-white cursor-not-allowed'}`}
                                >
                                  <Plus className="w-4 h-4 inline" /> Usar
                                </button>
                              </>
                            )}
                            {isInUse && (
                              <button
                                onClick={() => updateMachine(machine.id, { local: locais[0], observation: null })}
                                className="w-full sm:w-auto h-12 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded"
                              >
                                Mover para Armazém
                              </button>
                            )}
                            {role === 'boss' && (
                              <button
                                onClick={() => deleteMachine(machine.id)}
                                title="Remover equipamento"
                                className="w-full sm:w-auto h-12 px-4 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
                              >
                                <Trash2 className="w-4 h-4 inline" /> Remover
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default Inventario;
