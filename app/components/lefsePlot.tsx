import React, { useEffect, useState } from 'react';
import { ImTelegram } from 'react-icons/im';
import Plot from 'react-plotly.js';

const LefsePlot = ({ data }: { data: any }) => {
  const [traces, setTraces] = useState([]);
  const [layout, setLayout] = useState({});

  useEffect(() => {
    console.log(data);
    // Transformación de datos y configuración de la gráfica dentro de useEffect
    const newTraces: ((prevState: never[]) => never[]) | { type: string; orientation: string; name: unknown; x: any; y: any; }[] = [];
    const groups = [...new Set(data?.data?.map((item: any[]) => item[1]))];
console.log(groups);
    groups.forEach(group => {
      const groupData = data?.data?.filter((item: unknown[]) => item[1] === group,);
        // Ordena groupData de mayor a menor según el valor de 'ef_lda' (índice 2)
    groupData.sort((a: number[], b: number[]) => a[2] - b[2]);
      const trace = {
        type: 'bar',
        orientation: 'h',
        name: group,
        x: groupData.map((item:  any[]) => item[2]),
        y: groupData.map((item:  any[]) => item[0]),
        
      };
      console.log(trace);
      newTraces.push(trace);
      console.log(newTraces);
    });

    const newLayout = {
      title: 'LefSe Results',
      xaxis: { title: 'LDA Score' },
      yaxis: { title: 'Features', automargin: true },
      barmode: 'group',
      margin: { l: 120, r: 10, t: 0, b: 20 },
      height: 900,
      width: 900
  };

  

    setTraces(newTraces as never[]);
    setLayout(newLayout);
  }, [data]); // Dependencias de useEffect para reaccionar a cambios en los datos

  return (
    <Plot
      data={traces}
      layout={layout}
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default LefsePlot;
