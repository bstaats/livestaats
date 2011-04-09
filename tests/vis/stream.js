    d3.json('data2.js', function(json){

      var volumes = [],
          dates = pv.uniq(json.rows.map(function(r){
            volumes.push(r[1]);
            return r[0];
          })),
          sparsenest  = d3.nest()
            .key(function(d){ return d[3]; })
            .key(function(d){ return d[0]; })
            .rollup(function(a){return a.map(function(d){return {x:new Date(d[0]), y:d[1]}; });})
            .map(json.rows),
          fullnest  = {};

      d3.keys(sparsenest).forEach(function(k){
        fullnest[k] = dates.map(function(d){
          if(!sparsenest[k][d]){
            return {x:new Date(d), y:0};
          }else{
            return sparsenest[k][d][0];
          }
        });
      });

      dates = dates.map(function(d){return new Date(d)});
      dates.sort(d3.ascending)

      var m       = dates.length,
          data    = d3.layout.stack().offset("wiggle")(d3.values(fullnest)),
          color   = d3.interpolateRgb("#aad", "#556"),
          mx      = m - 1,
          my      = d3.max(data, function(d) {
                      return d3.max(d, function(d) {
                        return d.y0 + d.y;
                      });
                    }),
          x       = d3.scale.linear().domain([dates[0],dates[dates.length-1]]).range([0,w]),
          y       = d3.scale.linear().domain([0,my]).range([0,h]);


/*
      var area = d3.svg.area()
        .x(function(d) { return x(d.x) * w / mx; })
        .y0(function(d) { return h - y(d.y0) * h / my; })
        .y1(function(d) { return h - (y(d.y) + y(d.y0)) * h / my; });
*/
      var area = d3.svg.area().interpolate("basis")
        .x(function(d) { return x(d.x); })
        .y0(function(d) { return h - d.y0 * h / my; })
        .y1(function(d) { return h - (d.y + d.y0) * h / my; });
       // .y0(function(d) { return y(d.y); })
       // .y1(function(d) { return y(d.y0); });

      var vis = d3.select("#vis")
        .append("svg:svg")
          .attr("width", w)
          .attr("height", h);

      vis.selectAll("path")
          .data(data)
        .enter().append("svg:path")
          .attr("fill", function() { return color(Math.random()); })
          .attr("d", area);


    });