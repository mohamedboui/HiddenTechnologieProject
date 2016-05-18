describe('removing alerts', function() {
  beforeEach(function() {
    module('ui.bootstrap.alerts');

    inject(function($injector) {
      alertService = $injector.get('alertService');
    });
  });

  describe('general', function() {
    it('should remove an error from the general alerts object', function(){
      alert = alertService.error('Some Error');
      
      expect(alertService.alerts.general.length).toBe(1);
      alertService.remove(alert);
      expect(alertService.alerts.general.length).toBe(0);
    });
  });

  describe('special context \'foo\'', function() {
    it('should remove an error from the context', function(){
      alert = alertService.context('foo').error('Some Error');

      expect(alertService.alerts.foo.length).toBe(1);
      alertService.context('foo').remove(alert);
      expect(alertService.alerts.foo.length).toBe(0);
    });
    it('should return false if remove fails', function(){
      alert = alertService.context('foo').error('Some Error');
      expect(alertService.context('bar').remove(alert)).toBe(false);
    });
  });
});
