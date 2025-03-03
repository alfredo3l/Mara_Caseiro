'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Defina seu token do Mapbox aqui ou use uma variável de ambiente
// IMPORTANTE: Use um token público (pk.*) e não um token secreto (sk.*)
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

interface Regiao {
  id: string;
  nome: string;
  cor: string;
  coordenadorId: string | null;
  municipios: string[];
}

interface Coordenador {
  id: string;
  nome: string;
  email: string;
  telefone: string;
}

interface Municipio {
  id: string;
  nome: string;
  regiaoId: string;
  populacao?: number;
  coordenadas?: [number, number];
}

type TipoVisualizacao = 'padrao' | 'coordenadores' | 'populacao';

interface MapBoxProps {
  center?: [number, number];
  zoom?: number;
  regioes: Regiao[];
  coordenadores: Coordenador[];
  municipios?: Municipio[];
  selectedRegiao?: string | null;
  isFullscreen?: boolean;
  mostrarRotulos?: boolean;
  tipoVisualizacao?: TipoVisualizacao;
  onSelectRegiao?: (regiao: Regiao) => void;
  onSelectMunicipio?: (municipio: Municipio) => void;
  onRegiaoClick?: (regiaoId: string) => void;
  onAssignCoordenador?: (regiaoId: string, coordenadorId: string) => void;
}

export default function MapBox({
  center = [-55.0, -20.5], // Centro aproximado do MS
  zoom = 6,
  regioes,
  coordenadores,
  municipios = [],
  selectedRegiao,
  isFullscreen = false,
  mostrarRotulos = true,
  tipoVisualizacao = 'padrao',
  onSelectRegiao,
  onSelectMunicipio,
  onRegiaoClick,
  onAssignCoordenador
}: MapBoxProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [hoveredRegiao, setHoveredRegiao] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [tokenError, setTokenError] = useState(false);
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 });
  const [mostrarLegenda, setMostrarLegenda] = useState(true);

  // Monitorar mudanças no tamanho da tela
  useEffect(() => {
    const updateMapSize = () => {
      if (mapContainer.current) {
        setMapSize({
          width: mapContainer.current.offsetWidth,
          height: mapContainer.current.offsetHeight
        });
      }
    };

    // Atualizar tamanho inicial
    updateMapSize();

    // Adicionar listener para redimensionamento
    window.addEventListener('resize', updateMapSize);

    // Limpar listener
    return () => {
      window.removeEventListener('resize', updateMapSize);
    };
  }, []);

  // Inicializar o mapa
  useEffect(() => {
    if (!mapContainer.current) return;
    
    // Verificar se o token do Mapbox está definido
    if (!mapboxgl.accessToken) {
      console.error('Erro: Token do Mapbox não definido. Defina NEXT_PUBLIC_MAPBOX_TOKEN no arquivo .env.local');
      setTokenError(true);
      return;
    }
    
    // Verificar se o token é público (começa com pk.)
    if (typeof mapboxgl.accessToken === 'string' && !mapboxgl.accessToken.startsWith('pk.')) {
      console.error('Erro: Use um token público do Mapbox (pk.*) e não um token secreto (sk.*)');
      setTokenError(true);
      return;
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: center,
      zoom: zoom,
      attributionControl: false, // Remover controles de atribuição padrão
      logoPosition: 'bottom-right' // Posicionar logo no canto inferior direito
    });

    // Adicionar controles de navegação
    map.current.addControl(new mapboxgl.NavigationControl({
      showCompass: true,
      showZoom: true,
      visualizePitch: false
    }), 'top-right');

    // Adicionar controle de atribuição personalizado
    map.current.addControl(new mapboxgl.AttributionControl({
      compact: true
    }), 'bottom-right');

    // Adicionar controle de escala
    map.current.addControl(new mapboxgl.ScaleControl({
      maxWidth: 100,
      unit: 'metric'
    }), 'bottom-left');

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    // Ajustar o mapa quando a janela for redimensionada
    const handleResize = () => {
      if (map.current) {
        map.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      map.current?.remove();
    };
  }, [center, zoom]);

  // Atualizar o mapa quando o tamanho do contêiner mudar ou quando o modo de tela cheia mudar
  useEffect(() => {
    if (map.current && mapSize.width > 0 && mapSize.height > 0) {
      setTimeout(() => {
        map.current?.resize();
      }, 200); // Reduzir o atraso para uma resposta mais rápida
    }
  }, [mapSize, isFullscreen]);

  // Carregar dados GeoJSON e configurar camadas
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    // Carregar dados GeoJSON dos municípios
    fetch('/geojson/ms_municipios.json')
      .then(response => response.json())
      .then(data => {
        // Adicionar fonte de dados
        if (!map.current?.getSource('municipios')) {
          map.current?.addSource('municipios', {
            type: 'geojson',
            data: data
          });

          // Adicionar camada de preenchimento
          map.current?.addLayer({
            id: 'municipios-fill',
            type: 'fill',
            source: 'municipios',
            layout: {},
            paint: {
              'fill-opacity': [
                'case',
                ['boolean', ['==', ['get', 'id'], ['literal', hoveredRegiao]], false],
                0.8,
                0.6
              ],
              'fill-color': [
                'match',
                ['get', 'regiao'],
                'Central', '#4CAF50',
                'Sul', '#2196F3',
                'Leste', '#FFC107',
                'Pantanal', '#9C27B0',
                '#CCCCCC' // cor padrão
              ]
            }
          });

          // Adicionar camada de contorno
          map.current?.addLayer({
            id: 'municipios-line',
            type: 'line',
            source: 'municipios',
            layout: {},
            paint: {
              'line-color': '#000',
              'line-width': [
                'case',
                ['boolean', ['==', ['get', 'id'], ['literal', hoveredRegiao]], false],
                2,
                1
              ]
            }
          });

          // Adicionar camada de rótulos
          map.current?.addLayer({
            id: 'municipios-label',
            type: 'symbol',
            source: 'municipios',
            layout: {
              'text-field': ['get', 'nome'],
              'text-font': ['Open Sans Regular'],
              'text-size': 12,
              'text-offset': [0, 0.5],
              'text-anchor': 'center',
              'text-allow-overlap': false,
              'text-ignore-placement': false
            },
            paint: {
              'text-color': '#333',
              'text-halo-color': '#fff',
              'text-halo-width': 1
            }
          });

          // Adicionar eventos de interação
          map.current?.on('click', 'municipios-fill', (e) => {
            if (e.features && e.features[0] && e.features[0].properties) {
              const feature = e.features[0];
              const regiaoNome = feature.properties?.regiao;
              const regiao = regioes.find(r => r.nome === regiaoNome);
              
              if (regiao && onSelectRegiao) {
                onSelectRegiao(regiao);
              }
            }
          });

          map.current?.on('mouseenter', 'municipios-fill', (e) => {
            if (map.current) {
              map.current.getCanvas().style.cursor = 'pointer';
              
              if (e.features && e.features[0] && e.features[0].properties) {
                const municipioId = e.features[0].properties?.id;
                if (municipioId) {
                  setHoveredRegiao(municipioId);
                  
                  // Atualizar a aparência da camada
                  map.current.setPaintProperty('municipios-fill', 'fill-opacity', [
                    'case',
                    ['boolean', ['==', ['get', 'id'], municipioId], false],
                    0.8,
                    0.6
                  ]);
                  
                  map.current.setPaintProperty('municipios-line', 'line-width', [
                    'case',
                    ['boolean', ['==', ['get', 'id'], municipioId], false],
                    2,
                    1
                  ]);
                }
              }
            }
          });

          map.current?.on('mouseleave', 'municipios-fill', () => {
            if (map.current) {
              map.current.getCanvas().style.cursor = '';
              setHoveredRegiao(null);
              
              // Restaurar a aparência da camada
              map.current.setPaintProperty('municipios-fill', 'fill-opacity', 0.6);
              map.current.setPaintProperty('municipios-line', 'line-width', 1);
            }
          });
        }
      });
  }, [mapLoaded, hoveredRegiao, regioes, onSelectRegiao]);

  // Atualizar cores das regiões quando as regiões mudarem ou o tipo de visualização mudar
  useEffect(() => {
    if (!mapLoaded || !map.current || !map.current.getLayer('municipios-fill')) return;

    let matchExpression: mapboxgl.Expression;

    // Definir cores com base no tipo de visualização
    if (tipoVisualizacao === 'padrao') {
      // Visualização padrão - usar cores das regiões
      const regionColors: { [key: string]: string } = {};
      regioes.forEach(regiao => {
        regionColors[regiao.nome] = regiao.cor;
      });

      matchExpression = ['match', ['get', 'regiao']] as mapboxgl.Expression;
      
      Object.entries(regionColors).forEach(([regiao, cor]) => {
        matchExpression.push(regiao, cor);
      });
      
      // Cor padrão para regiões não mapeadas
      matchExpression.push('#CCCCCC');
    } 
    else if (tipoVisualizacao === 'coordenadores') {
      // Visualização por coordenador
      matchExpression = ['match', ['get', 'regiao']] as mapboxgl.Expression;
      
      // Criar um mapa de cores para coordenadores
      const coordenadorColors: { [key: string]: string } = {
        'sem-coordenador': '#CCCCCC'
      };
      
      // Atribuir cores diferentes para cada coordenador
      const coresCoordenadores = [
        '#E57373', '#F06292', '#BA68C8', '#9575CD', 
        '#7986CB', '#64B5F6', '#4FC3F7', '#4DD0E1', 
        '#4DB6AC', '#81C784', '#AED581', '#DCE775', 
        '#FFF176', '#FFD54F', '#FFB74D', '#FF8A65'
      ];
      
      coordenadores.forEach((coordenador, index) => {
        coordenadorColors[coordenador.id] = coresCoordenadores[index % coresCoordenadores.length];
      });
      
      // Mapear regiões para cores de coordenadores
      regioes.forEach(regiao => {
        const corCoordenador = regiao.coordenadorId 
          ? coordenadorColors[regiao.coordenadorId] 
          : coordenadorColors['sem-coordenador'];
        
        matchExpression.push(regiao.nome, corCoordenador);
      });
      
      // Cor padrão
      matchExpression.push('#CCCCCC');
    }
    else if (tipoVisualizacao === 'populacao') {
      // Visualização por população
      // Calcular população total por região
      const populacaoPorRegiao: { [key: string]: number } = {};
      
      regioes.forEach(regiao => {
        const municipiosDaRegiao = municipios.filter(m => m.regiaoId === regiao.id);
        const populacaoTotal = municipiosDaRegiao.reduce((total, municipio) => {
          return total + (municipio.populacao || 0);
        }, 0);
        
        populacaoPorRegiao[regiao.nome] = populacaoTotal;
      });
      
      // Encontrar valores mínimos e máximos para escala
      const populacoes = Object.values(populacaoPorRegiao);
      const minPop = Math.min(...populacoes);
      const maxPop = Math.max(...populacoes);
      
      // Criar escala de cores baseada na população
      matchExpression = ['match', ['get', 'regiao']] as mapboxgl.Expression;
      
      // Função para gerar cor com base na população
      const getColorForPopulation = (populacao: number): string => {
        // Normalizar população entre 0 e 1
        const normalizado = (populacao - minPop) / (maxPop - minPop);
        
        // Escala de cores de verde claro a verde escuro
        const r = Math.round(220 - normalizado * 150);
        const g = Math.round(220 - normalizado * 50);
        const b = Math.round(220 - normalizado * 150);
        
        return `rgb(${r}, ${g}, ${b})`;
      };
      
      // Aplicar cores baseadas na população
      Object.entries(populacaoPorRegiao).forEach(([regiao, populacao]) => {
        matchExpression.push(regiao, getColorForPopulation(populacao));
      });
      
      // Cor padrão
      matchExpression.push('#CCCCCC');
    }
    else {
      // Fallback para visualização padrão
      matchExpression = ['match', ['get', 'regiao']] as mapboxgl.Expression;
      regioes.forEach(regiao => {
        matchExpression.push(regiao.nome, regiao.cor);
      });
      matchExpression.push('#CCCCCC');
    }
    
    // Atualizar a propriedade de cor da camada
    map.current.setPaintProperty('municipios-fill', 'fill-color', matchExpression);
    
  }, [mapLoaded, regioes, tipoVisualizacao, coordenadores, municipios]);

  // Atualizar visibilidade dos rótulos
  useEffect(() => {
    if (!mapLoaded || !map.current || !map.current.getLayer('municipios-label')) return;
    
    map.current.setLayoutProperty(
      'municipios-label',
      'visibility',
      mostrarRotulos ? 'visible' : 'none'
    );
  }, [mapLoaded, mostrarRotulos]);

  // Destacar a região selecionada
  useEffect(() => {
    if (!mapLoaded || !map.current || !map.current.getLayer('municipios-line')) return;
    
    if (selectedRegiao) {
      const selectedRegiaoObj = regioes.find(r => r.id === selectedRegiao);
      if (selectedRegiaoObj) {
        // Destacar a região selecionada com uma borda mais grossa
        map.current.setPaintProperty('municipios-line', 'line-width', [
          'case',
          ['==', ['get', 'regiao'], selectedRegiaoObj.nome],
          3,
          ['boolean', ['==', ['get', 'id'], ['literal', hoveredRegiao]], false],
          2,
          1
        ]);
      }
    } else {
      // Restaurar a aparência padrão
      map.current.setPaintProperty('municipios-line', 'line-width', [
        'case',
        ['boolean', ['==', ['get', 'id'], ['literal', hoveredRegiao]], false],
        2,
        1
      ]);
    }
  }, [mapLoaded, selectedRegiao, regioes, hoveredRegiao]);

  // Renderizar legenda com base no tipo de visualização
  const renderLegenda = () => {
    if (tipoVisualizacao === 'padrao') {
      // Legenda padrão - mostrar regiões
      return (
        <>
          <h3 className="text-xs sm:text-sm font-semibold mb-1 sm:mb-2">Regiões</h3>
          <div className="grid grid-cols-2 gap-2">
            {regioes.map(regiao => (
              <div 
                key={regiao.id} 
                className={`flex items-center text-xs cursor-pointer hover:bg-gray-50 p-1 rounded ${selectedRegiao === regiao.id ? 'bg-gray-100' : ''}`}
                onClick={() => onSelectRegiao && onSelectRegiao(regiao)}
              >
                <div 
                  className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 rounded-sm flex-shrink-0" 
                  style={{ backgroundColor: regiao.cor }}
                />
                <span className="truncate">{regiao.nome}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 text-[10px] text-gray-500 text-center">
            Clique em uma região para ver detalhes
          </div>
        </>
      );
    } 
    else if (tipoVisualizacao === 'coordenadores') {
      // Legenda de coordenadores
      // Agrupar regiões por coordenador
      const regioesPorCoordenador: { [key: string]: Regiao[] } = {};
      
      // Inicializar com "Sem coordenador"
      regioesPorCoordenador['sem-coordenador'] = [];
      
      // Agrupar regiões por coordenador
      regioes.forEach(regiao => {
        const coordenadorId = regiao.coordenadorId || 'sem-coordenador';
        if (!regioesPorCoordenador[coordenadorId]) {
          regioesPorCoordenador[coordenadorId] = [];
        }
        regioesPorCoordenador[coordenadorId].push(regiao);
      });
      
      // Cores para coordenadores
      const coresCoordenadores = [
        '#E57373', '#F06292', '#BA68C8', '#9575CD', 
        '#7986CB', '#64B5F6', '#4FC3F7', '#4DD0E1', 
        '#4DB6AC', '#81C784', '#AED581', '#DCE775', 
        '#FFF176', '#FFD54F', '#FFB74D', '#FF8A65'
      ];
      
      return (
        <>
          <h3 className="text-xs sm:text-sm font-semibold mb-1 sm:mb-2">Coordenadores</h3>
          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
            {coordenadores.map((coordenador, index) => {
              const regioesDoCoordenador = regioesPorCoordenador[coordenador.id] || [];
              if (regioesDoCoordenador.length === 0) return null;
              
              return (
                <div key={coordenador.id} className="text-xs">
                  <div className="flex items-center mb-1">
                    <div 
                      className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 rounded-sm flex-shrink-0" 
                      style={{ backgroundColor: coresCoordenadores[index % coresCoordenadores.length] }}
                    />
                    <span className="font-medium">{coordenador.nome}</span>
                  </div>
                  <div className="ml-5 text-[10px] text-gray-600">
                    {regioesDoCoordenador.map(regiao => (
                      <div 
                        key={regiao.id}
                        className={`cursor-pointer hover:underline ${selectedRegiao === regiao.id ? 'font-medium' : ''}`}
                        onClick={() => onSelectRegiao && onSelectRegiao(regiao)}
                      >
                        {regiao.nome}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            
            {/* Regiões sem coordenador */}
            {regioesPorCoordenador['sem-coordenador'].length > 0 && (
              <div className="text-xs">
                <div className="flex items-center mb-1">
                  <div 
                    className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 rounded-sm flex-shrink-0" 
                    style={{ backgroundColor: '#CCCCCC' }}
                  />
                  <span className="font-medium">Sem coordenador</span>
                </div>
                <div className="ml-5 text-[10px] text-gray-600">
                  {regioesPorCoordenador['sem-coordenador'].map(regiao => (
                    <div 
                      key={regiao.id}
                      className={`cursor-pointer hover:underline ${selectedRegiao === regiao.id ? 'font-medium' : ''}`}
                      onClick={() => onSelectRegiao && onSelectRegiao(regiao)}
                    >
                      {regiao.nome}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      );
    }
    else if (tipoVisualizacao === 'populacao') {
      // Legenda de população
      // Calcular população total por região
      const populacaoPorRegiao: { [key: string]: { regiao: Regiao, populacao: number } } = {};
      
      regioes.forEach(regiao => {
        const municipiosDaRegiao = municipios.filter(m => m.regiaoId === regiao.id);
        const populacaoTotal = municipiosDaRegiao.reduce((total, municipio) => {
          return total + (municipio.populacao || 0);
        }, 0);
        
        populacaoPorRegiao[regiao.id] = { regiao, populacao: populacaoTotal };
      });
      
      // Ordenar regiões por população (maior para menor)
      const regioesPorPopulacao = Object.values(populacaoPorRegiao).sort((a, b) => b.populacao - a.populacao);
      
      return (
        <>
          <h3 className="text-xs sm:text-sm font-semibold mb-1 sm:mb-2">População por Região</h3>
          <div className="space-y-1 max-h-[200px] overflow-y-auto pr-1">
            {regioesPorPopulacao.map(({ regiao, populacao }) => (
              <div 
                key={regiao.id} 
                className={`flex items-center justify-between text-xs cursor-pointer hover:bg-gray-50 p-1 rounded ${selectedRegiao === regiao.id ? 'bg-gray-100' : ''}`}
                onClick={() => onSelectRegiao && onSelectRegiao(regiao)}
              >
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 rounded-sm flex-shrink-0" 
                    style={{ backgroundColor: regiao.cor }}
                  />
                  <span className="truncate">{regiao.nome}</span>
                </div>
                <span className="text-gray-600 text-[10px]">
                  {populacao.toLocaleString()} hab.
                </span>
              </div>
            ))}
          </div>
        </>
      );
    }
    
    // Fallback para legenda padrão
    return (
      <>
        <h3 className="text-xs sm:text-sm font-semibold mb-1 sm:mb-2">Regiões</h3>
        <div className="grid grid-cols-2 gap-2">
          {regioes.map(regiao => (
            <div 
              key={regiao.id} 
              className={`flex items-center text-xs cursor-pointer hover:bg-gray-50 p-1 rounded ${selectedRegiao === regiao.id ? 'bg-gray-100' : ''}`}
              onClick={() => onSelectRegiao && onSelectRegiao(regiao)}
            >
              <div 
                className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 rounded-sm flex-shrink-0" 
                style={{ backgroundColor: regiao.cor }}
              />
              <span className="truncate">{regiao.nome}</span>
            </div>
          ))}
        </div>
      </>
    );
  };

  return (
    <div className={`relative w-full h-full ${isFullscreen ? 'fixed inset-0 z-40' : ''}`}>
      {tokenError ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center p-6 max-w-md">
            <div className="text-red-500 text-xl font-semibold mb-2">Erro de configuração do Mapbox</div>
            <p className="text-gray-700 mb-4">
              O token do Mapbox não está configurado corretamente. Verifique se:
            </p>
            <ul className="text-left text-gray-600 mb-4 space-y-2">
              <li>• O token está definido no arquivo <code className="bg-gray-200 px-1 rounded">.env.local</code></li>
              <li>• O token é um token público (começa com <code className="bg-gray-200 px-1 rounded">pk.</code>)</li>
              <li>• O token não é um token secreto (começa com <code className="bg-gray-200 px-1 rounded">sk.</code>)</li>
            </ul>
            <p className="text-gray-700 text-sm">
              Obtenha um token público em <a href="https://account.mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">account.mapbox.com</a>
            </p>
          </div>
        </div>
      ) : (
        <>
          <div ref={mapContainer} className="w-full h-full" />
          
          {/* Botão para alternar a visibilidade da legenda */}
          <button
            onClick={() => setMostrarLegenda(prev => !prev)}
            className={`
              absolute z-10 p-2 bg-white rounded-full shadow-md
              ${isFullscreen ? 'bottom-8 right-8' : 'bottom-5 right-5'}
              transition-all duration-300 ease-in-out
              hover:bg-gray-100
            `}
            title={mostrarLegenda ? "Ocultar legenda" : "Mostrar legenda"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              {mostrarLegenda ? (
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              )}
            </svg>
          </button>
          
          {/* Legenda - Responsiva para diferentes tamanhos de tela */}
          {mostrarLegenda && (
            <div className={`
              absolute bg-white p-2 sm:p-3 rounded-md shadow-md z-10
              ${isFullscreen 
                ? 'bottom-8 left-8 max-w-[220px] sm:max-w-[320px]' 
                : 'bottom-5 left-5 max-w-[180px] sm:max-w-[300px]'}
              transition-all duration-300 ease-in-out animate-fade-in
            `}>
              {renderLegenda()}
            </div>
          )}
        </>
      )}
    </div>
  );
} 