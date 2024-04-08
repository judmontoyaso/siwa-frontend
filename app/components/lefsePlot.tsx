"use client"
import { useState, useEffect } from "react";
import Plot from "react-plotly.js";

const LefsePlot = ({ data }: { data: any }) => {
  const [traces, setTraces] = useState([]);
  const [layout, setLayout] = useState({});

  useEffect(() => {
    const newTraces: ((prevState: never[]) => never[]) | { type: string; orientation: string; x: any; y: any; name: unknown; }[] = [];
    const groups = [...new Set(data?.data?.map((item: any[]) => item[1]))];

    groups.forEach(group => {
      const groupData = data?.data?.filter((item: unknown[]) => item[1] === group);

      // Ordena groupData de mayor a menor según el valor de 'ef_lda' (índice 2)
      const trace = {
        type: 'bar',
        orientation: 'h',
        x: groupData.map((item: any[]) => item[2]),
        y: groupData.map((item: any[]) => item[0]),
        name: group,
      };

      newTraces.push(trace);
    });

    const newLayout = {
      title: 'LefSe Results',
      xaxis: { title: 'LDA Score' },
      yaxis: { title: 'Features', automargin: true },
      barmode: 'group',
      margin: { l: 120, r: 10, t: 0, b: 20 },
      height: 900,
      width: 900,
      showlegend: true, // Asegura que la leyenda se muestre siempre
    };

    setTraces(newTraces as never[]);
    setLayout(newLayout);
  }, [data]);

  return (
    <Plot
      data={traces}
      layout={layout}
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default LefsePlot;
