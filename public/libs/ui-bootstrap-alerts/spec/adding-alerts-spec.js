describe('adding alerts', function() {
  beforeEach(function() {
    module('ui.bootstrap.alerts');

    inject(function($injector) {
      alertService = $injector.get('alertService');
    });
  });

  describe('general', function() {
    it('should add an error to the general alerts object', function(){
      alertService.error('Some Error');

      generalalerts = alertService.alerts.general
      expect(generalalerts[0].message).toBe('Some Error');
      expect(generalalerts[0].type).toBe('error');
    });

    it('should add an info to the general alerts object', function(){
      alertService.info('Some info');

      generalalerts = alertService.alerts.general
      expect(generalalerts[0].message).toBe('Some info');
      expect(generalalerts[0].type).toBe('info');
    });

    it('should add a warning to the general alerts object', function(){
      alertService.warning('Some warning');

      generalalerts = alertService.alerts.general
      expect(generalalerts[0].message).toBe('Some warning');
      expect(generalalerts[0].type).toBe('warning');
    });

    it('should add a success to the general alerts object', function(){
      alertService.success('Some success');

      generalalerts = alertService.alerts.general
      expect(generalalerts[0].message).toBe('Some success');
      expect(generalalerts[0].type).toBe('success');
    });
  });

  describe('special context \'foo\'', function() {
    it('should add an error to a context', function(){
      alertService.context('foo').error('Some Error');

      fooalerts = alertService.alerts.foo
      expect(fooalerts[0].message).toBe('Some Error');
      expect(fooalerts[0].type).toBe('error');
    });

    it('should add an info to a context', function(){
      alertService.context('foo').info('Some info');

      fooalerts = alertService.alerts.foo
      expect(fooalerts[0].message).toBe('Some info');
      expect(fooalerts[0].type).toBe('info');
    });

    it('should add a warning to a context', function(){
      alertService.context('foo').warning('Some warning');

      fooalerts = alertService.alerts.foo
      expect(fooalerts[0].message).toBe('Some warning');
      expect(fooalerts[0].type).toBe('warning');
    });

    it('should add a success to a context', function(){
      alertService.context('foo').success('Some success');

      fooalerts = alertService.alerts.foo
      expect(fooalerts[0].message).toBe('Some success');
      expect(fooalerts[0].type).toBe('success');
    });
  });

  describe('adding more than one', function() {
    it('should add two different errors', function(){
      alertService.context('foo').error('Some Error');
      alertService.context('foo').error('Another Error');

      expect(alertService.alerts.foo.length).toBe(2)
    })
  })

});
