const proxyquire = require('proxyquire');
const httpMocks  = require('node-mocks-http');
const sinon      = require('sinon');
const chai       = require('chai');
const sinonChai = require('sinon-chai');

describe('Firebase Functions', () => {
    let triggers, sandbox, expect;

    before(() => {
        triggers      = proxyquire('../lib/triggers', {});
        sandbox       = sinon.createSandbox();
        expect        = chai.use(sinonChai).expect
    });

    beforeEach(() => {
        sandbox.restore();
    })

    describe('scraping', () => {
        it ('should response 200', () => {
            var request  = httpMocks.createRequest({
                method: 'GET',
                url: `/haruka`
            });
            var response = httpMocks.createResponse();
            triggers.scraping(request, response);
            expect(response.statusCode).to.equal(200);
        })
    });
});