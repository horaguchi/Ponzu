/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
  // Application Constructor
  initialize: function() {
    this.bindEvents();
  },
  // Bind Event Listeners
  //
  // Bind any events that are required on startup. Common events are:
  // 'load', 'deviceready', 'offline', and 'online'.
  bindEvents: function() {
    document.addEventListener('deviceready', this.onDeviceReady, false);
  },
  // deviceready Event Handler
  //
  // The scope of 'this' is the event. In order to call the 'receivedEvent'
  // function, we must explicitly call 'app.receivedEvent(...);'
  onDeviceReady: function() {
    app.receivedEvent('deviceready');
  },
  // Update DOM on a Received Event
  receivedEvent: function(id) {
    console.log('Received Event: ' + id);
    var screen = document.getElementById('screen');
    var context = screen.getContext("2d");
    context.font="10px Monospace";

    var k = 0;
    var newMap = function () {
      var map = [];
      ++k;
      for (var i = 0; i < 20; ++i) {
        var row = [];
        for (var j = 0; j < 80; ++j) {
          row.push( (i + j + k) % 30 == 0 ? '+' : '.' );
        }
        map.push(row);
      }
      return map;
    }

    var map = newMap();
    var d1 = new Date;
    var t = setInterval(function () {
      var old_map = map;
      map = newMap();
      for (var y = 0; y < 20; ++y) {
        for (var x = 0; x < 80; ++x) {
          var str = map[y][x];
          if (str == old_map[y][x]) {
            continue;
          }
          context.clearRect(5 * x, 10 * y, 5, 10);
          if (str == '+') {
            context.fillStyle = 'red';
          } else {
            context.fillStyle = 'black';
          }
          context.fillText(str, 5 * x, 10 * (y + 1));
        }
      }

      if (k > 1000) {
        clearInterval(t);
        var d2 = new Date;
        context.clearRect(0, 0, 400, 10);
        context.fillText(parseInt(1000000 / (d2.getTime() - d1.getTime())), 10, 10);
        console.log('Done: ' + d1 + ' ' + d2);
      }
    }, 0); 
  }
};

app.initialize();