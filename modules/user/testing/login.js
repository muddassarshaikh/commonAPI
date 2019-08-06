const mocha = require('mocha');
const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const user = require('../user');
const app = require('../../../app');
const should = chai.should();
const message = require('../../common/message');

describe('User Module', () => {
  describe('"login functionality"', () => {
    // Checking whether the functionality is being export
    it('should export a function', () => {
      expect(user.userService().login).to.be.a('function');
    });

    // Checking whether the functionality return promise
    it('should return a promise', () => {
      const checkPromiseResult = user.userService().login();
      expect(checkPromiseResult.then).to.be.a('Function');
      expect(checkPromiseResult.catch).to.be.a('Function');
    });

    it('should return a failure', async () => {
      const loginDetails = await user.userService().login({
        emailAddress: 'shaikh.muddassar11@gmail.com',
        userPassword: '12345678'
      });
      if (
        loginDetails.message === message.invalidLoginDetails ||
        loginDetails.message === message.accountDisable ||
        loginDetails.message === message.emailVerify
      ) {
        expect(loginDetails.code).to.be.equal('01');
      } else {
        console.log(loginDetails.message);
        expect(loginDetails.code).to.be.equal('04');
      }
    });

    it('should return a success if credential is valid', async () => {
      const loginDetails = await user.userService().login({
        emailAddress: 'shaikh.muddassar8@gmail.com',
        userPassword: '123456789'
      });
      expect(loginDetails.code).to.be.equal('00');
    });
  });
});

// Need to study
// it('Should return failure if credential is not valid', done => {
//   request(app)
//     .post('/api/user/login')
//     .send({ username: 'shaikh.muddassar8@gmail.com', password: '12345678' })
//     .end((err, res) => {
//       if (err) throw err;
//       res.body.code.should.be.eql('01');
//       // res.body.should.have.property('message');
//     });
//   done();
// });
