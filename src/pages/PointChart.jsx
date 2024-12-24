import React, { useRef, useEffect } from 'react';
import Chart from 'chart.js/auto';

export const PointChart = ({ chartData }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');

    const myChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.map((data, index) => index + 1), // Assuming studentId as the label, change if needed
        datasets: [
          {
            label: 'Points',
            data: chartData.map((data, index) => ({ x: index + 1, y: data.overallPoints })),
            backgroundColor: '#009172',
            borderColor: '#009172',
            borderWidth: 2,
            showLine: false,
            pointRadius: 10,
            pointBackgroundColor: '#009172',
            pointBorderColor: '#fff',
            pointHoverRadius: 15
          }
        ]
      },
      options: {
        scales: {
          x: {
            type: 'category',
            beginAtZero: true
          },
          y: {
            beginAtZero: true,
            max: 140
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: false
          }
        }
      }
    });

    return () => {
      myChart.destroy();
    };
  }, [chartData]);

  return (
    <div style={{ width: '100%' }}>
      <canvas id="myChart" ref={chartRef}></canvas>
    </div>
  );
};
