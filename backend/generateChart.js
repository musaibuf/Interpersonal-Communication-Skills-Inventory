const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

const generateChartImage = async (scores) => {
  const width = 500; // px
  const height = 450; // px
  const backgroundColour = 'white';
  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour });

  const configuration = {
    type: 'radar',
    data: {
      labels: [
        ['Sending Clear', 'Messages'],
        'Listening',
        ['Giving & Getting', 'Feedback'],
        ['Handling', 'Emotional', 'Interactions'],
      ],
      datasets: [{
        data: [scores.section1, scores.section2, scores.section3, scores.section4],
        backgroundColor: 'rgba(245, 124, 0, 0.4)',
        borderColor: '#F57C00',
        borderWidth: 2,
        pointBackgroundColor: '#F57C00',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#F57C00',
        pointRadius: 5,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          angleLines: { color: 'rgba(0, 0, 0, 0.1)' },
          grid: { color: 'rgba(0, 0, 0, 0.1)' },
          suggestedMin: 0,
          suggestedMax: 30,
          ticks: {
            stepSize: 10,
            backdropColor: 'transparent',
            color: 'rgba(0, 0, 0, 0.5)',
          },
          pointLabels: {
            font: { size: 14 }, // Slightly larger for clarity in an image
            color: '#34495e',
          },
        },
      },
      plugins: {
        legend: { display: false },
      },
    },
  };

  const image = await chartJSNodeCanvas.renderToDataURL(configuration);
  return image; // Returns the Base64 image string
};

module.exports = { generateChartImage };