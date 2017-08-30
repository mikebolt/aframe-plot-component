AFRAME.registerComponent('wavefunctions', {
    init: function() {
        for (var i = -4; i < 5; ++i) {
            for (var j = -4; j < 5; ++j) {
                var plot = document.createElement('a-entity');
                plot.setAttribute('id', 'plot-i' + i + 'j' + j);
                plot.setAttribute('position', '' + (i * 2.5) + ' 0.6 ' + (j * 2.5));
                plot.setAttribute('rotation', '0 90 0');
                plot.setAttribute('plot', 'function: 0.4 * sin(' + i / 2 + ' * pi * x) * sin(' + j / 2 + ' * pi * y); order: 32; bounds: -1 1 -1 1 -1 1;');
                this.el.appendChild(plot);
            }
        }
    }
});