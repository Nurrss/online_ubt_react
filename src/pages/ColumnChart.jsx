import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto'; // Import Chart from the 'chart.js/auto' module

export const ColumnChart = ({ data }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');

    // Sort the data by overallScore in descending order and take the top 10
    const top10Students = data.sort((a, b) => b.overallScore - a.overallScore).slice(0, 10);

    const myChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: top10Students.map(
          (student) => `${student.student.name} ${student.student.surname}`
        ),
        datasets: [
          {
            data: top10Students.map((student) => student.overallScore),
            backgroundColor: '#009172',
            borderWidth: 1
          }
        ]
      },
      options: {
        indexAxis: 'y',
        scales: {
          x: {
            beginAtZero: true,
            max: 140
          },
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            display: false // Hide the legend
          },
          datalabels: {
            anchor: 'end', // Position the label at the end of the bar
            align: 'end',
            color: '#fff', // Label color
            offset: 4, // Distance from the end of the bar
            formatter: (value) => value // Display the value
          }
        }
      }
    });

    // Clean up the chart when the component unmounts
    return () => {
      myChart.destroy();
    };
  }, [data]); // Dependency array now includes data to re-render chart when data changes

  return (
    <div>
      <canvas id="myChart" ref={chartRef}></canvas>
    </div>
  );
};
