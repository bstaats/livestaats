if(bs === undefined) var bs = {};

bs.Arc = function(options){
  var that = this,
      el   = options.el,
      interval = options.interval,
      color = pv.Colors.category19(),
      width   = el.property('clientWidth'),
      height  = el.property('clientHeight'),
      keys = [];

  that.render = function(json){
    var linknest  = d3.nest()
      .key(function(d){ return d[3]; })
      .map(json.rows);

    graph.nodes = json.rows.map(function(row){
      keys.push(row[0]+'-'+row[3])
      return {nodeName:row[0]+'-'+row[3], group:row[3]};
    });

    graph.links = d3.merge(d3.merge(d3.values(linknest).map(function(values){
      return values.map(function(v,i){
        if(values[i+1]){
          var seconds = v[1]+values[i+1][1];
          maxy = Math.max(maxy, seconds);
          return {source: keys.indexOf(v[0]+'-'+v[3]),
                  target: keys.indexOf(values[i+1][0]+'-'+values[i+1][3]),
                  value:  seconds}
        }else{
          return []
        }
      });
    })));

    var x = d3.scale.linear().domain(interval).range([0,width]);
    var y = d3.scale.linear().domain([1,maxy]).range([2,height/10]);

    var vis = new pv.Panel()
        .canvas(el.attr('id'))
        .width(width)
        .height(height)
        .margin(20)
        .top(0);

    var layout = vis.add(pv.Layout.Arc)
        .nodes(graph.nodes)
        .links(graph.links);

    layout.link.add(pv.Line)
      .def("active", -1)
      .strokeStyle(function(d,l){return color(d.group).alpha(0.75)})
      .lineWidth(function(n,l){return y(l.linkValue)})
      .event("mouseover", function(){return  this.active(this.index).parent})
      .event("mouseout", function(){return  this.active(-1).parent})
      .add(pv.Label)
        .data(function(p){return [{
          group: p.sourceNode.group,
          x: (p.sourceNode.x + p.targetNode.x) / 2,
          y: ((p.sourceNode.x - p.targetNode.x) / 2) + p.sourceNode.y - (y(p.linkValue/2))
        }]})
        .textAlign("center")
        .textBaseline("bottom")
        .textStyle('#fff')
        .visible(function(){return this.proto.active() == this.index})
        .text(function(p){return p.group});


    vis.add(pv.Rule)
      .data(x.ticks(10))
      .left(x)
      .bottom(-10)
      .height(10)
      .strokeStyle("#444")
      .anchor('bottom').add(pv.Label)
        .textStyle('#444')
        .textBaseline("bottom")
        .textMargin(-25)
        .text(function(d){return pv.Format.date("%m")(new Date(d))});


    vis.render();
  }


  that.render(options.json);
}



/*
nodenest  = d3.nest()
  .key(function(d){ return d[0]; })
  .map(json.rows);

      var keys = d3.keys(nodenest);
      graph.nodes = keys.map(function(k,i){
        return {nodeName:k};
      })

      graph.links = d3.merge(d3.merge(d3.values(linknest).map(function(values){
        return values.map(function(v,i){
          if(values[i+1]){
            var seconds = v[1]+values[i+1][1];
            maxy = Math.max(maxy, seconds);

            return {source:keys.indexOf(v[0]),
                    target:keys.indexOf(values[i+1][0]),
                    group: v[3],
                    value:seconds}
          }else{
            return []
          }
        });
      })));
*/



