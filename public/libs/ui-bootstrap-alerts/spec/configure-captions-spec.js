describe('configure captions', function() {
  beforeEach(function() {
    module('ui.bootstrap.alerts');

    inject(function($injector) {
      alertService = $injector.get('alertService');
    });
  });

  describe('defaults', function() {
    it('should be "Error" for errors', function(){
      expect(alertService.error('Some Error').title).toBe("Error");
    });
  });

  describe('own configuration', function() {
    beforeEach(function() {
      alertService.titleMap = {
        error: "Fehler",
        warning: "Warnung",
        success: "",
        info: "Info"
      };
    });

    it('should be "Error" for errors', function(){
      expect(alertService.error('Some Error').title).toBe("Fehler");
    });
  });
});
