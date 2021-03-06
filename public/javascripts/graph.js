var graphData = {
  labels: ['A', 'B', 'C', 'D','E'],
  datasets: [
    {
      label: 'My First dataset',
      fillColor: 'rgba(32,89,127,0.5)',
      strokeColor: 'rgba(220,220,220,0.8)',
      highlightFill: 'rgba(220,220,220,0.75)',
      highlightStroke: 'rgba(220,220,220,1)',
      data: [0, 0, 0, 0, 0]
    }
  ]
};

/**
 * Contains definition of the graph class for pulls
 */
function Graph() {
  this.hasGraph = false;
  this.originalHeight;
  this.originaWidth;
}

Graph.prototype.createGraph = function (canvas) {

  this.canvas = canvas;
  var options = {
    responsive: true,
    maintainAspectRatio: false
  };
  this.originalHeight = canvas.canvas.height;
  this.originalWidth = canvas.canvas.width;
  this.graph = new Chart(canvas).Bar(graphData, options);
  this.hasGraph = true;
}

Graph.prototype.refresh = function () {
  if(this.hasGraph){
    this.graph.destroy();
    delete this.graph;
    this.hasGraph = false;
  }
  var canvas = this.canvas;
  canvas.height = this.originalHeight;
  canvas.width = this.originalWidth;
  var options = {
    responsive: false,
    maintainAspectRatio: true
  };
  this.graph = new Chart(canvas).Bar(graphData, options);
  this.hasGraph = true;
  this.graph.update();
}

Graph.prototype.update = function () {
  if (this.hasGraph)
    this.graph.update();
}

Graph.prototype.updateData = function (data) {
  for (var key in data) {
    this.updateValue(key, data[key]);
  }
}

Graph.prototype.clearData = function () {
  // Can not clear graph if you do not have one
  if (this.hasGraph) {
    var bars = this.graph.datasets[0].bars;
    for (var bar in bars) {
      bars[bar].value = 0;
    }
    this.update();
  }
  graphData.datasets[0].data = [0, 0, 0, 0, 0];
}

Graph.prototype.updateValue = function (key, value) {
  var labels = graphData.labels;
  var index = labels.indexOf(key);
  if (this.hasGraph)
    this.graph.datasets[0].bars[index].value = value;

  graphData.datasets[0].data[index] = value;
}
