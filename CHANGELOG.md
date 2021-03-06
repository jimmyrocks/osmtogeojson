1.5.0 (dev)
-----
* simpler API (module exports as a plain function), old `.toGeojson` still available as a fallback
* further speed improvements

1.4.0
-----
* fix various speed bottlenecks (xml parsing, geojson construction, …)
* better performance when handling large xml files with the cli tool: ![](https://f.cloud.github.com/assets/1927298/1461813/4a1ce53e-44ce-11e3-9a96-d600eb3aba9b.png)

1.3.1
-----
* add --help and --version parameters to cli tool
* fix bug with not automatically detected file formats in pipe mode (cli tool)

1.3.0
-----
* more versatile cli tool (can read osm json, optionally enhanced output)
* many more unit tests
* fixed bugs with some partially incomplete data

1.2.1
-----
* fix wrong (inverse) logic in uninterestingTags callback evaluation (backported from master)

1.2.0
-----
* add [demo](http://tyrasd.github.io/osmtogeojson/) page
* support for pipes in cli tool: `echo '<osm><node lat="1.23" lon="3.21" id="-1" /></osm>' | osmtogeojson`
* add flat-properties output mode (default for the cli tool)
* add options to override default `uninterestingTags` and `polygonFeatures`
* better documentation
* more test cases
* further improvements in polygon feature detection

1.1.1
-----
* bugfix: remove unneeded debugging code

1.1.0
-----
* command line tool added

1.0.0
-----
* initial release
