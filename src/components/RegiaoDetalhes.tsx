'use client';

import { useState } from 'react';
import { MapPin, Users, Palette, BarChart2, Building, User } from 'lucide-react';
import { RegiaoDetalhesProps } from '@/types/mapa';

export default function RegiaoDetalhes({
  regiao,
  coordenador,
  coordenadores,
  municipiosDaRegiao,
  onChangeColor,
  onChangeCoordenador,
  onViewEstatisticas
}: RegiaoDetalhesProps) {
  const [showMunicipios, setShowMunicipios] = useState(false);

  // Calcular população total da região
  const populacaoTotal = municipiosDaRegiao.reduce((total, municipio) => total + municipio.populacao, 0);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{regiao.nome}</h2>
        <div 
          className="w-6 h-6 rounded-full" 
          style={{ backgroundColor: regiao.cor }}
        />
      </div>

      <div className="space-y-4">
        {/* Estatísticas */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="flex items-center text-gray-500 mb-1">
              <Building size={14} className="mr-1" />
              <span className="text-xs font-medium">Municípios</span>
            </div>
            <div className="text-lg font-semibold">{municipiosDaRegiao.length}</div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="flex items-center text-gray-500 mb-1">
              <Users size={14} className="mr-1" />
              <span className="text-xs font-medium">População</span>
            </div>
            <div className="text-lg font-semibold">
              {populacaoTotal.toLocaleString('pt-BR')}
            </div>
          </div>
        </div>

        {/* Coordenador */}
        <div className="border-t pt-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center text-gray-700">
              <User size={16} className="mr-2" />
              <span className="font-medium">Coordenador</span>
            </div>
            <button
              onClick={() => onChangeCoordenador(coordenador?.id || null)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              {coordenador ? 'Alterar' : 'Atribuir'}
            </button>
          </div>
          
          {coordenador ? (
            <div className="bg-blue-50 p-3 rounded-md">
              <div className="font-medium">{coordenador.nome}</div>
              <div className="text-sm text-gray-600">{coordenador.email}</div>
              <div className="text-sm text-gray-600">{coordenador.telefone}</div>
            </div>
          ) : (
            <div className="bg-gray-50 p-3 rounded-md text-gray-500 text-sm">
              Nenhum coordenador atribuído
            </div>
          )}
        </div>

        {/* Lista de municípios */}
        <div className="border-t pt-3">
          <div 
            className="flex items-center justify-between mb-2 cursor-pointer"
            onClick={() => setShowMunicipios(!showMunicipios)}
          >
            <div className="flex items-center text-gray-700">
              <MapPin size={16} className="mr-2" />
              <span className="font-medium">Municípios</span>
            </div>
            <button className="text-xs bg-gray-100 px-2 py-1 rounded">
              {showMunicipios ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
          
          {showMunicipios && (
            <div className="mt-2 space-y-2 max-h-60 overflow-y-auto pr-1">
              {municipiosDaRegiao.map(municipio => (
                <div key={municipio.id} className="bg-gray-50 p-2 rounded-md">
                  <div className="flex justify-between">
                    <span className="font-medium">{municipio.nome}</span>
                    <span className="text-xs text-gray-500">
                      {municipio.populacao.toLocaleString('pt-BR')} hab.
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="border-t pt-3 flex space-x-2">
          <button
            onClick={() => onChangeColor(regiao.cor)}
            className="flex-1 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none flex items-center justify-center"
          >
            <Palette size={14} className="mr-1" />
            Editar Cor
          </button>
          
          <button
            onClick={onViewEstatisticas}
            className="flex-1 px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none flex items-center justify-center"
          >
            <BarChart2 size={14} className="mr-1" />
            Ver Estatísticas
          </button>
        </div>
      </div>
    </div>
  );
} 