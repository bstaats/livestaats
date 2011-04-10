if(bs === undefined) var bs = {};

bs.Rescuetime = function(){
  var that        = this,
      now         = new Date();

  // default is just today
  bs.interval     = [new Date(now.getFullYear(),now.getMonth(),now.getDate()),new Date(now.getFullYear(),now.getMonth(),now.getDate()+1)],
  bs.hours        = (bs.interval[1].getTime() - bs.interval[0].getTime()) / (1000*60*60);
  bs.secondsFilter= 300;  // 5min

  var baseurl     = 'https://www.rescuetime.com/anapi/data?format=json&callback=?&key=' +
                    'B63mNzrDeMVC_tMEIo5gBxGyf0eYonYTTRFcfR8s', // please use your own key.. its free
      perspective = '&by=interval',
      resolution  = ['&i=hour','&i=day','&i=week','&i=month'],
      kind        = ["&ty=category","&ty=activity","&ty=productivity","&ty=efficiency"],
      format      = pv.Format.date('%Y-%m-%d'),
      end         = '&re=' + format(bs.interval[1]),
      begin       = '&rb=' + format(bs.interval[0]);

  that.loadWeek   = function(){
    bs.interval     = [new Date(now.getFullYear(),now.getMonth(),now.getDate()-6),new Date(now.getFullYear(),now.getMonth(),now.getDate()+1)],
    bs.hours        = (bs.interval[1].getTime() - bs.interval[0].getTime()) / (1000*60*60);
    begin           = '&rb=' + format(bs.interval[0]);
    var url         = baseurl + perspective + resolution[0] + kind[0] + begin + end;
    bs.secondsFilter= 600;  // 10min

    $('#support span').html('The week of '+pv.Format.date('%b %d %Y')(new Date()));

    d3.json(url, function(json){
      new bs.Arc({
        el: d3.select('#vis'),
        json:json.rows
      });
    });
  }

  that.loadToday  = function(){
    //var url       = baseurl + perspective + resolution[0] + kind[0] + begin + end;
    
    
    
    //d3.json(url, function(json){
/*

      $.getJSON(url, function(dat){console.log(dat);})
        .success(function(d) {console.log("second success", this,d); })
        .error(function(d) { console.log("error", this,d); })
        .complete(function(d) {
          
          console.log("complete", this,d);
          
          
          
          });
        
*/


        
       if(DATA){

         $('#support span').html('Today '+pv.Format.date('%b %d %Y')(new Date()));
         new bs.Arc({
           el: d3.select('#vis'),
           json:DATA.rows
         });
      }
   }
 
}




bs.Arc = function(options){
  var that      = this,
      el        = options.el,
      color     = pv.Colors.category19(),
      width     = el.property('clientWidth'),
      height    = el.property('clientHeight'),
      graph     = {},
      maxy      = -Infinity,
      keys      = [];

  that.render = function(json){
    range2dates = function(d){ return new Date(bs.interval[0].getFullYear(),bs.interval[0].getMonth(),bs.interval[0].getDate(),d)};

    var daterange        = d3.range(bs.hours).map(range2dates),
        ticks            = d3.range(0,bs.hours,2).map(range2dates),
        daterangestrings = daterange.map(function(d){return d.toString()}),

        // pv.Scale and d3.scale does not handle date ticks very well.
        x                = pv.Scale.linear().domain(bs.interval).range(0,width),
        format           = pv.Format.date("%I");

    if(bs.hours>24){
      format = pv.Format.date("%a %d %b");
      ticks  = x.ticks(12);
    }

    var linknest  = d3.nest()
      .key(function(d){ return d[3]; })
      .map(json);

    graph.nodes = daterange.map(function(d){
      return {nodeName:d};
    });

    graph.links = d3.merge(d3.merge(d3.values(linknest).map(function(values){
      return values.map(function(v,i){
        // if there is a second occurance and together is longer secondsFilter
        if(values[i+1] && (v[1]+values[i+1][1]) > bs.secondsFilter){
          var seconds = v[1]+values[i+1][1];
          maxy = Math.max(maxy, seconds);
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

    var vis = new pv.Panel()
        .canvas(el.attr('id'))
        .width(width)
        .height(height)
        .bottom(20);

    var layout = vis.add(pv.Layout.Arc)
        .nodes(graph.nodes)
        .links(graph.links);

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
        .font("18px sans-serif")
        .visible(function(){return this.proto.active() == this.index})
        .text(function(p){return p.group});

    vis.add(pv.Rule)
      .data(ticks)
      .left(x)
      .bottom(-10)
      .height(8)
      .strokeStyle("#444")
      .anchor('bottom').add(pv.Label)
        .textStyle('#444')
        .textBaseline("top")
        .textMargin(0)
        .textAlign(function(){return this.index==0 ? 'left' : this.index==ticks.length-1 ? 'right' : 'center'})
        .text(function(d){return formatedHour(d,this.index)});

    vis.render();

    function formatedHour(d,i){
      if(format(new Date(d))==12 && i==0){
        return format(new Date(d))+'am';
      }else if(format(new Date(d))==12 && i!=0){
        return format(new Date(d))+'pm';
      }else{
        return format(new Date(d));
      }
    }
  }

  that.render(options.json);
}