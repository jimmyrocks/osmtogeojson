if (typeof require !== "undefined") {
  var expect = require("expect.js");
  var DOMParser = require("xmldom").DOMParser;
  var osmtogeojson = require("../");
}

describe("osm (xml)", function () {

  it('blank osm', function() {
    var xml = "<osm></osm>";
    xml = (new DOMParser()).parseFromString(xml, 'text/xml');

    expect(osmtogeojson.toGeojson(xml)).to.eql({
      type: 'FeatureCollection',
      features: []
    });
  });

  it('node', function() {
    var xml, geojson;

    xml = "<osm><node id='1' lat='1.234' lon='4.321' /></osm>";
    xml = (new DOMParser()).parseFromString(xml, 'text/xml');
    geojson = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          id: "node/1",
          properties: {
            type: "node",
            id: 1,
            tags: {},
            relations: [],
            meta: {}
          },
          geometry: {
            type: "Point",
            coordinates: [4.321, 1.234]
          }
        }
      ]
    };

    expect(osmtogeojson.toGeojson(xml)).to.eql(geojson);
  });

  it('way', function() {
    var xml, geojson;

    xml = "<osm><way id='1'><nd ref='2' /><nd ref='3' /><nd ref='4' /></way><node id='2' lat='0.0' lon='1.0' /><node id='3' lat='0.0' lon='1.1' /><node id='4' lat='0.1' lon='1.2' /></osm>";
    xml = (new DOMParser()).parseFromString(xml, 'text/xml');
    geojson = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          id: "way/1",
          properties: {
            type: "way",
            id: 1,
            tags: {},
            relations: [],
            meta: {}
          },
          geometry: {
            type: "LineString",
            coordinates: [
              [1.0,0.0],
              [1.1,0.0],
              [1.2,0.1],
            ]
          }
        }
      ]
    };

    expect(osmtogeojson.toGeojson(xml)).to.eql(geojson);
  });

  it('relation', function() {
    var xml, geojson;

    xml = "<osm><relation id='1'><tag k='type' v='multipolygon' /><member type='way' ref='2' role='outer' /><member type='way' ref='3' role='inner' /></relation><way id='2'><tag k='area' v='yes' /><nd ref='4' /><nd ref='5' /><nd ref='6' /><nd ref='7' /><nd ref='4' /></way><way id='3'><nd ref='8' /><nd ref='9' /><nd ref='10' /><nd ref='8' /></way><node id='4' lat='-1.0' lon='-1.0' /><node id='5' lat='-1.0' lon='1.0' /><node id='6' lat='1.0' lon='1.0' /><node id='7' lat='1.0' lon='-1.0' /><node id='8' lat='-0.5' lon='0.0' /><node id='9' lat='0.5' lon='0.0' /><node id='10' lat='0.0' lon='0.5' /></osm>";
    xml = (new DOMParser()).parseFromString(xml, 'text/xml');
    
    geojson = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          id: "way/2",
          properties: {
            type: "way",
            id: 2,
            tags: {"area":"yes"},
            relations: [
              {
                rel: 1,
                role: "outer",
                reltags: {"type":"multipolygon"}
              }
            ],
            meta: {}
          },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [-1.0,-1.0],
              [ 1.0,-1.0],
              [ 1.0, 1.0],
              [-1.0, 1.0],
              [-1.0,-1.0],
            ],[
              [0.0,-0.5],
              [0.0, 0.5],
              [0.5, 0.0],
              [0.0,-0.5]
            ]]
          }
        }
      ]
    };

    expect(osmtogeojson.toGeojson(xml)).to.eql(geojson);
  });


});

describe("osm (json)", function () {
  // check overpass*2geoJSON methods
  it("node", function () {
    var json, geojson;
    json = {
      elements: [
        {
          type: "node",
          id:   1,
          lat:  1.234,
          lon:  4.321
        }
      ]
    };
    geojson = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          id: "node/1",
          properties: {
            type: "node",
            id: 1,
            tags: {},
            relations: [],
            meta: {}
          },
          geometry: {
            type: "Point",
            coordinates: [4.321, 1.234]
          }
        }
      ]
    };
    var result = osmtogeojson.toGeojson(json);
    expect(result).to.eql(geojson);
  });
  it("way", function () {
    var json, geojson;
    json = {
      elements: [
        {
          type:  "way",
          id:    1,
          nodes: [2,3,4]
        },
        {
          type: "node",
          id:   2,
          lat:  0.0,
          lon:  1.0
        },
        {
          type: "node",
          id:   3,
          lat:  0.0,
          lon:  1.1
        },
        {
          type: "node",
          id:   4,
          lat:  0.1,
          lon:  1.2
        }
      ]
    };
    geojson = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          id: "way/1",
          properties: {
            type: "way",
            id: 1,
            tags: {},
            relations: [],
            meta: {}
          },
          geometry: {
            type: "LineString",
            coordinates: [
              [1.0,0.0],
              [1.1,0.0],
              [1.2,0.1],
            ]
          }
        }
      ]
    };
    var result = osmtogeojson.toGeojson(json);
    expect(result).to.eql(geojson);
  });
  it("polygon", function () {
    var json, geojson;
    json = {
      elements: [
        {
          type:  "way",
          id:    1,
          nodes: [2,3,4,5,2],
          tags:  {area: "yes"}
        },
        {
          type: "node",
          id:   2,
          lat:  0.0,
          lon:  0.0
        },
        {
          type: "node",
          id:   3,
          lat:  0.0,
          lon:  1.0
        },
        {
          type: "node",
          id:   4,
          lat:  1.0,
          lon:  1.0
        },
        {
          type: "node",
          id:   5,
          lat:  1.0,
          lon:  0.0
        }
      ]
    };
    geojson = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          id: "way/1",
          properties: {
            type: "way",
            id: 1,
            tags: {area: "yes"},
            relations: [],
            meta: {}
          },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [0.0,0.0],
              [1.0,0.0],
              [1.0,1.0],
              [0.0,1.0],
              [0.0,0.0],
            ]]
          }
        }
      ]
    };
    var result = osmtogeojson.toGeojson(json);
    expect(result).to.eql(geojson);
  });
  it("simple multipolygon", function () {
    var json, geojson;
    json = {
      elements: [
        {
          type:    "relation",
          id:      1,
          tags:    {"type":"multipolygon"},
          members: [
            {
              type: "way",
              ref:  2,
              role: "outer"
            },
            {
              type: "way",
              ref:  3,
              role: "inner"
            }
          ]
        },
        {
          type:  "way",
          id:    2,
          nodes: [4,5,6,7,4],
          tags:  {"area":"yes"},
        },
        {
          type:  "way",
          id:    3,
          nodes: [8,9,10,8]
        },
        {
          type: "node",
          id:   4,
          lat: -1.0,
          lon: -1.0
        },
        {
          type: "node",
          id:   5,
          lat: -1.0,
          lon:  1.0
        },
        {
          type: "node",
          id:   6,
          lat:  1.0,
          lon:  1.0
        },
        {
          type: "node",
          id:   7,
          lat:  1.0,
          lon: -1.0
        },
        {
          type: "node",
          id:   8,
          lat: -0.5,
          lon:  0.0
        },
        {
          type: "node",
          id:   9,
          lat:  0.5,
          lon:  0.0
        },
        {
          type: "node",
          id:   10,
          lat:  0.0,
          lon:  0.5
        }
      ]
    };
    geojson = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          id: "way/2",
          properties: {
            type: "way",
            id: 2,
            tags: {"area":"yes"},
            relations: [
              {
                rel: 1,
                role: "outer",
                reltags: {"type":"multipolygon"}
              }
            ],
            meta: {}
          },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [-1.0,-1.0],
              [ 1.0,-1.0],
              [ 1.0, 1.0],
              [-1.0, 1.0],
              [-1.0,-1.0],
            ],[
              [0.0,-0.5],
              [0.0, 0.5],
              [0.5, 0.0],
              [0.0,-0.5]
            ]]
          }
        }
      ]
    };
    var result = osmtogeojson.toGeojson(json);
    expect(result).to.eql(geojson);
  });
  it("multipolygon", function () {
    var json, geojson;
    json = {
      elements: [
        {
          type:    "relation",
          id:      1,
          tags:    {"type":"multipolygon", "building":"yes"},
          members: [
            {
              type: "way",
              ref:  2,
              role: "outer"
            },
            {
              type: "way",
              ref:  3,
              role: "inner"
            },
            {
              type: "way",
              ref:  4,
              role: "inner"
            },
            {
              type: "way",
              ref:  5,
              role: "outer"
            }
          ]
        },
        {
          type:  "way",
          id:    2,
          nodes: [4,5,6,7,4],
          tags:  {"building":"yes"}
        },
        {
          type:  "way",
          id:    3,
          nodes: [8,9,10,8],
          tags:  {"area":"yes"}
        },
        {
          type:  "way",
          id:    4,
          nodes: [11,12,13,11],
          tags:  {"barrier":"fence"}
        },
        {
          type:  "way",
          id:    5,
          nodes: [14,15,16,14],
          tags:  {"building":"yes", "area":"yes"}
        },
        {
          type: "node",
          id:   4,
          lat: -1.0,
          lon: -1.0
        },
        {
          type: "node",
          id:   5,
          lat: -1.0,
          lon:  1.0
        },
        {
          type: "node",
          id:   6,
          lat:  1.0,
          lon:  1.0
        },
        {
          type: "node",
          id:   7,
          lat:  1.0,
          lon: -1.0
        },
        {
          type: "node",
          id:   8,
          lat: -0.5,
          lon:  0.0
        },
        {
          type: "node",
          id:   9,
          lat:  0.5,
          lon:  0.0
        },
        {
          type: "node",
          id:   10,
          lat:  0.0,
          lon:  0.5
        },
        {
          type: "node",
          id:   11,
          lat:  0.1,
          lon:  -0.1
        },
        {
          type: "node",
          id:   12,
          lat:  -0.1,
          lon:  -0.1
        },
        {
          type: "node",
          id:   13,
          lat:  0.0,
          lon:  -0.2
        },
        {
          type: "node",
          id:   14,
          lat:  0.1,
          lon:  -1.1
        },
        {
          type: "node",
          id:   15,
          lat:  -0.1,
          lon:  -1.1
        },
        {
          type: "node",
          id:   16,
          lat:  0.0,
          lon:  -1.2
        }
      ]
    };
    geojson = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          id: "relation/1",
          properties: {
            type: "relation",
            id: 1,
            tags: {"type":"multipolygon","building":"yes"},
            relations: [],
            meta: {}
          },
          geometry: {
            type: "MultiPolygon",
            coordinates: [[[
              [-1.1, 0.1],
              [-1.1,-0.1],
              [-1.2, 0.0],
              [-1.1, 0.1]
            ]],
            [[
              [-1.0,-1.0],
              [ 1.0,-1.0],
              [ 1.0, 1.0],
              [-1.0, 1.0],
              [-1.0,-1.0],
            ],[
              [-0.1, 0.1],
              [-0.1,-0.1],
              [-0.2, 0.0],
              [-0.1, 0.1]
            ],[
              [0.0,-0.5],
              [0.0, 0.5],
              [0.5, 0.0],
              [0.0,-0.5]
            ]]]
          }
        },
        {
          type: "Feature",
          id: "way/3",
          properties: {
            type: "way",
            id: 3,
            tags: {"area":"yes"},
            relations: [
              {
                rel: 1,
                role: "inner",
                reltags: {"type":"multipolygon","building":"yes"}
              }
            ],
            meta: {},
          },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [0.0,-0.5],
              [0.0, 0.5],
              [0.5, 0.0],
              [0.0,-0.5]
            ]]
          }
        }, 
        {
          type: "Feature",
          id: "way/5",
          properties: {
            type: "way",
            id: 5,
            tags: {"building":"yes", "area":"yes"},
            relations: [
              {
                rel: 1,
                role: "outer",
                reltags: {"type":"multipolygon","building":"yes"}
              }
            ],
            meta: {},
          },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [-1.1, 0.1],
              [-1.1,-0.1],
              [-1.2, 0.0],
              [-1.1, 0.1]
            ]]
          }
        },
        {
          type: "Feature",
          id: "way/4",
          properties: {
            type: "way",
            id: 4,
            tags: {"barrier":"fence"},
            relations: [
              {
                rel: 1,
                role: "inner",
                reltags: {"type":"multipolygon","building":"yes"}
              }
            ],
            meta: {},
          },
          geometry: {
            type: "LineString",
            coordinates: [
              [-0.1, 0.1],
              [-0.1,-0.1],
              [-0.2, 0.0],
              [-0.1, 0.1]
            ]
          }
        }
      ]
    };
    var result = osmtogeojson.toGeojson(json);
    expect(result).to.eql(geojson);
  });
  // tags & pois
  it("tags: ways and nodes / pois", function () {
    var json, geojson;
    json = {
      elements: [
        {
          type:  "way",
          id:    1,
          nodes: [2,3,4],
          tags:  {"foo":"bar"}
        },
        {
          type: "node",
          id:   2,
          lat:  0.0,
          lon:  1.0
        },
        {
          type: "node",
          id:   3,
          lat:  0.0,
          lon:  1.1,
          tags: {"asd":"fasd"}
        },
        {
          type: "node",
          id:   4,
          lat:  0.1,
          lon:  1.2,
          tags: {"created_by":"me"}
        },
        {
          type: "node",
          id:   5,
          lat:  0.0,
          lon:  0.0
        }
      ]
    };
    geojson = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          id: "way/1",
          properties: {
            type: "way",
            id: 1,
            tags: {"foo":"bar"},
            relations: [],
            meta: {}
          },
          geometry: {
            type: "LineString",
            coordinates: [
              [1.0,0.0],
              [1.1,0.0],
              [1.2,0.1],
            ]
          }
        },
        {
          type: "Feature",
          id: "node/3",
          properties: {
            type: "node",
            id: 3,
            tags: {"asd":"fasd"},
            relations: [],
            meta: {}
          },
          geometry: {
            type: "Point",
            coordinates: [1.1,0.0]
          }
        },
        {
          type: "Feature",
          id: "node/5",
          properties: {
            type: "node",
            id: 5,
            tags: {},
            relations: [],
            meta: {}
          },
          geometry: {
            type: "Point",
            coordinates: [0.0,0.0]
          }
        }
      ]
    };
    var result = osmtogeojson.toGeojson(json);
    expect(result).to.eql(geojson);
  });
  // invalid one-node-ways
  it("one-node-ways", function () {
    var json, result;
    json = {
      elements: [
        {
          type:  "way",
          id:    1,
          nodes: [2],
          tags:  {"foo":"bar"}
        },
        {
          type: "node",
          id:   2,
          lat:  0.0,
          lon:  0.0
        }
      ]
    };
    result = osmtogeojson.toGeojson(json);
    expect(result.features).to.have.length(0);
  });
  // invalid empty multipolygon
  it("empty multipolygon", function () {
    var json, result;
    // empty multipolygon
    json = {
      elements: [
        {
          type: "relation",
          id:   1,
          tags: {"type":"multipolygon"}
        }
      ]
    };
    result = osmtogeojson.toGeojson(json);
    expect(result.features).to.have.length(0);
  });
  // relations
  it("relations and id-spaces", function () {
    var json, geojson;
    json = {
      elements: [
        {
          type:  "way",
          id:    1,
          tags:  {"foo":"bar"},
          nodes: [1,2,3]
        },
        {
          type:  "way",
          id:    2,
          nodes: [3,1]
        },
        {
          type: "node",
          id:   1,
          lat:  1.0,
          lon:  1.0
        },
        {
          type: "node",
          id:   2,
          lat:  2.0,
          lon:  2.0
        },
        {
          type: "node",
          id:   3,
          lat:  1.0,
          lon:  2.0
        },
        {
          type:    "relation",
          id:      1,
          tags:    {"foo":"bar"},
          members: [
            {
              type: "way",
              ref:  1,
              role: "asd"
            },
            {
              type: "node",
              ref:  1,
              role: "fasd"
            },
            {
              type: "relation",
              ref:  2,
              role: ""
            }
          ]
        },
        {
          type:    "relation",
          id:      2,
          tags:    {"type":"multipolygon"},
          members: [
            {
              type: "way",
              ref:  1,
              role: "outer"
            },
            {
              type: "way",
              ref:  2,
              role: "outer"
            }
          ]
        }
      ]
    };
    geojson = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          id: "relation/2",
          properties: {
            type: "relation",
            id: 2,
            tags: {"type":"multipolygon"},
            relations: [
              {
                rel: 1,
                role: "",
                reltags: {"foo":"bar"}
              }
            ],
            meta: {}
          },
          geometry: {
            type: "MultiPolygon",
            coordinates: [[[
              [2.0,1.0],
              [1.0,1.0],
              [2.0,2.0],
              [2.0,1.0]
            ]]]
          }
        },
        {
          type: "Feature",
          id: "way/1",
          properties: {
            type: "way",
            id: 1,
            tags: {"foo":"bar"},
            relations: [
              {
                rel: 1,
                role: "asd",
                reltags: {"foo":"bar"}
              },
              {
                rel: 2,
                role: "outer",
                reltags: {"type":"multipolygon"}
              }
            ],
            meta: {}
          },
          geometry: {
            type: "LineString",
            coordinates: [
              [1.0,1.0],
              [2.0,2.0],
              [2.0,1.0]
            ]
          }
        },
        {
          type: "Feature",
          id: "node/1",
          properties: {
            type: "node",
            id: 1,
            tags: {},
            relations: [
              {
                rel: 1,
                role: "fasd",
                reltags: {"foo":"bar"}
              }
            ],
            meta: {}
          },
          geometry: {
            type: "Point",
            coordinates: [1.0,1.0]
          }
        }
      ]
    };
    var result = osmtogeojson.toGeojson(json);
    expect(result).to.eql(geojson);
  });
  // meta info // todo +lines, +polygons
  it("meta data", function () {
    var json, geojson, result;
    // node with meta data
    json = {
      elements: [
        {
          type: "node",
          id:   1,
          lat:  1.234,
          lon:  4.321,
          timestamp: "2013-01-13T22:56:07Z",
          version:   7,
          changeset: 1234,
          user:      "johndoe",
          uid:       666
        }
      ]
    };
    geojson = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          id: "node/1",
          properties: {
            type: "node",
            id: 1,
            tags: {},
            relations: [],
            meta: {
              timestamp: "2013-01-13T22:56:07Z",
              version:   7,
              changeset: 1234,
              user:      "johndoe",
              uid:       666
            }
          },
          geometry: {
            type: "Point",
            coordinates: [4.321, 1.234]
          }
        }
      ]
    };
    result = osmtogeojson.toGeojson(json);
    expect(result).to.eql(geojson);
    // ways and relsvar json, geojson;
    json = {
      elements: [
        {
          type: "node",
          id:   1,
          lat:  1.234,
          lon:  4.321,
          tags: {"amenity": "yes"},
          user: "johndoe",
        },
        {
          type: "way",
          id:   1,
          tags: {"highway": "road"},
          user: "johndoe",
          nodes: [1,1,1,1]
        },
        {
          type: "relation",
          id:   1,
          tags: {"type": "multipolygon"},
          user: "johndoe",
          members: [{type:"way",ref:1,role:"outer"},{type:"way",ref:1,role:"outer"}]
        },
        {
          type: "way",
          id:   2,
          tags: {"highway": "road"},
          user: "johndoe",
          nodes: [1,1,1,1]
        },
        {
          type: "relation",
          id:   2,
          tags: {"type": "multipolygon"},
          user: "johndoe",
          members: [{type:"way",ref:2,role:"outer"}]
        }
      ]
    };
    result = osmtogeojson.toGeojson(json);
    expect(result.features).to.have.length(4);
    expect(result.features[0].properties.meta).to.have.property("user");
    expect(result.features[1].properties.meta).to.have.property("user");
    expect(result.features[2].properties.meta).to.have.property("user");
    expect(result.features[3].properties.meta).to.have.property("user");
  });
  // multipolygon detection corner case
  // see https://github.com/tyrasd/osmtogeojson/issues/7
  it("multipolygon: outer way tagging", function () {
    var json;
    json = {
      elements: [
        {
          type:    "relation",
          id:      1,
          tags:    {"type":"multipolygon", "amenity":"xxx"},
          members: [
            {
              type: "way",
              ref:  2,
              role: "outer"
            },
            {
              type: "way",
              ref:  3,
              role: "inner"
            }
          ]
        },
        {
          type:  "way",
          id:    2,
          nodes: [4,5,6,7,4],
          tags:  {"amenity":"yyy"}
        },
        {
          type:  "way",
          id:    3,
          nodes: [8,9,10,8]
        },
        {
          type: "node",
          id:   4,
          lat: -1.0,
          lon: -1.0
        },
        {
          type: "node",
          id:   5,
          lat: -1.0,
          lon:  1.0
        },
        {
          type: "node",
          id:   6,
          lat:  1.0,
          lon:  1.0
        },
        {
          type: "node",
          id:   7,
          lat:  1.0,
          lon: -1.0
        },
        {
          type: "node",
          id:   8,
          lat: -0.5,
          lon:  0.0
        },
        {
          type: "node",
          id:   9,
          lat:  0.5,
          lon:  0.0
        },
        {
          type: "node",
          id:   10,
          lat:  0.0,
          lon:  0.5
        }
      ]
    };
    var result = osmtogeojson.toGeojson(json);
    expect(result.features).to.have.length(2);
    expect(_.pluck(_.pluck(result.features,"properties"),"id")).to.eql([1,2]);
    expect(result.features[0].properties.id).to.eql(1);
    expect(result.features[1].properties.id).to.eql(2);
  });
  // non-matching inner and outer rings
  it("multipolygon: non-matching inner and outer rings", function() {
    // complex multipolygon
    json = {
      elements: [
        {
          type: "relation",
          tags: {"type": "multipolygon"},
          id:   1,
          members: [
            {
              type: "way",
              ref:  2,
              role: "outer"
            },
            {
              type: "way",
              ref:  -1,
              role: "outer"
            },
            {
              type: "way",
              ref:  3,
              role: "inner"
            }
          ]
        },
        {
          type: "way",
          id:   2,
          nodes: [4,5,6,7,4]
        },
        {
          type: "node",
          id:   4,
          lat:  0.0,
          lon:  0.0
        },
        {
          type: "node",
          id:   5,
          lat:  1.0,
          lon:  0.0
        },
        {
          type: "node",
          id:   6,
          lat:  1.0,
          lon:  1.0
        },
        {
          type: "node",
          id:   7,
          lat:  0.0,
          lon:  1.0
        },
        {
          type: "way",
          id:   3,
          nodes: [8,9,10,8]
        },
        {
          type: "node",
          id:   8,
          lat:  3.0,
          lon:  3.0
        },
        {
          type: "node",
          id:   9,
          lat:  4.0,
          lon:  3.0
        },
        {
          type: "node",
          id:   10,
          lat:  3.0,
          lon:  4.0
        }
      ]
    };
    result = osmtogeojson.toGeojson(json);
    expect(result.features).to.have.length(1);
    expect(result.features[0].properties.id).to.equal(1);
    expect(result.features[0].geometry.type).to.equal("MultiPolygon");
    expect(result.features[0].geometry.coordinates).to.have.length(1);
    expect(result.features[0].geometry.coordinates[0]).to.have.length(1);
    /*
    // simple multipolygon
    json = {
      elements: [
        {
          type: "relation",
          tags: {"type": "multipolygon"},
          id:   1,
          members: [
            {
              type: "way",
              ref:  2,
              role: "outer"
            },
            {
              type: "way",
              ref:  3,
              role: "inner"
            }
          ]
        },
        {
          type: "way",
          id:   2,
          nodes: [4,5,6,7,4]
        },
        {
          type: "node",
          id:   4,
          lat:  0.0,
          lon:  0.0
        },
        {
          type: "node",
          id:   5,
          lat:  1.0,
          lon:  0.0
        },
        {
          type: "node",
          id:   6,
          lat:  1.0,
          lon:  1.0
        },
        {
          type: "node",
          id:   7,
          lat:  0.0,
          lon:  1.0
        },
        {
          type: "way",
          id:   3,
          nodes: [8,9,10,8]
        },
        {
          type: "node",
          id:   8,
          lat:  3.0,
          lon:  3.0
        },
        {
          type: "node",
          id:   9,
          lat:  4.0,
          lon:  3.0
        },
        {
          type: "node",
          id:   10,
          lat:  3.0,
          lon:  4.0
        }
      ]
    };
    result = osmtogeojson.toGeojson(json);
    expect(result.features).to.have.length(1);
    expect(result.features[0].properties.id).to.equal(2);
    expect(result.features[0].geometry.type).to.equal("Polygon");
    expect(result.features[0].geometry.coordinates).to.have.length(1);
    expect(result.features[0].geometry.coordinates[0]).to.have.length(1);
    */
  });
  // non-trivial ring building (way order and direction)
  it("multipolygon: non-trivial ring building", function() {
    // way order
    json = {
      elements: [
        {
          type: "relation",
          tags: {"type": "multipolygon"},
          id:   1,
          members: [
            {
              type: "way",
              ref:  1,
              role: "outer"
            },
            {
              type: "way",
              ref:  3,
              role: "outer"
            },
            {
              type: "way",
              ref:  2,
              role: "outer"
            }
          ]
        },
        {
          type: "way",
          id:   1,
          nodes: [1,2]
        },
        {
          type: "way",
          id:   2,
          nodes: [2,3]
        },
        {
          type: "way",
          id:   3,
          nodes: [3,1]
        },
        {
          type: "node",
          id:   1,
          lat:  1.0,
          lon:  0.0
        },
        {
          type: "node",
          id:   2,
          lat:  2.0,
          lon:  0.0
        },
        {
          type: "node",
          id:   3,
          lat:  3.0,
          lon:  0.0
        }
      ]
    };
    result = osmtogeojson.toGeojson(json);
    expect(result.features).to.have.length(1);
    expect(result.features[0].properties.id).to.equal(1);
    expect(result.features[0].geometry.type).to.equal("MultiPolygon");
    expect(result.features[0].geometry.coordinates).to.have.length(1);
    expect(result.features[0].geometry.coordinates[0]).to.have.length(1);
    expect(result.features[0].geometry.coordinates[0][0]).to.have.length(4);
    // way directions
    json = {
      elements: [
        {
          type: "relation",
          tags: {"type": "multipolygon"},
          id:   1,
          members: [
            {
              type: "way",
              ref:  1,
              role: "outer"
            },
            {
              type: "way",
              ref:  2,
              role: "outer"
            },
            {
              type: "way",
              ref:  3,
              role: "outer"
            },
            {
              type: "way",
              ref:  4,
              role: "outer"
            },
            {
              type: "way",
              ref:  5,
              role: "outer"
            },
            {
              type: "way",
              ref:  6,
              role: "outer"
            }
          ]
        },
        {
          type: "way",
          id:   1,
          nodes: [1,2]
        },
        {
          type: "way",
          id:   2,
          nodes: [2,3]
        },
        {
          type: "way",
          id:   3,
          nodes: [4,3]
        },
        {
          type: "way",
          id:   4,
          nodes: [5,4]
        },
        {
          type: "way",
          id:   5,
          nodes: [5,6]
        },
        {
          type: "way",
          id:   6,
          nodes: [1,6]
        },
        {
          type: "node",
          id:   1,
          lat:  1.0,
          lon:  0.0
        },
        {
          type: "node",
          id:   2,
          lat:  2.0,
          lon:  0.0
        },
        {
          type: "node",
          id:   3,
          lat:  3.0,
          lon:  0.0
        },
        {
          type: "node",
          id:   4,
          lat:  4.0,
          lon:  0.0
        },
        {
          type: "node",
          id:   5,
          lat:  5.0,
          lon:  0.0
        },
        {
          type: "node",
          id:   6,
          lat:  6.0,
          lon:  0.0
        }
      ]
    };
    result = osmtogeojson.toGeojson(json);
    expect(result.features).to.have.length(1);
    expect(result.features[0].properties.id).to.equal(1);
    expect(result.features[0].geometry.type).to.equal("MultiPolygon");
    expect(result.features[0].geometry.coordinates).to.have.length(1);
    expect(result.features[0].geometry.coordinates[0]).to.have.length(1);
    expect(result.features[0].geometry.coordinates[0][0]).to.have.length(7);
  });
  // unclosed rings
  it("multipolygon: unclosed ring", function() {
    // non-matching ways, unclosed rings
    json = {
      elements: [
        {
          type: "relation",
          tags: {"type": "multipolygon"},
          id:   1,
          members: [
            {
              type: "way",
              ref:  1,
              role: "outer"
            },
            {
              type: "way",
              ref:  2,
              role: "outer"
            }
          ]
        },
        {
          type: "way",
          id:   1,
          nodes: [1,2,3,4]
        },
        {
          type: "way",
          id:   2,
          nodes: [3,2]
        },
        {
          type: "node",
          id:   1,
          lat:  1.0,
          lon:  0.0
        },
        {
          type: "node",
          id:   2,
          lat:  2.0,
          lon:  0.0
        },
        {
          type: "node",
          id:   3,
          lat:  3.0,
          lon:  0.0
        },
        {
          type: "node",
          id:   4,
          lat:  4.0,
          lon:  0.0
        }
      ]
    };
    result = osmtogeojson.toGeojson(json);
    expect(result.features).to.have.length(1);
    expect(result.features[0].properties.id).to.equal(1);
    expect(result.features[0].geometry.type).to.equal("MultiPolygon");
    expect(result.features[0].geometry.coordinates).to.have.length(1);
    expect(result.features[0].geometry.coordinates[0]).to.have.length(1);
    expect(result.features[0].geometry.coordinates[0][0]).to.have.length(4);
    expect(result.features[0].properties.tainted).to.not.equal(true);
    // matching ways, but unclosed ring
    json = {
      elements: [
        {
          type: "relation",
          tags: {"type": "multipolygon"},
          id:   1,
          members: [
            {
              type: "way",
              ref:  1,
              role: "outer"
            },
            {
              type: "way",
              ref:  2,
              role: "outer"
            }
          ]
        },
        {
          type: "way",
          id:   1,
          nodes: [1,2]
        },
        {
          type: "way",
          id:   2,
          nodes: [2,3,4]
        },
        {
          type: "node",
          id:   1,
          lat:  1.0,
          lon:  0.0
        },
        {
          type: "node",
          id:   2,
          lat:  2.0,
          lon:  0.0
        },
        {
          type: "node",
          id:   3,
          lat:  3.0,
          lon:  0.0
        },
        {
          type: "node",
          id:   4,
          lat:  4.0,
          lon:  0.0
        }
      ]
    };
    result = osmtogeojson.toGeojson(json);
    expect(result.features).to.have.length(1);
    expect(result.features[0].properties.id).to.equal(1);
    expect(result.features[0].geometry.type).to.equal("MultiPolygon");
    expect(result.features[0].geometry.coordinates).to.have.length(1);
    expect(result.features[0].geometry.coordinates[0]).to.have.length(1);
    expect(result.features[0].geometry.coordinates[0][0]).to.have.length(4);
    expect(result.features[0].properties.tainted).to.not.equal(true);
  });
  // overpass area
  it("overpass area", function () {
    var json, geojson_properties;
    json = {
      elements: [
        {
          type: "area",
          id:   1,
        }
      ]
    };
    var result = osmtogeojson.toGeojson(json);
    expect(result.features).to.have.length(0);
  });

});

describe("defaults", function() {
  // interesting objects
  it("interesting objects", function () {
    var json, result;
    json = {
      elements: [
        {
          type: "way",
          id:   1,
          nodes: [1,2]
        },
        {
          type: "node",
          id:   1,
          tags: {"created_by": "foo"},
          lat:  1.0,
          lon:  0.0
        },
        {
          type: "node",
          id:   2,
          tags: {"interesting": "yes"},
          lat:  2.0,
          lon:  0.0
        }
      ]
    };
    var result = osmtogeojson.toGeojson(json);
    expect(result.features).to.have.length(2);
    expect(result.features[0].geometry.type).to.equal("LineString");
    expect(result.features[1].geometry.type).to.equal("Point");
    expect(result.features[1].properties.id).to.equal(2);
  });
  // interesting objects
  it("interesting objects: relation members", function() {
    // complex example containing a generic relation, several ways as well as
    // tagged, uninteresting and untagged nodes
    // see https://github.com/openstreetmap/openstreetmap-website/pull/283
    var xml;
    xml = '<osm version="0.6" generator="OpenStreetMap server" copyright="OpenStreetMap and contributors" attribution="http://www.openstreetmap.org/copyright" license="http://opendatacommons.org/licenses/odbl/1-0/">'+
            '<relation id="4294968148" visible="true" timestamp="2013-05-14T10:33:05Z" version="1" changeset="23123" user="tyrTester06" uid="1178">'+
              '<member type="way" ref="4295032195" role="line"/>'+
              '<member type="node" ref="4295668179" role="point"/>'+
              '<member type="node" ref="4295668178" role=""/>'+
              '<member type="way" ref="4295032194" role=""/>'+
              '<member type="way" ref="4295032193" role=""/>'+
              '<member type="node" ref="4295668174" role="foo"/>'+
              '<member type="node" ref="4295668175" role="bar"/>'+
              '<tag k="type" v="fancy"/>'+
            '</relation>'+
            '<way id="4295032195" visible="true" timestamp="2013-05-14T10:33:05Z" version="1" changeset="23123" user="tyrTester06" uid="1178">'+
              '<nd ref="4295668174"/>'+
              '<nd ref="4295668172"/>'+
              '<nd ref="4295668171"/>'+
              '<nd ref="4295668170"/>'+
              '<nd ref="4295668173"/>'+
              '<nd ref="4295668175"/>'+
              '<tag k="highway" v="residential"/>'+
            '</way>'+
            '<way id="4295032194" visible="true" timestamp="2013-05-14T10:33:05Z" version="1" changeset="23123" user="tyrTester06" uid="1178">'+
              '<nd ref="4295668177"/>'+
              '<nd ref="4295668178"/>'+
              '<nd ref="4295668180"/>'+
              '<tag k="highway" v="service"/>'+
            '</way>'+
            '<way id="4295032193" visible="true" timestamp="2013-05-14T10:33:04Z" version="1" changeset="23123" user="tyrTester06" uid="1178">'+
              '<nd ref="4295668181"/>'+
              '<nd ref="4295668178"/>'+
              '<nd ref="4295668176"/>'+
              '<tag k="highway" v="service"/>'+
            '</way>'+
            '<node id="4295668172" version="1" changeset="23123" lat="46.4910906" lon="11.2735763" user="tyrTester06" uid="1178" visible="true" timestamp="2013-05-14T10:33:04Z">'+
              '<tag k="highway" v="crossing"/>'+
            '</node>'+
            '<node id="4295668173" version="1" changeset="23123" lat="46.4911004" lon="11.2759498" user="tyrTester06" uid="1178" visible="true" timestamp="2013-05-14T10:33:04Z">'+
              '<tag k="created_by" v="foo"/>'+
            '</node>'+
            '<node id="4295668170" version="1" changeset="23123" lat="46.4909732" lon="11.2753813" user="tyrTester06" uid="1178" visible="true" timestamp="2013-05-14T10:33:04Z"/>'+
            '<node id="4295668171" version="1" changeset="23123" lat="46.4909781" lon="11.2743295" user="tyrTester06" uid="1178" visible="true" timestamp="2013-05-14T10:33:04Z"/>'+
            '<node id="4295668174" version="1" changeset="23123" lat="46.4914820" lon="11.2731001" user="tyrTester06" uid="1178" visible="true" timestamp="2013-05-14T10:33:04Z"/>'+
            '<node id="4295668175" version="1" changeset="23123" lat="46.4915603" lon="11.2765254" user="tyrTester06" uid="1178" visible="true" timestamp="2013-05-14T10:33:04Z"/>'+
            '<node id="4295668176" version="1" changeset="23123" lat="46.4919468" lon="11.2756726" user="tyrTester06" uid="1178" visible="true" timestamp="2013-05-14T10:33:04Z"/>'+
            '<node id="4295668177" version="1" changeset="23123" lat="46.4919664" lon="11.2753031" user="tyrTester06" uid="1178" visible="true" timestamp="2013-05-14T10:33:04Z"/>'+
            '<node id="4295668178" version="1" changeset="23123" lat="46.4921083" lon="11.2755021" user="tyrTester06" uid="1178" visible="true" timestamp="2013-05-14T10:33:04Z"/>'+
            '<node id="4295668179" version="1" changeset="23123" lat="46.4921327" lon="11.2742229" user="tyrTester06" uid="1178" visible="true" timestamp="2013-05-14T10:33:04Z"/>'+
            '<node id="4295668180" version="1" changeset="23123" lat="46.4922893" lon="11.2757152" user="tyrTester06" uid="1178" visible="true" timestamp="2013-05-14T10:33:04Z"/>'+
            '<node id="4295668181" version="1" changeset="23123" lat="46.4923235" lon="11.2752747" user="tyrTester06" uid="1178" visible="true" timestamp="2013-05-14T10:33:04Z"/>'+
          '</osm>'
    xml = (new DOMParser()).parseFromString(xml, 'text/xml');
    var result = osmtogeojson.toGeojson(xml);
    expect(result.features).to.have.length(8);
  });
  // polygon detection
  // see: http://wiki.openstreetmap.org/wiki/Overpass_turbo/Polygon_Features
  it("polygon detection", function () {
    var json, result;
    // basic tags: area=yes
    json = {
      elements: [
        {
          type: "way",
          id:   1,
          tags: {"foo":"bar", "area": "yes"},
          nodes: [1,2,3,1]
        },
        {
          type: "way",
          id:   2,
          tags: {"area": "yes"},
          nodes: [1,2,3]
        },
        {
          type: "node",
          id:   1,
          lat:  1.0,
          lon:  0.0
        },
        {
          type: "node",
          id:   2,
          lat:  2.0,
          lon:  0.0
        },
        {
          type: "node",
          id:   3,
          lat:  0.0,
          lon:  3.0
        }
      ]
    };
    result = osmtogeojson.toGeojson(json);
    expect(result.features).to.have.length(2);
    expect(result.features[0].geometry.type).to.equal("Polygon");
    expect(result.features[1].geometry.type).to.equal("LineString");
    // basic tags: area=no
    json = {
      elements: [
        {
          type: "way",
          id:   1,
          tags: {
            "area": "no",
            "building": "yes"
          },
          nodes: [1,2,3,1]
        },
        {
          type: "node",
          id:   1,
          lat:  1.0,
          lon:  0.0
        },
        {
          type: "node",
          id:   2,
          lat:  2.0,
          lon:  0.0
        },
        {
          type: "node",
          id:   3,
          lat:  0.0,
          lon:  3.0
        }
      ]
    };
    result = osmtogeojson.toGeojson(json);
    expect(result.features).to.have.length(1);
    expect(result.features[0].geometry.type).to.equal("LineString");
  });
});

describe("options", function () {
  // flattened properties output mode
  it("flattened properties", function () {
    var json, geojson_properties;
    json = {
      elements: [
        {
          type: "node",
          id:   1,
          tags: {"foo": "bar"},
          user: "johndoe",
          lat:  1.234,
          lon:  4.321
        }
      ]
    };
    geojson_properties= {
      id: "node/1",
      foo: "bar",
      user: "johndoe"
    };
    var result = osmtogeojson.toGeojson(json, {flatProperties: true});
    expect(result.features[0].properties).to.eql(geojson_properties);
  });
  // interesting objects
  it("uninteresting tags", function () {
    var json;
    json = {
      elements: [
        {
          type:  "way",
          id:    1,
          nodes: [2,3]
        },
        {
          type: "node",
          id:   2,
          tags: {"foo": "bar"},
          user: "johndoe",
          lat:  1.0,
          lon:  0.0
        },
        {
          type: "node",
          id:   3,
          tags: {"foo": "bar", "asd": "fasd"},
          user: "johndoe",
          lat:  2.0,
          lon:  0.0
        }
      ]
    };
    var result = osmtogeojson.toGeojson(json, {uninterestingTags: {foo:true}});
    expect(result.features).to.have.length(2);
    expect(result.features[1].properties.id).to.eql(3);
  });
  // interesting objects with custom callback
  it("uninteresting tags: callback", function () {
    var json, result;
    json = {
      elements: [
        {
          type: "way",
          id:   1,
          nodes: [1,2]
        },
        {
          type: "node",
          id:   1,
          tags: {"tag": "1"},
          lat:  1.0,
          lon:  0.0
        },
        {
          type: "node",
          id:   2,
          tags: {"tag": "2"},
          lat:  2.0,
          lon:  0.0
        }
      ]
    };
    var result = osmtogeojson.toGeojson(json, {uninterestingTags: function(tags, ignore_tags) {
      return tags["tag"] != "1";
    }});
    expect(result.features).to.have.length(2);
    expect(result.features[0].geometry.type).to.equal("LineString");
    expect(result.features[1].geometry.type).to.equal("Point");
    expect(result.features[1].properties.id).to.equal(1);
  });
  // polygon detection
  // see: http://wiki.openstreetmap.org/wiki/Overpass_turbo/Polygon_Features
  it("polygon detection", function () {
    var json, result;
    // custom tagging detection rules
    json = {
      elements: [
        {
          type: "way",
          id:   1,
          tags: {"is_polygon_key": "*"},
          nodes: [1,2,3,1]
        },
        {
          type: "way",
          id:   2,
          tags: {"is_polygon_key_value": "included_value"},
          nodes: [1,2,3,1]
        },
        {
          type: "way",
          id:   3,
          tags: {"is_polygon_key_excluded_value": "*"},
          nodes: [1,2,3,1]
        },
        {
          type: "way",
          id:   4,
          tags: {"is_polygon_key": "no"},
          nodes: [1,2,3,1]
        },
        {
          type: "way",
          id:   5,
          tags: {"is_polygon_key_value": "not_included_value"},
          nodes: [1,2,3,1]
        },
        {
          type: "way",
          id:   6,
          tags: {"is_polygon_key_excluded_value": "excluded_value"},
          nodes: [1,2,3,1]
        },
        {
          type: "node",
          id:   1,
          lat:  1.0,
          lon:  0.0
        },
        {
          type: "node",
          id:   2,
          lat:  2.0,
          lon:  0.0
        },
        {
          type: "node",
          id:   3,
          lat:  0.0,
          lon:  3.0
        }
      ]
    };
    result = osmtogeojson.toGeojson(json, {
      polygonFeatures: {
        "is_polygon_key": true,
        "is_polygon_key_value": {
          "included_values": {"included_value": true}
        },
        "is_polygon_key_excluded_value": {
          "excluded_values": {"excluded_value": true}
        }
      }
    });
    expect(result.features).to.have.length(6);
    expect(result.features[0].geometry.type).to.equal("Polygon");
    expect(result.features[1].geometry.type).to.equal("Polygon");
    expect(result.features[2].geometry.type).to.equal("Polygon");
    expect(result.features[3].geometry.type).to.equal("LineString");
    expect(result.features[4].geometry.type).to.equal("LineString");
    expect(result.features[5].geometry.type).to.equal("LineString");
  });
  // polygon detection with custom callback
  it("polygon detection: callback", function () {
    var json, result;
    json = {
      elements: [
        {
          type: "way",
          id:   1,
          tags: {"tag": "1"},
          nodes: [1,2,3,1]
        },
        {
          type: "way",
          id:   2,
          tags: {"tag": "2"},
          nodes: [1,2,3,1]
        },
        {
          type: "node",
          id:   1,
          lat:  1.0,
          lon:  0.0
        },
        {
          type: "node",
          id:   2,
          lat:  2.0,
          lon:  0.0
        },
        {
          type: "node",
          id:   3,
          lat:  0.0,
          lon:  3.0
        }
      ]
    };
    var result = osmtogeojson.toGeojson(json, {polygonFeatures: function(tags) {
      return tags["tag"] == "1";
    }});
    expect(result.features).to.have.length(2);
    expect(result.features[0].geometry.type).to.equal("Polygon");
    expect(result.features[1].geometry.type).to.equal("LineString");
  });
});

describe("tainted data", function () {
  // basic tainted geometries
  it("tainted geometries", function () {
    var json, geojson;
    json = {
      elements: [
        {
          type:  "way",
          id:    10,
          nodes: [2,3,5]
        },
        {
          type:  "way",
          id:    11,
          nodes: [2,3,4,5,2],
          tags:  {"area":"yes"}
        },
        {
          type:  "way",
          id:    12,
          nodes: [2,3,4,2],
        },
        {
          type:    "relation",
          id:      100,
          tags:    {"type":"multipolygon"},
          members: [
            {
              type: "way",
              ref:  12,
              role: "outer"
            },
            {
              type: "way",
              ref:  13,
              role: "inner"
            }
          ]
        },
        {
          type: "node",
          id:   2,
          lat:  1.0,
          lon:  0.0
        },
        {
          type: "node",
          id:   3,
          lat:  0.0,
          lon:  1.0
        },
        {
          type: "node",
          id:   4,
          lat:  1.0,
          lon:  1.0
        }
      ]
    };
    geojson = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          id: "way/12",
          properties: {
            type: "way",
            id: 12,
            tags: {},
            relations: [
              {
                rel: 100,
                role: "outer",
                reltags: {"type":"multipolygon"}
              }
            ],
            meta: {},
            tainted: true
          },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [0.0,1.0],
              [1.0,0.0],
              [1.0,1.0],
              [0.0,1.0]
            ]]
          }
        },
        {
          type: "Feature",
          id: "way/11",
          properties: {
            type: "way",
            id:   11,
            tags: {"area":"yes"},
            relations: [],
            meta: {},
            tainted: true
          },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [0.0,1.0],
              [1.0,0.0],
              [1.0,1.0],
              [0.0,1.0]
            ]]
          }
        },
        {
          type: "Feature",
          id: "way/10",
          properties: {
            type: "way",
            id: 10,
            tags: {},
            relations: [],
            meta: {},
            tainted: true
          },
          geometry: {
            type: "LineString",
            coordinates: [
              [0.0,1.0],
              [1.0,0.0]
            ]
          }
        }
      ]
    };
    var result = osmtogeojson.toGeojson(json);
    expect(result).to.eql(geojson);
  });
  // ignore missing node coordinates
  it("ids_only (missing coordinates or references)", function () {
    var json, result;
    json = {
      elements: [
        {
          type: "node",
          id:   1
        }
      ]
    };
    result = osmtogeojson.toGeojson(json);
    expect(result.features).to.have.length(0);
    json = {
      elements: [
        {
          type: "way",
          id:   1
        }
      ]
    };
    result = osmtogeojson.toGeojson(json);
    expect(result.features).to.have.length(0);
    json = {
      elements: [
        {
          type: "relation",
          id:   1
        }
      ]
    };
    result = osmtogeojson.toGeojson(json);
    expect(result.features).to.have.length(0);
  });
  // tainted way
  it("tainted way", function () {
    var json;
    json = {
      elements: [
        {
          type: "way",
          id:   1,
          nodes: [2,3,4]
        },
        {
          type: "node",
          id:   2,
          lat:  0.0,
          lon:  0.0
        },
        {
          type: "node",
          id:   4,
          lat:  1.0,
          lon:  1.0
        }
      ]
    };
    var result = osmtogeojson.toGeojson(json);
    expect(result.features).to.have.length(1);
    expect(result.features[0].properties.id).to.equal(1);
    expect(result.features[0].geometry.coordinates).to.eql([[0.0,0.0],[1.0,1.0]]);
    expect(result.features[0].properties.tainted).to.equal(true);
  });
  // invalid empty multipolygon
  it("empty multipolygon", function () {
    var json, result;
  });
  // tainted simple multipolygon
  it("tainted simple multipolygon", function () {
    var json, result;
    // missing way
    json = {
      elements: [
        {
          type: "relation",
          tags: {"type": "multipolygon"},
          id:   1,
          members: [
            {
              type: "way",
              ref:  2,
              role: "outer"
            },
            {
              type: "way",
              ref:  3,
              role: "inner"
            }
          ]
        },
        {
          type: "way",
          id:   2,
          nodes: [3,4,5,3]
        },
        {
          type: "node",
          id:   3,
          lat:  0.0,
          lon:  0.0
        },
        {
          type: "node",
          id:   4,
          lat:  0.0,
          lon:  1.0
        },
        {
          type: "node",
          id:   5,
          lat:  1.0,
          lon:  0.0
        }
      ]
    };
    result = osmtogeojson.toGeojson(json);
    expect(result.features).to.have.length(1);
    expect(result.features[0].properties.id).to.equal(2);
    expect(result.features[0].properties.tainted).to.equal(true);
    // missing nodes
    json = {
      elements: [
        {
          type: "relation",
          id:   1,
          tags: {"type":"multipolygon"},
          members: [
            {
              type: "way",
              ref:  2,
              role: "outer"
            }
          ]
        },
        {
          type: "way",
          id:   2,
          nodes: [3,4,5,3]
        }
      ]
    };
    result = osmtogeojson.toGeojson(json);
    expect(result.features).to.have.length(0);
    // missing node
    json = {
      elements: [
        {
          type: "relation",
          tags: {"type": "multipolygon"},
          id:   1,
          members: [
            {
              type: "way",
              ref:  2,
              role: "outer"
            }
          ]
        },
        {
          type: "way",
          id:   2,
          nodes: [3,4,5,6,3]
        },
        {
          type: "node",
          id:   3,
          lat:  0.0,
          lon:  0.0
        },
        {
          type: "node",
          id:   4,
          lat:  0.0,
          lon:  1.0
        },
        {
          type: "node",
          id:   5,
          lat:  1.0,
          lon:  0.0
        }
      ]
    };
    result = osmtogeojson.toGeojson(json);
    expect(result.features).to.have.length(1);
    expect(result.features[0].properties.id).to.equal(2);
    expect(result.features[0].properties.tainted).to.equal(true);
  });
  // tainted multipolygon
  it("tainted multipolygon", function () {
    var json, result;
    // missing way
    json = {
      elements: [
        {
          type: "relation",
          tags: {"type": "multipolygon"},
          id:   1,
          members: [
            {
              type: "way",
              ref:  2,
              role: "outer"
            },
            {
              type: "way",
              ref:  3,
              role: "outer"
            }
          ]
        },
        {
          type: "way",
          id:   2,
          nodes: [4,5,6,4]
        },
        {
          type: "node",
          id:   4,
          lat:  0.0,
          lon:  0.0
        },
        {
          type: "node",
          id:   5,
          lat:  0.0,
          lon:  1.0
        },
        {
          type: "node",
          id:   6,
          lat:  1.0,
          lon:  0.0
        }
      ]
    };
    result = osmtogeojson.toGeojson(json);
    expect(result.features).to.have.length(1);
    expect(result.features[0].properties.id).to.equal(1);
    expect(result.features[0].properties.tainted).to.equal(true);
    // missing node
    json = {
      elements: [
        {
          type: "relation",
          tags: {"type": "multipolygon"},
          id:   1,
          members: [
            {
              type: "way",
              ref:  2,
              role: "outer"
            },
            {
              type: "way",
              ref:  3,
              role: "outer"
            }
          ]
        },
        {
          type: "way",
          id:   2,
          nodes: [4,5,6,7,4]
        },
        {
          type: "way",
          id:   3,
          nodes: [4,5,6,4]
        },
        {
          type: "node",
          id:   4,
          lat:  0.0,
          lon:  0.0
        },
        {
          type: "node",
          id:   5,
          lat:  0.0,
          lon:  1.0
        },
        {
          type: "node",
          id:   6,
          lat:  1.0,
          lon:  0.0
        }
      ]
    };
    result = osmtogeojson.toGeojson(json);
    expect(result.features).to.have.length(1);
    expect(result.features[0].properties.id).to.equal(1);
    expect(result.features[0].properties.tainted).to.equal(true);
  });
  // degenerate multipolygon
  it("degenerate multipolygon", function () {
    // no coordinates
    var json, result;
    json = {
      elements: [
        {
          type: "relation",
          tags: {"type": "multipolygon"},
          id:   1,
          members: [
            {
              type: "way",
              ref:  2,
              role: "outer"
            },
            {
              type: "way",
              ref:  3,
              role: "outer"
            }
          ]
        },
        {
          type: "way",
          id:   2,
          nodes: [4,5,6]
        },
        {
          type: "way",
          id:   3,
          nodes: [6,4]
        }
      ]
    };
    result = osmtogeojson.toGeojson(json);
    expect(result.features).to.have.length(0);
    // no outer ring
    json = {
      elements: [
        {
          type: "relation",
          tags: {"type": "multipolygon"},
          id:   1,
          members: [
            {
              type: "way",
              ref:  2,
              role: "inner"
            }
          ]
        },
        {
          type: "way",
          id:   2,
          nodes: [3,4,5,3]
        },
        {
          type: "node",
          id:   3,
          lat:  0.0,
          lon:  0.0
        },
        {
          type: "node",
          id:   4,
          lat:  1.0,
          lon:  1.0
        },
        {
          type: "node",
          id:   5,
          lat:  1.0,
          lon:  0.0
        }
      ]
    };
    result = osmtogeojson.toGeojson(json);
    // expected behaviour: do not return a degenerate (multi)polygon.
    // this could in principle return just the way that is now sort of unused
    // but just as with an (untagged) node of a one-node-way we're going to
    // assume that those outlines aren't interesting enough.
    expect(result.features).to.have.length(0);
    // incomplete outer ring
    json = {
      elements: [
        {
          type: "relation",
          tags: {"type": "multipolygon"},
          id:   1,
          members: [
            {
              type: "way",
              ref:  2,
              role: "outer"
            },
            {
              type: "way",
              ref:  3,
              role: "outer"
            }
          ]
        },
        {
          type: "way",
          id:   2,
          nodes: [4,5,6,4]
        },
        {
          type: "node",
          id:   4,
          lat:  0.0,
          lon:  0.0
        },
        {
          type: "node",
          id:   5,
          lat:  1.0,
          lon:  1.0
        }
      ]
    };
    result = osmtogeojson.toGeojson(json);
    expect(result.features).to.have.length(0);
  });

});

describe("other", function () {
  // 
  it("sideeffects", function () {
    var json, json_before, json_after;
    json = {
      elements: [
        {
          type: "node",
          id:   1,
          tags: {"foo": "bar"},
          user: "johndoe",
          lat:  1.234,
          lon:  4.321
        },
        {
          type: "node",
          id:   2
        },
        {
          type:  "way",
          id:    1,
          nodes: [1,2,3]
        },
        {
          type:  "relation",
          id:    1,
          members: [{type: "way", ref:1},{type: "way", ref:2},{type: "node", ref:1}]
        }
      ]
    };
    json_before = JSON.stringify(json);
    osmtogeojson.toGeojson(json);
    json_after = JSON.stringify(json);
    expect(json_after).to.equal(json_before);
  });

});