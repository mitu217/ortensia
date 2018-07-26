const proxyquire = require('proxyquire');
const httpMocks  = require('node-mocks-http');
const sinon      = require('sinon');
const chai       = require('chai');
const sinonChai = require('sinon-chai');

describe('Firebase Functions', () => {
    let haruka, sandbox, expect;

    before(() => {
        haruka  = proxyquire('../lib/haruka', {});
        sandbox = sinon.createSandbox();
        expect  = chai.use(sinonChai).expect
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
            haruka.fetchAction(request, response);
            expect(response.statusCode).to.equal(200);
        })
    });
});