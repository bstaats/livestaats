if(bs === undefined) var bs = {};

bs.Arc = function(options){
  var that      = this,
      el        = options.el,
      interval  = options.interval,
      color     = pv.Colors.category19(),
      width     = el.property('clientWidth'),
      height    = el.property('clientHeight'),
      keys      = [];

  that.render = function(json){
    var hours = (interval[1].getTime() - interval[0].getTime()) / (1000*60*60);
    var daterange = d3.range(hours).map(function(d){ return new Date(interval[0].getFullYear(),interval[0].getMonth(),interval[0].getDate(),d)});
    var daterangestrings = daterange.map(function(d){return d.toString()});
    var x = d3.scale.linear().domain(interval).range([0,width]);


/*
    var nodenest  = d3.nest()
      .key(function(d){ return d[0]; })
      .map(json.rows);
*/

    var linknest  = d3.nest()
      .key(function(d){ return d[3]; })
      .map(json.rows);

/*
    var keys = d3.keys(nodenest);
    graph.nodes = keys.map(function(k,i){
      return {nodeName:k};
    })
*/
    graph.nodes = daterange.map(function(d){
      return {nodeName:d};      
    });


    graph.links = d3.merge(d3.merge(d3.values(linknest).map(function(values){
      return values.map(function(v,i){
        // if there is a second occurance and together is longer than a min
        if(values[i+1] && (v[1]+values[i+1][1])>(60)){
          console.log(v)
          var seconds = v[1]+values[i+1][1];
          maxy = Math.max(maxy, seconds);
//console.log(v[0],values[i+1][0], daterangestrings.indexOf(new Date(v[0]).toString()),daterangestrings.indexOf(new Date(values[i+1][0]).toString()));
          return {source:daterangestrings.indexOf(new Date(v[0]).toString()),
                  target:daterangestrings.indexOf(new Date(values[i+1][0]).toString()),
                  group: v[3],
                  value:seconds}
        }else{
          return []
        }
      });
    })));
    
    var y = d3.scale.linear().domain([1,maxy]).range([2,height/10]);
/*
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
*/


    var vis = new pv.Panel()
        .canvas(el.attr('id'))
        .width(width)
        .height(height)
        .margin(20)
        .top(0);

    var layout = vis.add(pv.Layout.Arc)
        .nodes(graph.nodes)
        .links(graph.links);

/*
    layout.node.add(pv.Dot)
      .fillStyle(pv.Colors.category19().by(function(d){return d.group}))
      .strokeStyle(function(){return this.fillStyle().darker()});
*/
      
    layout.link.add(pv.Line)
      .def("active", -1)
      .strokeStyle(function(d,l){return color(l.group).alpha(0.75)})
      .lineWidth(function(n,l){return y(l.linkValue)})
      .event("mouseover", function(){return  this.active(this.index).parent})
      .event("mouseout", function(){return  this.active(-1).parent})
      .add(pv.Label)
        .data(function(p){return [{
          group: p.group,
          x: (p.sourceNode.x + p.targetNode.x) / 2,
          y: ((p.sourceNode.x - p.targetNode.x) / 2) + p.sourceNode.y - (y(p.linkValue/2))
        }]})
        .textAlign("center")
        .textBaseline("bottom")
        .textStyle('#fff')
        .visible(function(){return this.proto.active() == this.index})
        .text(function(p){return p.group});


    vis.add(pv.Rule)
      .data(x.ticks(12))
      .left(x)
      .bottom(-10)
      .height(8)
      .strokeStyle("#444")
      .anchor('bottom').add(pv.Label)
        .textStyle('#444')
        .textBaseline("top")
        .textMargin(0)
        .text(function(d){return pv.Format.date("%I")(new Date(d))});


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



