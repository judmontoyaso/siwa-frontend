import React from 'react';
import Plot from 'react-plotly.js';

interface SunburstChartProps {
  paths: string[];
  values: number[];
}

const SunburstChart: React.FC<SunburstChartProps> = ({ paths, values }) => {
    const rootNode = "Actinobacteriota";
    const labels = [rootNode]; // Inicia con el nodo raíz
    const parents = ['']; // El nodo raíz no tiene parent
    const dataValues: (string | number)[] = [0]; // Inicializa los valores con un valor para el nodo raíz

    
    paths.forEach((path) => {
        const segments = path.split('/');
        let currentPath = rootNode; // Inicia desde el nodo raíz
      
        segments.forEach((segment) => {
          const fullPath = `${currentPath}/${segment}`;
          if (!labels.includes(fullPath)) {
            labels.push(fullPath);
            parents.push(currentPath);
            values.push(null as never); // Añade un valor nulo o el valor real si lo tienes
          }
          currentPath = fullPath; // Actualiza el currentPath para el próximo segmento
        });
      });
  
    const data: Partial<Plotly.Data>[] = [{ // Usa `Partial<Plotly.Data>[]` para el tipo de `data`
        type: "sunburst",
        labels: labels.map(label => label || ''), // Asegúrate de que todos los labels sean strings
        parents, // Asegúrate de que todos los parents sean strings
        values: dataValues, // `values` deberían ser todos números o strings
        branchvalues: "total",
      }];
    
      const layout: Partial<Plotly.Layout> = { // Usa `Partial<Plotly.Layout>` para el tipo de `layout`
        margin: { l: 0, r: 0, b: 0, t: 0 },
      };
  
    return <Plot data={data} layout={layout} />;
  };
  
export default SunburstChart;
