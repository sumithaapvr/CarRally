import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import { FaChartBar, FaChartPie, FaChartLine, FaTable } from 'react-icons/fa';
import './Analysis.css';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const Analysis = () => {
  const [barData, setBarData] = useState(null);
  const [pieData, setPieData] = useState(null);
  const [lineData, setLineData] = useState(null);
  const [heatmapTable, setHeatmapTable] = useState(null);
  const [summary, setSummary] = useState(null);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [selectedChart, setSelectedChart] = useState(null);

  useEffect(() => {
    // Retrieve data from localStorage when the component mounts
    const savedState = JSON.parse(localStorage.getItem('analysisData'));
    if (savedState) {
      setBarData(savedState.barData);
      setPieData(savedState.pieData);
      setLineData(savedState.lineData);
      setHeatmapTable(savedState.heatmapTable);
      setSummary(savedState.summary);
      setFileUploaded(true);
    }
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const workbook = XLSX.read(bstr, { type: 'binary' });
      const wsname = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[wsname];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      processData(jsonData);
      setFileUploaded(true);  // Mark file as uploaded
    };
    reader.readAsBinaryString(file);
  };

  const calculateMinutes = (start, end) => {
    if (!start || !end || !start.includes(':') || !end.includes(':')) return null;
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    return (eh * 60 + em) - (sh * 60 + sm);
  };

  const processData = (data) => {
    const penalties = {};
    const trendLabels = [];
    const trendActual = [];
    const trendIdeal = [];
    const heatmap = [];

    const delayCategories = { Early: 0, OnTime: 0, Late: 0 };

    data.forEach((row) => {
      const driver = row.Driver;

      const tc1Actual = calculateMinutes(row.TC1_Start, row.TC1_Finish);
      const tc2Actual = calculateMinutes(row.TC2_Start, row.TC2_Finish);

      const tc1Ideal = row.TC1_Ideal;
      const tc2Ideal = row.TC2_Ideal;

      if (tc1Actual === null || tc2Actual === null || tc1Ideal == null || tc2Ideal == null) return;

      const delay1 = tc1Actual - tc1Ideal;
      const delay2 = tc2Actual - tc2Ideal;
      const totalDelay = delay1 + delay2;

      penalties[driver] = totalDelay;

      if (totalDelay < 0) delayCategories.Early++;
      else if (totalDelay === 0) delayCategories.OnTime++;
      else delayCategories.Late++;

      trendLabels.push(`${driver} - TC1`);
      trendLabels.push(`${driver} - TC2`);
      trendActual.push(tc1Actual, tc2Actual);
      trendIdeal.push(tc1Ideal, tc2Ideal);

      heatmap.push({ driver, TC1: delay1, TC2: delay2 });
    });

    const newState = {
      barData: {
        labels: Object.keys(penalties),
        datasets: [
          {
            label: 'Total Penalty (min)',
            data: Object.values(penalties),
            backgroundColor: 'rgba(255, 99, 132, 0.6)',
          },
        ],
      },
      pieData: {
        labels: ['Early', 'On Time', 'Late'],
        datasets: [
          {
            data: [
              delayCategories.Early,
              delayCategories.OnTime,
              delayCategories.Late,
            ],
            backgroundColor: ['#36A2EB', '#4BC0C0', '#FF6384'],
          },
        ],
      },
      lineData: {
        labels: trendLabels,
        datasets: [
          {
            label: 'Actual Time',
            data: trendActual,
            fill: false,
            borderColor: '#FF6384',
          },
          {
            label: 'Ideal Time',
            data: trendIdeal,
            fill: false,
            borderColor: '#36A2EB',
          },
        ],
      },
      heatmapTable: heatmap,
      summary: { totalDrivers: data.length },
    };

    // Save data to localStorage
    localStorage.setItem('analysisData', JSON.stringify(newState));

    setBarData(newState.barData);
    setPieData(newState.pieData);
    setLineData(newState.lineData);
    setHeatmapTable(newState.heatmapTable);
    setSummary(newState.summary);
  };

  const chartCards = [
    { key: 'bar', label: 'Bar Chart', icon: <FaChartBar size={40} />, available: barData },
    { key: 'pie', label: 'Pie Chart', icon: <FaChartPie size={40} />, available: pieData },
    { key: 'line', label: 'Line Chart', icon: <FaChartLine size={40} />, available: lineData },
    { key: 'heatmap', label: 'Heatmap', icon: <FaTable size={40} />, available: heatmapTable },
  ];

  return (
    <div className="analysis-container">
      <h2>Car Rally Performance Analysis</h2>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="file-input" />

      {summary && <p>Total Drivers Analyzed: {summary.totalDrivers}</p>}

      {fileUploaded && !selectedChart && (
        <div className="card-selection">
          <h3>Select Analysis to View</h3>
          <div className="cards-container">
            {chartCards.map(card => (
              <div
                key={card.key}
                className={`chart-card ${card.available ? '' : 'disabled'}`}
                onClick={() => card.available && setSelectedChart(card.key)}
              >
                {card.icon}
                <p>{card.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedChart && (
        <div className="chart-section">
          <button className="back-btn" onClick={() => setSelectedChart(null)}>← Back to Selection</button>

          {selectedChart === 'bar' && barData && (
            <>
              <h3>Bar Chart: Total Penalties by Driver</h3>
              <Bar data={barData} />
            </>
          )}

          {selectedChart === 'pie' && pieData && (
            <>
              <h3>Pie Chart: Arrival Status Distribution</h3>
              <Pie data={pieData} />
            </>
          )}

          {selectedChart === 'line' && lineData && (
            <>
              <h3>Line Chart: Time Trend over Stages</h3>
              <Line data={lineData} />
            </>
          )}

          {selectedChart === 'heatmap' && heatmapTable && (
            <>
              <h3>Heatmap: Penalties across Stages</h3>
              <table className="heatmap-table">
                <thead>
                  <tr>
                    <th>Driver</th>
                    <th>TC1 Penalty (min)</th>
                    <th>TC2 Penalty (min)</th>
                  </tr>
                </thead>
                <tbody>
                  {heatmapTable.map((row, index) => (
                    <tr key={index}>
                      <td>{row.driver}</td>
                      <td className={`cell ${row.TC1 > 0 ? 'late' : row.TC1 < 0 ? 'early' : 'ontime'}`}>{row.TC1}</td>
                      <td className={`cell ${row.TC2 > 0 ? 'late' : row.TC2 < 0 ? 'early' : 'ontime'}`}>{row.TC2}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Analysis;
