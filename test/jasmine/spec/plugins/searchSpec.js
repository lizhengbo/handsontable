describe('Search plugin', function () {

  var id = 'testContainer';

  beforeEach(function () {
    this.$container = $('<div id="' + id + '"></div>').appendTo('body');
  });

  afterEach(function () {
    if (this.$container) {
      destroy();
      this.$container.remove();
    }
  });

  describe("enabling/disabling plugin", function () {
    it("should expose `search` object when plugin is enabled", function () {

      var hot = handsontable({
        search: true
      });

      expect(hot.search).toBeDefined();

    });

    it("should NOT expose `search` object when plugin is disabled", function () {

      var hot = handsontable({
        search: false
      });

      expect(hot.search).not.toBeDefined();

    });

    it("plugin should be disabled by default", function () {

      var hot = handsontable();

      expect(hot.search).not.toBeDefined();

    });

    it("should disable plugin using updateSettings", function () {

      var hot = handsontable({
        search: true
      });

      expect(hot.search).toBeDefined();

      updateSettings({
        search: false
      });

      expect(hot.search).not.toBeDefined();

    });

    it("should enable plugin using updateSettings", function () {

      var hot = handsontable({
        search: false
      });

      expect(hot.search).not.toBeDefined();

      updateSettings({
        search: true
      });

      expect(hot.search).toBeDefined();

    });
  });

  describe("query method", function () {
    it("should use the default query method if no queryMethod is passed to query function", function () {

      spyOn(Handsontable.Search, 'DEFAULT_QUERY_METHOD');

      var defaultQueryMethod = Handsontable.Search.DEFAULT_QUERY_METHOD;

      var hot = handsontable({
        data: createSpreadsheetData(5, 5),
        search: true
      });

      var searchResult = hot.search.query('A');

      expect(defaultQueryMethod.calls.length).toEqual(25);

    });

    it("should use the custom default query method if no queryMethod is passed to query function", function () {

      var customDefaultQueryMethod = jasmine.createSpy('customDefaultQueryMethod');


      var hot = handsontable({
        data: createSpreadsheetData(5, 5),
        search: true
      });
      hot.search.setDefaultQueryMethod(customDefaultQueryMethod);

      var searchResult = hot.search.query('A');

      expect(customDefaultQueryMethod.calls.length).toEqual(25);

    });


    it("should use method passed to query function", function () {

      var customQueryMethod = jasmine.createSpy('customQueryMethod');

      var hot = handsontable({
        data: createSpreadsheetData(5, 5),
        search: true
      });

      var searchResult = hot.search.query('A', null, customQueryMethod);

      expect(customQueryMethod.calls.length).toEqual(25);

    });
  });

  describe("default query method", function () {

    it("should use query method to find phrase", function () {
      var hot = handsontable({
        data: createSpreadsheetData(5, 5),
        search: true
      });

      var searchResult = hot.search.query('A');

      expect(searchResult.length).toEqual(5);

      for(var i = 0; i < searchResult.length; i++){
        expect(searchResult[i].row).toEqual(i);
        expect(searchResult[i].col).toEqual(0);
        expect(searchResult[i].data).toEqual(hot.getDataAtCell(i, 0));
      }

    });

    it("default query method should be case insensitive", function () {
      var hot = handsontable({
        data: createSpreadsheetData(5, 5),
        search: true
      });

      var searchResult = hot.search.query('a');

      expect(searchResult.length).toEqual(5);

      searchResult = hot.search.query('A');

      expect(searchResult.length).toEqual(5);

    });

    it("default query method should interpret query as string, not regex", function () {
      var hot = handsontable({
        data: createSpreadsheetData(5, 5),
        search: true
      });

      var searchResult = hot.search.query('A*');

      expect(searchResult.length).toEqual(0);

    });

  });


  describe("search callback", function () {

    it("should invoke default callback for each cell", function () {

      spyOn(Handsontable.Search, 'DEFAULT_CALLBACK');

      var hot = handsontable({
        data: createSpreadsheetData(5, 5),
        search: true
      });

      var searchResult = hot.search.query('A');

      expect(Handsontable.Search.DEFAULT_CALLBACK.calls.length).toEqual(25)

    });

    it("should change the default callback", function () {

      spyOn(Handsontable.Search, 'DEFAULT_CALLBACK');

      var hot = handsontable({
        data: createSpreadsheetData(5, 5),
        search: true
      });

      var defaultCallback = jasmine.createSpy('defaultCallback');
      hot.search.setDefaultCallback(defaultCallback);

      var searchResult = hot.search.query('A');

      expect(Handsontable.Search.DEFAULT_CALLBACK).not.toHaveBeenCalled();
      expect(defaultCallback.calls.length).toEqual(25);

    });

    it("should invoke custom callback for each cell which has been tested", function () {
      var hot = handsontable({
        data: createSpreadsheetData(5, 5),
        search: true
      });

      var searchCallback = jasmine.createSpy('searchCallback');

      var searchResult = hot.search.query('A', searchCallback);

      expect(searchCallback.calls.length).toEqual(25)

      for(var rowIndex = 0, rowCount = countRows(); rowIndex < rowCount; rowIndex++){
        for (var colIndex = 0, colCount = countCols(); colIndex < colCount; colIndex++){
          var callArgs = searchCallback.calls[rowIndex * 5 + colIndex].args;
          expect(callArgs[0]).toEqual(hot);
          expect(callArgs[1]).toEqual(rowIndex);
          expect(callArgs[2]).toEqual(colIndex);
          expect(callArgs[3]).toEqual(hot.getDataAtCell(rowIndex, colIndex));

          if (colIndex == 0){
            expect(callArgs[4]).toBe(true);
          } else {
            expect(callArgs[4]).toBe(false);
          }

        }

      }

    });

  });

  describe("default search callback", function () {
    it("should add isSearchResult = true, to cell properties of all matched cells", function () {
      var hot = handsontable({
        data: createSpreadsheetData(5, 5),
        search: true
      });

      var searchResult = hot.search.query('1');

      for (var rowIndex = 0, rowCount = countRows(); rowIndex < rowCount; rowIndex++){
        for (var colIndex = 0, colCount = countCols(); colIndex < colCount; colIndex++){

          var cellProperties = getCellMeta(rowIndex, colIndex);

          if (rowIndex == 1){
            expect(cellProperties.isSearchResult).toBeTruthy();
          } else {
            expect(cellProperties.isSearchResult).toBeFalsy();
          }
        }
      }

    });
  });

  describe("search result decorator", function () {
    it("should add default search result class to cells which mach the query", function () {

      var hot = handsontable({
        data: createSpreadsheetData(5, 5),
        search: true
      });

      var searchResult = hot.search.query('1');

      render();

      for (var rowIndex = 0, rowCount = countRows(); rowIndex < rowCount; rowIndex++){
        for (var colIndex = 0, colCount = countCols(); colIndex < colCount; colIndex++){

          var cell = getCell(rowIndex, colIndex);

          if (rowIndex == 1 ){
            expect($(cell).hasClass(Handsontable.SearchCellDecorator.DEFAULT_SEARCH_RESULT_CLASS)).toBe(true);
          } else {
            expect($(cell).hasClass(Handsontable.SearchCellDecorator.DEFAULT_SEARCH_RESULT_CLASS)).toBe(false);
          }
        }
      }

    });

    it("should add custom search result class to cells which mach the query", function () {

      var hot = handsontable({
        data: createSpreadsheetData(5, 5),
        search: true,
        searchResultClass: 'customSearchResultClass'
      });

      var searchResult = hot.search.query('1');

      render();

      for (var rowIndex = 0, rowCount = countRows(); rowIndex < rowCount; rowIndex++){
        for (var colIndex = 0, colCount = countCols(); colIndex < colCount; colIndex++){

          var cell = getCell(rowIndex, colIndex);

          if ( rowIndex == 1 ){
            expect($(cell).hasClass('customSearchResultClass')).toBe(true);
          } else {
            expect($(cell).hasClass('customSearchResultClass')).toBe(false);
          }
        }
      }

    });
  });
});