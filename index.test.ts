import mittee, { Mittee } from '.';
import chai, { expect } from 'chai';
import { spy } from 'sinon';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);

describe('mittee', () => {
  it('should default export be a function', () => {
    expect(mittee).to.be.a('function');
  });

  it('should accept an optional event handler map', () => {
    expect(() => mittee(new Map())).not.to.throw;
    const map = new Map();
    const a = spy();
    const b = spy();
    map.set('foo', [a, b]);
    const events = mittee(map);
    events.emit('foo');
    expect(a).to.have.been.calledOnce;
    expect(b).to.have.been.calledOnce;
  });
});

describe('mittee -> ', () => {
  let eventMap, mit: Mittee;

  beforeEach(() => {
    eventMap = new Map();
    mit = mittee(eventMap);
  });

  describe('on()', () => {
    it('should be a function', () => {
      expect(mit).to.have.property('on').that.is.a('function');
    });

    it('should register handler for new event name', () => {
      const fn = () => {};
      mit.on('fn', fn);
      expect(eventMap.get('fn')).to.deep.equal([fn]);
    });

    it('can take symbols for event name', () => {
      const fn = () => {};
      const evtName = Symbol('fn');
      mit.on(evtName, fn);
      expect(eventMap.get(evtName)).to.deep.equal([fn]);
    });
  });

  describe('once()', () => {
    it('should be a function', () => {
      expect(mit).to.have.property('once').that.is.a('function');
    });

    it('should register handler for new event name that invoke once', () => {
      const fn = () => {};
      mit.once('once', fn);
      mit.emit('once', 'mittee');
      expect(eventMap.get('once')).to.be.empty;
    });
  });

  describe('off()', () => {
    it('should be a function', () => {
      expect(mit).to.have.property('off').that.is.a('function');
    });

    it('should remove handler for event name', () => {
      const fn = () => {};
      mit.on('fn', fn);
      mit.off('fn', fn);
      expect(eventMap.get('fn')).to.be.empty;
    });
  });

  describe('emit()', () => {
    it('should be a function', () => {
      expect(mit).to.have.property('emit').that.is.a('function');
    });

    it('should invoke handler for event name', () => {
      const evt = { a: 'b' };
      mit.on('fn', (a, b?) => {
        expect(a).to.be.equal(evt);
        expect(b).to.be.undefined;
      });
      mit.emit('fn', evt);
    });

    it('should invoke * handlers', () => {
      const sy = spy(), evt = { a: 'b' };
      eventMap.set('*', [sy]);
      mit.emit('not-registered', evt);
      expect(sy).to.have.been.calledOnce.and.calledWith('not-registered', evt);
    });
  });
});
