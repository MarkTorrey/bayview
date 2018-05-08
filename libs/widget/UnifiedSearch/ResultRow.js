define([
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'dojo/Evented',

  'dojo/_base/declare',
  'dojo/_base/lang',

  'dojo/on',
  'dojo/dom-class',
  'dojo/dom-construct',
  'dojo/dom-attr',
  'dojo/dom-style',
  'dojo/mouse',

  'esri/graphic',
  'esri/geometry/Extent',
  'esri/geometry/Point',
  'esri/geometry/Polyline',
  'esri/symbols/PictureMarkerSymbol',
  'esri/symbols/SimpleMarkerSymbol',

  'dijit/form/Button',

  'dojo/text!./templates/ResultRow.html'
], function(
  _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented,
  declare, lang,
  on, domClass, domConstruct, domAttr, domStyle, mouse,
  Graphic, Extent, Point, Polyline, PictureMarkerSymbol, esriSMS,
  Button,
  template
) {
  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented], {

    templateString: template,

    // Properties to be sent into constructor
    constructor: function(options) {
      this.mapPin = null;
    },

    postCreate: function() {
      this.inherited(arguments);
      var inputValue = this.inputValue || '';
      var hasAction = this.hasAction || false;

      var regex = new RegExp('(' + this.inputValue + ')', 'gi');
      var formattedLabel = this.resultObj.label.replace(regex, '<strong>$1</strong>');

      domClass.add(this.resultIcon, this.resultObj.iconClass);
      this.resultLabel.innerHTML = formattedLabel;

      //var featureExtent = this._getExtent(this.resultObj.extent);
      var featureExtent = this.resultObj.extent;
      if (featureExtent !== null && featureExtent !== '') {
        var pinSymbol = new esriSMS({
          "type": "esriSMS",
           "style": "esriSMSSquare",
           "color": [76, 115, 0, 50],
           "size": 12,
           "angle": 0,
           "xoffset": 0,
           "yoffset": 0,
           "outline": 
            {
            "color": [152, 230, 0, 255],
             "width": 1.25
            }
          });
        this.mapPin = new Graphic(featureExtent, pinSymbol);
      }

      // hook up events
      this.own(on(this.resultIcon, 'click', lang.hitch(this, function() {
        this.emit('iconclicked', {
          'resultObj': this.resultObj,
          'feature': this.resultObj.obj
        });
      })));

      // event: result item click
      this.own(on(this.resultItem, 'click', lang.hitch(this, function() {
        this.emit('itemclicked', {
          'resultObj': this.resultObj
        });
      })));

      // event: add button click
      this.own(on(this.btnSubmit, 'click', lang.hitch(this, function() {
        this.emit('actionclicked', {
          'resultObj': this.resultObj
        });
      })));

      // MOUSE HOVER
      this.own(on(this.resultItem, mouse.enter, lang.hitch(this, function(event) {
        if (this.map && this.mapPin) {
          this.map.graphics.add(this.mapPin);
        }
      })));
      this.own(on(this.resultItem, mouse.leave, lang.hitch(this, function(event) {
        if (this.map && this.mapPin) {
          this.map.graphics.remove(this.mapPin);
        }
      })));

      this.toggleActionButton(hasAction);
    },

    getId: function() {
      return this.resultObj.oid;
    },

    getResultObj: function() {
      return this.resultObj;
    },

    getFeature: function() {
      return this.resultObj.obj;
    },

    showLoading: function() {
      domClass.remove(this.resultIcon);
      domClass.add(this.resultIcon, 'search-results-icon fa fa-refresh fa-spin');
    },

    hideLoading: function() {
      domClass.remove(this.resultIcon);
      domClass.add(this.resultIcon, 'search-results-icon ' + this.resultObj.iconClass);
    },

    toggleActionButton: function(hasAction) {
      if (hasAction) {
        domStyle.set(this.resultAction, 'display', 'block');
      } else {
        domStyle.set(this.resultAction, 'display', 'none');
      }
    }

  });
});
