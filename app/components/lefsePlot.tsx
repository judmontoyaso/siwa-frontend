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

    const [traces, setTraces] = useState<{ type: string; orientation: string; x: any; y: any; name: unknown; }[]>([]);
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
