import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function ChartPage({ products, machines = [] }) {
  const stockByType = {};
  const stockByLocation = {};
  const stockByProduct = {}; // novo
  const stockCritical = {};
  const stockHigh = {};

  products.forEach(p => {
    const tipo = p.type || 'Desconhecido';
    const local = p.storage_location || 'Indefinido';
    stockByType[tipo] = (stockByType[tipo] || 0) + p.quantity;
    stockByLocation[local] = (stockByLocation[local] || 0) + p.quantity;
    stockByProduct[p.name] = p.quantity; // novo
    if (p.quantity < 10) stockCritical[p.name] = p.quantity;
    if (p.quantity > 100) stockHigh[p.name] = p.quantity;
  });

  const equipmentNamesByLocation = {};
  const machineByType = {};
  const now = new Date();
  const warehouseTotals = {};
  const inactiveMachines = [];

  machines.forEach(m => {
    const loc = m.observation?.trim();
    if (loc) {
      if (!equipmentNamesByLocation[loc]) equipmentNamesByLocation[loc] = [];
      equipmentNamesByLocation[loc].push(m.name);
    }

    const type = m.type || 'Desconhecido';
    machineByType[type] = (machineByType[type] || 0) + 1;

    if (!m.observation && m.lastUsedAt) {
      const dias = Math.floor((now - new Date(m.lastUsedAt)) / (1000 * 60 * 60 * 24));
      if (dias > 30) inactiveMachines.push({ name: m.name, dias });
    }

    const armazem = m.local || 'Indefinido';
    warehouseTotals[armazem] = (warehouseTotals[armazem] || 0) + 1;
  });

  products.forEach(p => {
    const loc = p.storage_location || 'Indefinido';
    warehouseTotals[loc] = (warehouseTotals[loc] || 0) + p.quantity;
  });

  const buildBarData = (labels, values, label, color) => ({
    labels,
    datasets: [
      {
        label,
        data: values,
        backgroundColor: color,
        borderRadius: 6
      }
    ]
  });

  const chartOptions = {
    responsive: true,
    plugins: { legend: { labels: { color: '#fff' } } },
    scales: {
      x: { ticks: { color: '#ccc' }, grid: { display: false } },
      y: { ticks: { color: '#ccc' }, grid: { display: false } }
    }
  };

  const sections = [
    {
      label: '📦 Produtos',
      charts: [
        {
          title: '📊 Stock por Tipo',
          data: buildBarData(Object.keys(stockByType), Object.values(stockByType), 'Stock por Tipo', '#f87171')
        },
        {
          title: '🏭 Stock por Armazém',
          data: buildBarData(Object.keys(stockByLocation), Object.values(stockByLocation), 'Stock por Armazém', '#34d399')
        },
        {
          title: '📦 Stock por Produto',
          data: buildBarData(Object.keys(stockByProduct), Object.values(stockByProduct), 'Stock por Produto', '#4ade80')
        },
        {
          title: '⚠️ Stock Crítico (< 10)',
          data: buildBarData(Object.keys(stockCritical), Object.values(stockCritical), 'Stock Crítico', '#facc15')
        },
        {
          title: '📈 Stock Elevado (> 100)',
          data: buildBarData(Object.keys(stockHigh), Object.values(stockHigh), 'Stock Elevado', '#60a5fa')
        }
      ],
      color: 'text-red-400'
    },
    {
      label: '🛠️ Equipamento',
      charts: [
        {
          title: '⚙️ Equipamento por Tipo',
          data: buildBarData(Object.keys(machineByType), Object.values(machineByType), 'Tipos', '#a78bfa')
        },
        {
          title: '🕒 Inativos (+30 dias)',
          data: buildBarData(inactiveMachines.map(m => m.name), inactiveMachines.map(m => m.dias), 'Dias Inativo', '#f87171')
        },
        {
          title: '🏬 Totais por Armazém',
          data: buildBarData(Object.keys(warehouseTotals), Object.values(warehouseTotals), 'Geral por Armazém', '#34d399')
        }
      ],
      cardComponent: (
        <div className="bg-[#101010] border border-[#444] p-6 rounded-2xl shadow-md space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 pb-2">
            📍 Equipamento em Uso por Localização
          </h3>

          {Object.keys(equipmentNamesByLocation).length === 0 ? (
            <p className="text-gray-500 italic">Sem equipamentos em uso.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(equipmentNamesByLocation)
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([loc, names]) => (
                  <div
                    key={loc}
                    className="bg-[#181818] border border-[#333] rounded-xl p-4 shadow-inner"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-blue-300 font-semibold text-base">{loc}</span>
                      <span className="text-xs text-gray-400">({names.length} equipamento{names.length > 1 ? 's' : ''})</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {names.map((name, idx) => (
                        <span
                          key={idx}
                          className="bg-blue-700/20 border border-blue-600 text-blue-200 px-3 py-1 rounded-full text-sm font-medium shadow-sm"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      ),
      color: 'text-green-400'
    }
  ];

  return (
    <section className="mt-10 space-y-10">
      {sections.map((section, idx) => (
        <div key={idx} className="bg-[#1a1a1a] p-6 rounded-xl border border-[#333] space-y-6">
          <h2 className={`text-2xl font-bold ${section.color} mb-4`}>{section.label}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {section.cardComponent && (
              <div className="col-span-full">{section.cardComponent}</div>
            )}
            {section.charts.map((chart, index) => (
              <div key={index} className="bg-[#111] rounded-xl p-6 border border-[#444]">
                <h3 className="text-lg font-semibold text-white mb-4">{chart.title}</h3>
                {chart.data.labels.length === 0 ? (
                  <p className="text-gray-500 italic">Sem dados para apresentar.</p>
                ) : (
                  <Bar data={chart.data} options={chartOptions} />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

export default ChartPage;
